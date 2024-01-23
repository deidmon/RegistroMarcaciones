const moment = require('moment-timezone');
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableSchedule = 'horarios';
const tableTypeMarking = 'tipomarcaciones';
const tableAddress = 'direcciones';
const tableDaysOff = 'descansos';
const tablePermissions = 'solicitudes';
const tableExceptions = 'excepciones';
moment.tz.setDefault('America/Lima');
moment.locale('es'); 
module.exports = function (dbInyectada) {
    let message = ""

    let db = dbInyectada;

    if (!db) {
        db = require('../../DB/mysql');
    }

    async function addMarking(body) {
        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;
        const formattedTime = /* "07:02" */ `${hour}:${minutes}`;
        const radiusMeters = 50;

        const dayOfWeekName = initialDate.format('dddd');  
        const daysOff = await db.queryGetDaysOff(tableDaysOff,tableSchedule, tableUser, { IdUsuarios: body.idUser });
        if (daysOff.includes(dayOfWeekName)) {
            message = `Hoy ${dayOfWeekName.toUpperCase()} es su día no laborable.`
            return { "messages": message }
        }
        const idSchedule = await db.queryGetIdSchedule(tableUser, { IdUsuarios: body.idUser });
        const exceptionDay = await db.queryGetExceptionDays(tableDaysOff,tableSchedule, tableUser, { IdUsuarios: body.idUser });
        const IdExcepcion = await db.queryGetIdException(tableSchedule, {IdHorarios :idSchedule.IdHorarios })
        let parametrization;
        if (exceptionDay.includes(dayOfWeekName)){
             parametrization = await db.getTableParametrization(tableExceptions, tableTypeMarking, {IdExcepcion : IdExcepcion.IdExcepcion}, body.idTypesMarking);
        }else {
            parametrization = await db.getTableParametrization(tableSchedule, tableTypeMarking, {IdHorarios : idSchedule.IdHorarios}, body.idTypesMarking);
        }
        
        const timePermission = await db.queryCheckTimePermission(tablePermissions, 4, body.idUser, date)
        const startTimeAllowed = parametrization[0].HoraInicio;        
        const [hourStartTimeAllowed, minutesHourStartTimeAllowed] = startTimeAllowed.split(':');
        const startTimeAllowedInMinutes = parseInt(hourStartTimeAllowed) * 60 + parseInt(minutesHourStartTimeAllowed);
        const entryOneHourAfter = parseInt(hourStartTimeAllowed) * 60 + parseInt(minutesHourStartTimeAllowed) + 75;
        const entryThirtyMinutesBefore = parseInt(hourStartTimeAllowed) * 60 + parseInt(minutesHourStartTimeAllowed) - 15;
        const entryMinutesBefore = parseInt(hourStartTimeAllowed) * 60 + parseInt(minutesHourStartTimeAllowed) + 15 - timePermission*60;
        const hourInMinutesNow = parseInt(hour) * 60 + parseInt(minutes);
        const endTimeAllowed = /* parametrization[parametrization.length - 1].HoraFin;  */ parametrization[0].HoraFin;
        const descrptionTypeMarking = parametrization[0].descripcion;
        function validateTime(formattedTime) {
            const [hour, minutes] = formattedTime.split(':');
            const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
            for (const fila of parametrization) {
                const [startTime, minutesHome] = fila.HoraInicio.split(':');
                const [endTime, minutesEnd] = fila.HoraFin.split(':');
                const startTimeInMinutes = parseInt(startTime) * 60 + parseInt(minutesHome);
                const hourEndInMinutes = parseInt(endTime) * 60 + parseInt(minutesEnd);

                if (hourInMinutes >= startTimeInMinutes && hourInMinutes <= hourEndInMinutes) {
                    /* const idValidacion = fila.IdValidacion; */
                    return fila.IdValidacion
                }
            }
            if ( hourInMinutes<startTimeAllowedInMinutes && body.idTypesMarking === 4){
                return 5
            }
            return 0;
        }

        const data = await db.query(tableUser, { IdUsuarios: body.idUser });
        if (!data) {
            message = 'Usuario incorrecto'
            return { "messages": message }
        }

        const resultDescriptions = {
            0: `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}`,
            1: 'Conforme',
            2: 'Tardanza',
            3: 'Salida',
            5: 'Fuera de horario',
            6: 'Sobretiempo'
           };

        const workModality = await db.queryModalityValidation(tableUser, { IdUsuarios: body.idUser });
        if (!workModality) {
            const locations = await db.compareLocation(tableUser, tableAddress, body.idUser, body.latitude, body.latitude, body.longitude, radiusMeters, body.idUser, body.latitude, body.latitude, body.longitude, radiusMeters)

            if (locations.length > 0) {
                const firstLocationResult = locations[0];
                const nameAddress = firstLocationResult.Direccion
                let alreadyMarkedEntry = false;
                if(body.idTypesMarking === 4){
                    const userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(tableAssist, body.idUser, date, 1);
                    if (userAlreadyMarkedEntry.length === 0) {
                        alreadyMarkedEntry = true
                    } 
                    if (alreadyMarkedEntry) {
                        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ENTRADA primero.`
                        return { "messages": message }
                    }
                }
                const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist, body.idUser, date, body.idTypesMarking);
                let alreadyMarked = false;
                if (userAlreadyMarked.length > 0) {
                    alreadyMarked = true
                } 
                if (alreadyMarked) {
                    message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`
                    return { "messages": message }
                }
                if(timePermission > 0 && body.idTypesMarking === 1){
                    if( entryMinutesBefore <= hourInMinutesNow && hourInMinutesNow <entryThirtyMinutesBefore){
                        const assists = {
                            /* IdAsistencias: body.id, */
                            IdUsuarios: body.idUser,
                            Direccion: nameAddress,
                            Fecha: date,
                            Hora: formattedTime,
                            idTMarcacion: body.idTypesMarking,
                            idValidacion: 6,
                            Created_by: body.idUser,
                            Updated_at: '0000-00-00',
                            Updated_by: 0,
                            idHorario :idSchedule.IdHorarios
                        }
                        const respuesta = await db.add(tableAssist, assists);
                        /* const update = await db.update(tableUser, {tiempoPermiso : 0},body.idUser); */
                        return { "idTipoValidacion": 6,"idMostrarForm": 0, "Registrado como": 'La asistencia ha sido registrada como: SOBRETIEMPO', "Detalle": `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.` }
                    }
                }
                const resultValidation = validateTime(formattedTime);

                let descriptionValidation = '';

                if (resultValidation === 0) {
                    return { "messages": resultDescriptions[resultValidation] }
                } else {
                descriptionValidation = resultDescriptions[resultValidation];
                }

               
                
                const assists = {
                    /* IdAsistencias: body.id, */
                    IdUsuarios: body.idUser,
                    Direccion: nameAddress,
                    Fecha: date,
                    Hora: formattedTime,
                    idTMarcacion: body.idTypesMarking,
                    idValidacion: resultValidation,
                    Created_by: body.idUser,
                    Updated_at: '0000-00-00',
                    Updated_by: 0,
                    idHorario :idSchedule.IdHorarios
                }
                let showForm = 0
                if (resultValidation !== 1 && body.idTypesMarking === 4){
                    showForm = 1
                }
                if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1){
                    showForm = 1
                }
                const respuesta = await db.add(tableAssist, assists);

                if (resultValidation !== 1) {
                    return { "idTipoValidacion": resultValidation,"idMostrarForm": showForm, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`, "Detalle": `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.` }
                }
                return { "idTipoValidacion": resultValidation, "idMostrarForm": showForm, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`, "Detalle": `Hora de registro: ${formattedTime}. ¡gracias por su puntualidad!` }

            }
            message = `El rango para registrar su asistencia es de ${radiusMeters} metros. Por favor, verifique que se encuentra dentro de ese rango.`
            return { "messages": message }
        }

        let alreadyMarkedEntry = false;   
        if(body.idTypesMarking === 4){
            const userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(tableAssist, body.idUser, date, 1);
            if (userAlreadyMarkedEntry.length === 0) {
                alreadyMarkedEntry = true
            } 
            if (alreadyMarkedEntry) {
                message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ENTRADA primero.`
                return { "messages": message }
            }
        }

        const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist, body.idUser, date, body.idTypesMarking);
        let alreadyMarked = false;
        if (userAlreadyMarked.length > 0) {
            alreadyMarked = true
        } 
        if (alreadyMarked) {
            message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`
            return { "messages": message }
        }
        if(timePermission > 0 && body.idTypesMarking === 1){
            if( entryMinutesBefore <= hourInMinutesNow && hourInMinutesNow <entryThirtyMinutesBefore){
                
                const assists = {
                    /* IdAsistencias: body.id, */
                    IdUsuarios: body.idUser,
                    Direccion: body.address,
                    Fecha: date,
                    Hora: formattedTime,
                    idTMarcacion: body.idTypesMarking,
                    idValidacion: 6,
                    Created_by: body.idUser,
                    Updated_at: '0000-00-00',
                    Updated_by: 0,
                    idHorario :idSchedule.IdHorarios
                }
                const respuesta = await db.add(tableAssist, assists);
                return { "idTipoValidacion": 6,"idMostrarForm": 0, "Registrado como": 'La asistencia ha sido registrada como: SOBRETIEMPO.', "Detalle": `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.` }
            }
        }
        const resultValidation = validateTime(formattedTime);
        let descriptionValidation = '';
          
        if (resultValidation === 0) {
            return { "messages": resultDescriptions[resultValidation] }
        } else {
            descriptionValidation = resultDescriptions[resultValidation];
        }
        
        const assists = {
            /* IdAsistencias: body.id, */
            IdUsuarios: body.idUser,
            Direccion: body.address,
            Fecha: date,
            Hora: formattedTime,
            idTMarcacion: body.idTypesMarking,
            idValidacion: resultValidation,
            Created_by: body.idUser,
            Updated_at: '0000-00-00',
            Updated_by: 0,
            idHorario :idSchedule.IdHorarios
        }
        const respuesta = await db.add(tableAssist, assists);

        let showForm = 0
        if (resultValidation !== 1 && body.idTypesMarking === 4){
            showForm = 1
        }

        if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1){
            showForm = 1
        }

        if (resultValidation !== 1) {
            return { "idTipoValidacion": resultValidation,"idMostrarForm": showForm, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`, "Detalle": `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.` }
        }
        return { "idTipoValidacion": resultValidation, "idMostrarForm": showForm, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`, "Detalle": `Hora de registro: ${formattedTime}.¡gracias por su puntualidad!` }

    }

    async function update(body) {

        let user = body.username || '';
        let password = body.password || '';
        const marking = {
            IdUsuarios: body.idUser,
            Fecha: body.date,
            Hora: body.hour,
            idTMarcacion: body.idTypesMarking,
            idValidacion: body.idValidacion,

        }
        const modificationMarking = {
            Hora: body.hour,
            idTMarcacion: body.idTypesMarking,  //revisar
            idValidacion: body.idValidacion,
            Updated_by: body.idUserModified,
            Updated_at: date,
        }

        if (body.IdRol == 1) {
            const response = await db.queryUpdateAssists(tableAssist, modificationMarking, marking);
            return response;
        }
        message = 'No tienes permiso para modificar.'
        return { "messages": message }

    }
    return {
        addMarking,
        update,
    }
}
