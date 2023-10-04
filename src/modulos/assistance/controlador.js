const moment = require('moment-timezone');
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableParameterization = 'parametrizacion'; 
const tableAddress = 'direcciones';
moment.tz.setDefault('America/Lima');

module.exports = function(dbInyectada){
    let initialDate =  moment();
    let day = initialDate.format('DD'); 
    let month = initialDate.format('MM'); 
    let age = initialDate.format('YYYY');

    let hour = initialDate.format('HH');
    let minutes = initialDate.format('mm');
    let segundos = initialDate.format('ss'); 
    let date = `${age}-${month}-${day}`; 

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    
    async function addMarking(body){
        const data = await db.query(tableUser, {IdUsuarios: body.idUser});
        if (!data) {
            throw new Error("Usuario incorrecto");
        }else{

            const radiusMeters = 50;
            const locations = await db.compareLocation(tableUser,tableAddress,body.idUser,body.latitude,body.latitude,body.longitude,radiusMeters,body.idUser,body.latitude,body.latitude,body.longitude,radiusMeters)

            if (locations.length > 0) {
                const firstLocationResult = locations[0];
                const idAddress = firstLocationResult.IdDireccion;
                const nameAddress = firstLocationResult.Direccion
                const parametrization = await db.getTableParametrization(tableParameterization, body.idTypesMarking);
                const formattedTime = `${hour}:${minutes}`;
        
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
                                switch (idValidacion) {
                                case 1:
                                    return 1;
                                case 2:
                                    return 2;
                                default:
                                    return 3; // Manejo de otros casos
                                }
                        }
                    }
                        return 0;
                }
                const resultValidation = validateTime(formattedTime);
                let idValidation = '';
                if (resultValidation === 0) {
                    idValidation = 'Estás marcando en un horario no permitido';
                    throw new Error(idValidation)
                } else if (resultValidation === 1) {
                    idValidation = 'Conforme';
                } else if (resultValidation === 2) {
                    idValidation = 'Tardanza';
                } else if (resultValidation === 3) {
                    idValidation = 'Falta';
                } 

                const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist, body.idUser,date, body.idTypesMarking);

                var alreadyMarked = false;
                if (userAlreadyMarked.length>0){
                    alreadyMarked = true    
                }else{
                    alreadyMarked = false
                }
                if (alreadyMarked) {
                    throw new Error(`El usuario ya marcó hoy en este tipo de marcación ${body.idTypesMarking}`);
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
               
                return {"Registrado como": idValidation, "Ubicación": nameAddress}
            }else{
               
                let mensajeUbicacion = 'Estas fuera del rango de la ubicación';
                throw new Error(mensajeUbicacion)
            }   
        }
    }

    async function actualizar(body){

        let user = body.usuario || '';
        let password = body.contraseña || '';
        const Marcacion = {
            IdUsuarios:body.idUser,
            Fecha: body.Fecha,
            Hora: body.Hora,
            idTMarcacion:body.idTypesMarking ,
            idValidacion:body.idValidacion,
            
        } 
        const Modificacion ={
            Hora: body.Hora,
            idTMarcacion:body.idTypesMarking ,
            idValidacion:body.idValidacion,
            Updated_by: body.IdUsuariosM,
            Updated_at: date,           
        }
        if(body.IdRol == 1){
            const respuesta = await db.actualizarMarca(tableAssist,Modificacion,Marcacion); 
            return respuesta;
        }else{
            throw new Error("No tienes permiso para modificar");
        }
    }
    return {
        addMarking,
        actualizar,
    }
}
