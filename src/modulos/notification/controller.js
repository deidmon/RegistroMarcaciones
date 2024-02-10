const tableUser = 'usuarios';
const tableAssist = 'asistencias';
const tableNotification = 'tokennotificaciones';
const tableSchedule = 'horarios';
const tableRestDays = 'descansos';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
moment.locale('es'); 

module.exports = function (dbInjected) {

    let db = dbInjected;
    message = ""

    if (!db) {
        db = require('../../DB/mysql');
    }
    async function usersUnmarked() {
        
        /* 📌 Variables */
        let initialDate = moment();
        const hours = initialDate.format('HH');
        const minutes = initialDate.format('mm');

        /* 📌 Pasamos la hora a minutos */
        const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);

        /* 📌 Comparamos la hora con la de la bd para optener el tipo de marcación */
        function calculateIdTypesMarking(timeInMinute) {
            if (timeInMinute <= 840) {
                return 1;
            } 
                return 4;
        }

        let idTypesMarking = calculateIdTypesMarking(timeInMinutes);


        /* 📌 Función para optener a todos los trabajadores que aun no registran su asistencia */
        const usersUnregistered = await db.recordFouls(tableUser, tableAssist, idTypesMarking);
        return usersUnregistered;
    }
    /* 📌 Optenemos el token de usuarios sin registro para enviar notificación*/
    function tokenUsersUnmarked(usersUnmarked) {
        return db.tokenUsersUnmarked(tableNotification, usersUnmarked);
    };

    /* 📌 Optenemos email del lider para notificar cada vez que alguien llega tarde*/
    async function getEmailLeader(body) {
        const getObject = await db.queryGetInformationToEmail(body.idUser);
        const getVariablesToEmail = getObject[0];
        return getVariablesToEmail;
    };

    /* 📌 Obtener el horario del usuario*/
    async function scheduleByUser(body){   
        const user = await db.query(tableUser, {IdUsuarios: body.idUser})
        const idSchedule =  user.IdHorarios;
        const dataSchedule = await db.queryScheduleByUser(tableSchedule, tableRestDays, idSchedule);
        if (!dataSchedule) {
            message = 'No existe horario asignado'
            return { "messages": message }
        }
        console.log(dataSchedule);
        return dataSchedule
    };
    async function hourToRegisterMark(){
        let initialDate = moment();
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        const formattedTime = `${hour}:${minutes}`;
        console.log(formattedTime);
        return formattedTime;
    }
    return {
        usersUnmarked,
        tokenUsersUnmarked,
        getEmailLeader,
        scheduleByUser,
        hourToRegisterMark,
    };
}