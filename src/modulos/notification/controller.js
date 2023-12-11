const tableUser = 'usuarios';
const tableAssist = 'asistencias';
const tableNotification = 'tokennotificaciones';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

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

    return {
        usersUnmarked,
        tokenUsersUnmarked
    };
}