const tableSchedule = 'horarios';
const tableUser = 'usuarios';
const tableRestDays = 'descansos';

module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function allSchedules(){
        return db.queryAllSchedules(tableSchedule);
    };

    async function scheduleByUser(body){   
        const user = await db.query(tableUser, {DNI:body.username})
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
            const respuesta = await parseHour(body.timeStart, body.idRestDay, body.idStatus, body.idSchedule, 1, 1)
            const respuesta2 = await parseHour(body.timeEnd, body.idRestDay, body.idStatus, body.idSchedule, 4, 1)
            if (respuesta && respuesta2 === 'Se añadieron correctamente') {
                return 'Horario modificado con éxito';
            } else {
                return 'No se modificó el horario';
            }
        } 
        lastSchedule = await db.queryLastSchedule(tableSchedule) + 1
        const respuesta = await parseHour(body.timeStart, body.idRestDay, body.idStatus, lastSchedule, 1, 0)
        const respuesta2 = await parseHour(body.timeEnd, body.idRestDay, body.idStatus, lastSchedule, 4, 0)
        if (respuesta && respuesta2 === 'Se añadieron correctamente') {
            return 'Horario añadido con éxito';
        } else {
            return 'No se añadió el horario';
        }

        
    }

    async function addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, idTypesMarking, idTypeValidation, timeStartFormated, timeEndFormated){
        const schedule = {
            IdHorarios: lastSchedule,
            IdTipoMarcacion: idTypesMarking,
            IdValidacion: idTypeValidation,
            HoraInicio: timeStartFormated,
            HoraFin: timeEndFormated,
            idDescanso: idRestDay,
            idEstado: idStatus

        }
        if (updateSchedule === 0){
            return await db.add(tableSchedule, schedule);
        }
        
        return await db.queryUpdateSchedule(tableSchedule, schedule, lastSchedule, idTypesMarking,idTypeValidation);

    };

    async function parseHour(time, idRestDay, idStatus, lastSchedule,  typesMarking, updateSchedule){
        let timeStart = time.split(":");
        let fecha = new Date();
        fecha.setHours(parseInt(timeStart[0]));
        fecha.setMinutes(parseInt(timeStart[1]));

        // restamos 5 minutos
        fecha.setMinutes(fecha.getMinutes() - 5);
        let timeStartFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

        // sumanos 5 minutos
        fecha.setMinutes(fecha.getMinutes() + 10);
        let timeEndFormated = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');
        // sumanos 6 minutos
        fecha.setMinutes(fecha.getMinutes() + 1);
        let timeEndFormatedValidation2 = fecha.getHours().toString().padStart(2, '0') + ":" + fecha.getMinutes().toString().padStart(2, '0');

        const respuestas = await Promise.all([
            addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 1,timeStartFormated, timeEndFormated ).then(() => true).catch(() => false),
            addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 2,timeEndFormatedValidation2, "23:57" ).then(() => true).catch(() => false),
            addScheduleDB(updateSchedule, idRestDay, idStatus, lastSchedule, typesMarking, 3,"23:58", "23:59" ).then(() => true).catch(() => false)
        ]);
      
        if (respuestas.every(resultado => resultado === true)) {
            return 'Se añadieron correctamente';
        } else {
            return 'Ocurrió un error en una o más operaciones';
        }

    };

    async function activateSchedule(body) {
        if (body.idProfile != 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }

        usersWithSchedule = await db.queryUsersWithSchedule(tableUser,body.idSchedules)
        if(usersWithSchedule === 1){
            message = 'No se puede eliminar este horario porque existen usuarios con este horario';
            return { "messages": message }
        }

        const respuesta = await db.queryActivateSchedule(tableSchedule, body.status, body.idSchedules);
        if (respuesta && respuesta.changedRows > 0) {
            return 'Modificación de estado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    }

    return {
        allSchedules,
        addScheduleUser,
        addSchedules,
        activateSchedule,
        scheduleByUser
    }
}
