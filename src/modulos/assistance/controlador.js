const moment = require('moment-timezone');
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableParameterization = 'parametrizacion'; 
const tableTypeMarking='tipomarcaciones'; 
const tableAddress = 'direcciones';
moment.tz.setDefault('America/Lima');

module.exports = function(dbInyectada){
    let message = ""

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    
    async function addMarking(body){
        let initialDate =  moment();
        let day = initialDate.format('DD'); 
        let month = initialDate.format('MM'); 
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`; 
        const formattedTime = `${hour}:${minutes}`;
        const radiusMeters = 50;

        const parametrization = await db.getTableParametrization(tableParameterization, body.idTypesMarking);
        function validateTime(formattedTime) {
            const [hour, minutes] = formattedTime.split(':'); 
            for (const fila of parametrization) {
                const [startTime, minutesHome] = fila.HoraInicio.split(':'); 
                const [endTime, minutesEnd] = fila.HoraFin.split(':'); 
                const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
                const startTimeInMinutes = parseInt(startTime) * 60 + parseInt(minutesHome);
                const hourEndInMinutes = parseInt(endTime) * 60 + parseInt(minutesEnd);

                if (hourInMinutes >= startTimeInMinutes && hourInMinutes <= hourEndInMinutes) {
                    const idValidacion = fila.idValidacion;
                    return idValidacion
                }
            }
            return 0; 
        }

        const data = await db.query(tableUser, {IdUsuarios: body.idUser});
        if (!data) {
            message ='Usuario incorrecto'
            return {"messages": message}
        }
        const workModality = await db.queryModalityValidation(tableUser, {IdUsuarios: body.idUser});
        if (!workModality){        
            const locations = await db.compareLocation(tableUser,tableAddress,body.idUser,body.latitude,body.latitude,body.longitude,radiusMeters,body.idUser,body.latitude,body.latitude,body.longitude,radiusMeters)
        
            if (locations.length > 0) {
                const firstLocationResult = locations[0];
                const idAddress = firstLocationResult.IdDireccion;
                const nameAddress = firstLocationResult.Direccion

                const resultValidation = validateTime(formattedTime);
                
                let descriptionValidation = '';
                if (resultValidation === 0) {
                    message ='Horario no permitido.'
                    return {"messages": message}
                } else if (resultValidation === 1) {
                    descriptionValidation = 'Conforme';
                } else if (resultValidation === 2) {
                    descriptionValidation = 'Tardanza';
                } else if (resultValidation === 3) {
                    descriptionValidation = 'Falta';
                } 

                const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist,tableTypeMarking, body.idUser,date, body.idTypesMarking);

                var alreadyMarked = false;
                if (userAlreadyMarked.length>0){
                    alreadyMarked = true    
                }else{
                    alreadyMarked = false
                }
                if (alreadyMarked) {
                    message =`Usted ya ha registrado su ${userAlreadyMarked[0].descripcion.toLowerCase()} hoy.`
                    return {"messages": message}
                }
                const assists = {
                    IdAsistencias:body.id,
                    IdUsuarios: body.idUser,
                    IdDirec: idAddress,
                    Fecha: date,
                    Hora: formattedTime,
                    idTMarcacion: body.idTypesMarking ,
                    idValidacion: resultValidation,
                    Created_at: date,
                    Created_by: body.idUser,
                    Updated_at: '0000-00-00',
                    Updated_by: 0,
                } 
                
                const respuesta = await db.add(tableAssist, assists);
                
                return {"Registrado como": descriptionValidation, "Ubicación": nameAddress}
            }
            message ='Fuera del rango de la ubicación.'
            return {"messages": message}
        }
        const resultValidation = validateTime(formattedTime);
            
        let descriptionValidation = '';
        if (resultValidation === 0) {
            message ='Horario no permitido.'
            return {"messages": message}
        } else if (resultValidation === 1) {
            descriptionValidation = 'Conforme';
        } else if (resultValidation === 2) {
            descriptionValidation = 'Tardanza';
        } else if (resultValidation === 3) {
            descriptionValidation = 'Falta';
        } 

        const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist,tableTypeMarking ,body.idUser,date, body.idTypesMarking);
        console.log(userAlreadyMarked)
        var alreadyMarked = false;
        if (userAlreadyMarked.length>0){
            alreadyMarked = true    
        }else{
            alreadyMarked = false
        }
        if (alreadyMarked) {
            message =`Usted ya ha registrado su ${userAlreadyMarked[0].descripcion.toLowerCase()} hoy.`
            return {"messages": message}
        }
        const assists = {
            IdAsistencias:body.id,
            IdUsuarios: body.idUser,
            Fecha: date,
            Hora: formattedTime,
            idTMarcacion: body.idTypesMarking ,
            idValidacion: resultValidation,
            Created_at: date,
            Created_by: body.idUser,
            Updated_at: '0000-00-00',
            Updated_by: 0,
        } 
        const respuesta = await db.add(tableAssist, assists);
        return {"Registrado como": descriptionValidation, "Ubicación": 'Ubicación remota'}     
    }

    async function update(body){

        let user = body.username || '';
        let password = body.password || '';
        const marking = {
            IdUsuarios:body.idUser,
            Fecha: body.date,
            Hora: body.hour,
            idTMarcacion:body.idTypesMarking ,
            idValidacion:body.idValidacion,
            
        } 
        const modificationMarking ={
            Hora: body.hour,
            idTMarcacion:body.idTypesMarking ,
            idValidacion:body.idValidacion,
            Updated_by: body.idUserModified,
            Updated_at: date,           
        }
        if(body.IdRol == 1){
            const response = await db.queryUpdateAssists(tableAssist,modificationMarking,marking); 
            return response;
        }else{
            message ='No tienes permiso para modificar.'
            return {"messages": message}
        }
    }
    return {
        addMarking,
        update,
    }
}
