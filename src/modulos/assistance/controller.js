const moment = require('moment-timezone');
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableSchedule = 'horarios';
const tableTypeMarking = 'tipomarcaciones';
const tableAddress = 'direcciones';
const tableDaysOff = 'descansos';
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
        const formattedTime = `${hour}:${minutes}`;
        const radiusMeters = 50;

        const dayOfWeekName = initialDate.format('dddd');  
        const daysOff = await db.queryGetDaysOff(tableDaysOff,tableSchedule, tableUser, { IdUsuarios: body.idUser });
        if (daysOff.includes(dayOfWeekName)) {
            message = `Hoy ${dayOfWeekName.toUpperCase()} es su día no laborable.`
            return { "messages": message }
        }
        const idSchedule = await db.queryGetIdSchedule(tableUser, { IdUsuarios: body.idUser });
        const parametrization = await db.getTableParametrization(tableSchedule, tableTypeMarking, idSchedule.IdHorarios, body.idTypesMarking);
        const startTimeAllowed = parametrization[0].HoraInicio;
        const endTimeAllowed = /* parametrization[parametrization.length - 1].HoraFin;  */ parametrization[0].HoraFin;
        const descrptionTypeMarking = parametrization[0].descripcion;
        function validateTime(formattedTime) {
            const [hour, minutes] = formattedTime.split(':');
            for (const fila of parametrization) {
                const [startTime, minutesHome] = fila.HoraInicio.split(':');
                const [endTime, minutesEnd] = fila.HoraFin.split(':');
                const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
                const startTimeInMinutes = parseInt(startTime) * 60 + parseInt(minutesHome);
                const hourEndInMinutes = parseInt(endTime) * 60 + parseInt(minutesEnd);

                if (hourInMinutes >= startTimeInMinutes && hourInMinutes <= hourEndInMinutes) {
                    const idValidacion = fila.IdValidacion;
                    return idValidacion
                }
            }
            return 0;
        }

        const data = await db.query(tableUser, { IdUsuarios: body.idUser });
        if (!data) {
            message = 'Usuario incorrecto'
            return { "messages": message }
        }
        const workModality = await db.queryModalityValidation(tableUser, { IdUsuarios: body.idUser });
        if (!workModality) {
            const locations = await db.compareLocation(tableUser, tableAddress, body.idUser, body.latitude, body.latitude, body.longitude, radiusMeters, body.idUser, body.latitude, body.latitude, body.longitude, radiusMeters)

            if (locations.length > 0) {
                const firstLocationResult = locations[0];
                /* const idAddress = firstLocationResult.IdDireccion; */
                const nameAddress = firstLocationResult.Direccion

                const resultValidation = validateTime(formattedTime);

                let descriptionValidation = '';
                if (resultValidation === 0) {
                    message = `Lo sentimos, no se pudo registrar su asistencia, ya que el horario permitido para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}`
                    return { "messages": message }
                } else if (resultValidation === 1) {
                    descriptionValidation = 'Conforme';
                } else if (resultValidation === 2) {
                    descriptionValidation = 'Tardanza';
                } else if (resultValidation === 3) {
                    descriptionValidation = 'Falta';
                }

                const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist, body.idUser, date, body.idTypesMarking);

                var alreadyMarked = false;
                if (userAlreadyMarked.length > 0) {
                    alreadyMarked = true
                } else {
                    alreadyMarked = false
                }
                if (alreadyMarked) {
                    message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`
                    return { "messages": message }
                }
                const assists = {
                    IdAsistencias: body.id,
                    IdUsuarios: body.idUser,
                    Direccion: nameAddress,
                    Fecha: date,
                    Hora: formattedTime,
                    idTMarcacion: body.idTypesMarking,
                    idValidacion: resultValidation,
                    Created_by: body.idUser,
                    Updated_at: '0000-00-00',
                    Updated_by: 0,
                }

                const respuesta = await db.add(tableAssist, assists);

                if (resultValidation == 2 || resultValidation == 3) {
                    return { "idTipoMarcacion": resultValidation, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`, "Detalle": `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.` }
                }
                return { "idTipoMarcacion": resultValidation, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`, "Detalle": `Hora de registro: ${formattedTime}. ¡gracias por su puntualidad!` }

            }
            message = `El rango para registrar su asistencia es de ${radiusMeters} metros. Por favor, verifique que se encuentra dentro de ese rango.`
            return { "messages": message }
        }
        const resultValidation = validateTime(formattedTime);

        let descriptionValidation = '';
        if (resultValidation === 0) {
            message = `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: '${startTimeAllowed} a ${endTimeAllowed}'`
            return { "messages": message }
        } else if (resultValidation === 1) {
            descriptionValidation = 'Conforme';
        } else if (resultValidation === 2) {
            descriptionValidation = 'Tardanza';
        } else if (resultValidation === 3) {
            descriptionValidation = 'Salida';
        }

        const userAlreadyMarked = await db.userAlreadyMarkedToday(tableAssist, body.idUser, date, body.idTypesMarking);
        /* console.log(userAlreadyMarked) */
        var alreadyMarked = false;
        if (userAlreadyMarked.length > 0) {
            alreadyMarked = true
        } else {
            alreadyMarked = false
        }
        if (alreadyMarked) {
            message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`
            return { "messages": message }
        }
        const assists = {
            IdAsistencias: body.id,
            IdUsuarios: body.idUser,
            Direccion: body.address,
            Fecha: date,
            Hora: formattedTime,
            idTMarcacion: body.idTypesMarking,
            idValidacion: resultValidation,
            Created_by: body.idUser,
            Updated_at: '0000-00-00',
            Updated_by: 0,
        }
        const respuesta = await db.add(tableAssist, assists);
        if (resultValidation == 2 || resultValidation == 3) {
            return { "idTipoMarcacion": resultValidation, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`, "Detalle": `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.` }
        }
        return { "idTipoMarcacion": resultValidation, "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`, "Detalle": `Hora de registro: ${formattedTime}.¡gracias por su puntualidad!` }

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
