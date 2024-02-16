const tableSchedule = 'horarios';
const tableScheduleException = 'excepciones';
const tableUser = 'usuarios';
const tableRestDays = 'descansos';
const tableStatus = 'estados';

module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function allSchedules(body){
        if (body.idStatus === -1) {
            body.idStatus = null;
        }
        if (body.idHorario === -1) {
            body.idHorario = null;
        }
        return db.queryAllSchedulesFilter(tableSchedule, tableRestDays,tableStatus, tableScheduleException, body.idStatus,body.idHorario);
    };

    async function scheduleByUser(body){   
        const user = await db.query(tableUser, {IdUsuarios: body.idUser})
        const idSchedule =  user.IdHorarios;
        const dataSchedule = await db.queryScheduleByUser(tableSchedule, tableRestDays, idSchedule);
        if (!dataSchedule) {
            message = 'No existe horario asignado'
            return { "messages": message }
        }
        return dataSchedule
    };

    async function addScheduleUser(body) {
        const dataUser = await db.queryAddScheduleUser(tableUser, body.idSchedule, body.idUsers);
        return dataUser;
    };

    async function addSchedules(body) {
        if(body.idSchedule != 0){
            const dataSchedule = await db.query(tableSchedule, { idHorarios : body.idSchedule });
            if (dataSchedule.length == 0) {
                message = 'Horario incorrecto'
                return { "messages": message }
            }
        }

       
        if (body.idSchedule !== 0) {
            const respuesta = await parseHour(body.timeStart, body.idRestDay, body.idStatus, body.idSchedule, 1, 0, 0, 1)
            const respuesta2 = await parseHour(body.timeEnd, body.idRestDay, body.idStatus, body.idSchedule, 4, 0, 0, 1)
            if (respuesta && respuesta2 === 'Se añadieron correctamente') {
                return 'Horario modificado con éxito';
            } else {
                return 'No se modificó el horario';
            }
        } 
        if (body.dayException == -1){ 
            lastSchedule = await db.queryLastSchedule(tableSchedule) + 1
            respuesta = await parseHour(body.timeStart, body.idRestDay, body.idStatus, lastSchedule, 1, 0, 0, 0 )
            respuesta2 = await parseHour(body.timeEnd, body.idRestDay, body.idStatus, lastSchedule, 4, 0, 0, 0)

        } else {
            let lastScheduleException = await db.queryLastScheduleException(tableScheduleException) + 1
            /* console.log(lastScheduleException) */
            respuestaException = await parseHourException(body.timeStartException, body.idStatus, lastScheduleException, 1, 0)
            respuestaException2 = await parseHourException(body.timeEndException, body.idStatus, lastScheduleException, 4, 0)
            lastSchedule = await db.queryLastSchedule(tableSchedule) + 1
            respuesta = await parseHour(body.timeStart, body.idRestDay, body.idStatus, lastSchedule, 1, body.dayException, lastScheduleException, 0)
            respuesta2 = await parseHour(body.timeEnd, body.idRestDay, body.idStatus, lastSchedule, 4, body.dayException, lastScheduleException, 0)
        }
        
        if (respuesta && respuesta2 === 'Se añadieron correctamente') {
            return 'Horario añadido con éxito';
        } else {
            return 'No se añadió el horario';
        }

        
    }

    async function addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, idTypesMarking, idTypeValidation, timeStartFormated, timeEndFormated, dayException, idException){
        const schedule = {
            IdHorarios: lastSchedule,
            IdTipoMarcacion: idTypesMarking,
            IdValidacion: idTypeValidation,
            HoraInicio: timeStartFormated,
            HoraFin: timeEndFormated,
            idDescanso: idRestDay,
            idEstado: idStatus,
            diaExcepcion: dayException,
            IdExcepcion: idException,

        }
        if (updateSchedule === 0){
            return await db.add(tableSchedule, schedule);
        }
        
        return await db.queryUpdateSchedule(tableSchedule, schedule, lastSchedule, idTypesMarking,idTypeValidation);

    };

    async function addScheduleExceptionDB(updateSchedule, lastSchedule, idTypesMarking, idTypeValidation, timeStartFormated, timeEndFormated){
        const schedule = {
            IdExcepcion: lastSchedule,
            IdTipoMarcacion: idTypesMarking,
            IdValidacion: idTypeValidation,
            HoraInicio: timeStartFormated,
            HoraFin: timeEndFormated,
        }
        if (updateSchedule === 0){
            return await db.add(tableScheduleException, schedule);
        }
        
        return await db.queryUpdateSchedule(tableScheduleException, schedule, lastSchedule, idTypesMarking,idTypeValidation);

    };

    async function parseHour(time, idRestDay, idStatus, lastSchedule,  typesMarking, dayException, idException, updateSchedule){
        let timeStart = time.split(":");
        let fecha = new Date();
        fecha.setHours(parseInt(timeStart[0]));
        fecha.setMinutes(parseInt(timeStart[1]));
        let timeStartFormated;
        let timeEndFormated;
        let timeStartFormatedValidation2
        let timeEndFormatedValidation2;
        let timeStartFormatedValidation3;
        let respuestas;
        if (typesMarking === 1){
            // restamos 5 minutos
            fecha.setMinutes(fecha.getMinutes() - 15);
            timeStartFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 5 minutos
            fecha.setMinutes(fecha.getMinutes() + 20);
            timeEndFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 6 minutos
            fecha.setMinutes(fecha.getMinutes() + 1);
            timeEndFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

            respuestas = await Promise.all([
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 1,timeStartFormated, timeEndFormated, dayException, idException ).then(() => true).catch(() => false),
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 2,timeEndFormatedValidation2, "23:57", dayException, idException ).then(() => true).catch(() => false),
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 3,"23:58", "23:59", dayException, idException ).then(() => true).catch(() => false)
            ]);
           
        } else {
            
            timeStartFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 15 minutos
            fecha.setMinutes(fecha.getMinutes() + 15);
            timeEndFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 16 minutos
            fecha.setMinutes(fecha.getMinutes() + 1);
            timeStartFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

            // sumanos 30 minutos
            fecha.setMinutes(fecha.getMinutes() + 14);
            timeEndFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

            // sumanos 1 minutos
            fecha.setMinutes(fecha.getMinutes() + 1);
            timeStartFormatedValidation3 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            respuestas = await Promise.all([
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 1,timeStartFormated, timeEndFormated, dayException, idException).then(() => true).catch(() => false),
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 5,timeStartFormatedValidation2, timeEndFormatedValidation2, dayException, idException).then(() => true).catch(() => false),
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 6,timeStartFormatedValidation3, "23:57", dayException, idException).then(() => true).catch(() => false),
                addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 3,"23:58", "23:59", dayException, idException).then(() => true).catch(() => false)
            ]);
        }

        
      
        if (respuestas.every(resultado => resultado === true)) {
            return 'Se añadieron correctamente';
        } else {
            return 'Ocurrió un error en una o más operaciones';
        }

    };

    async function parseHourException(time, idStatus, lastSchedule,  typesMarking, updateSchedule){
        let timeStart = time.split(":");
        let fecha = new Date();
        fecha.setHours(parseInt(timeStart[0]));
        fecha.setMinutes(parseInt(timeStart[1]));
        let timeStartFormated;
        let timeEndFormated;
        let timeStartFormatedValidation2
        let timeEndFormatedValidation2;
        let timeStartFormatedValidation3;
        let respuestas;
        if (typesMarking === 1){
            // restamos 5 minutos
            fecha.setMinutes(fecha.getMinutes() - 15);
            timeStartFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 5 minutos
            fecha.setMinutes(fecha.getMinutes() + 20);
            timeEndFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 6 minutos
            fecha.setMinutes(fecha.getMinutes() + 1);
            timeEndFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            respuestas = await Promise.all([
                addScheduleExceptionDB(updateSchedule,  lastSchedule, typesMarking, 1,timeStartFormated, timeEndFormated).then(() => true).catch(() => false),
                addScheduleExceptionDB(updateSchedule,  lastSchedule, typesMarking, 2,timeEndFormatedValidation2, "23:57").then(() => true).catch(() => false),
                addScheduleExceptionDB(updateSchedule,  lastSchedule, typesMarking, 3,"23:58", "23:59").then(() => true).catch(() => false)
            ]);
           
        } else {
            
            timeStartFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 15 minutos
            fecha.setMinutes(fecha.getMinutes() + 15);
            timeEndFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            // sumanos 16 minutos
            fecha.setMinutes(fecha.getMinutes() + 1);
            timeStartFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

            // sumanos 30 minutos
            fecha.setMinutes(fecha.getMinutes() + 14);
            timeEndFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

            // sumanos 1 minutos
            fecha.setMinutes(fecha.getMinutes() + 1);
            timeStartFormatedValidation3 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
            respuestas = await Promise.all([
                addScheduleExceptionDB(updateSchedule, lastSchedule, typesMarking, 1,timeStartFormated, timeEndFormated).then(() => true).catch(() => false),
                addScheduleExceptionDB(updateSchedule, lastSchedule, typesMarking, 5,timeStartFormatedValidation2, timeEndFormatedValidation2).then(() => true).catch(() => false),
                addScheduleExceptionDB(updateSchedule, lastSchedule, typesMarking, 6,timeStartFormatedValidation3, "23:57").then(() => true).catch(() => false),
                addScheduleExceptionDB(updateSchedule, lastSchedule, typesMarking, 3,"23:58", "23:59").then(() => true).catch(() => false)
            ]);
        }

        
      
        if (respuestas.every(resultado => resultado === true)) {
            return 'Se añadieron correctamente';
        } else {
            return 'Ocurrió un error en una o más operaciones';
        }

    };

    async function activateSchedule(body) {
        if (body.idProfile == 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }

        usersWithSchedule = await db.queryUsersWithSchedule(tableUser,body.idSchedules)
        if(usersWithSchedule === 1){
            message = 'No se puede desactivar este horario porque existen usuarios con este horario';
            return { "messages": message }
        }

        const respuesta = await db.queryActivateSchedule(tableSchedule, body.status, body.idSchedules);
        if (respuesta && respuesta.changedRows > 0) {
            if(body.status=== 1){
                return 'Horario activado con éxito';
            }
            return 'Horario desactivado con éxito';
            
        } 
        
        return 'No se realizó ninguna modificación';
        
    }

    return {
        allSchedules,
        addScheduleUser,
        addSchedules,
        activateSchedule,
        scheduleByUser
    }
}
