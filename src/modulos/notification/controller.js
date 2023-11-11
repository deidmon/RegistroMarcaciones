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
        let initialDate = moment();
        const hours = initialDate.format('HH');
        const minutes = initialDate.format('mm');

        //Pasamos la hora a minutos
        const timeInMinutes = parseInt(hours) * 60 + parseInt(minutes);
        let idTypesMarking = 0;

        if (timeInMinutes <= 540) {
            idTypesMarking = 1;
        } else {
            idTypesMarking = 4;
        }

        const usersUnregistered = await db.recordFouls(tableUser, tableAssist, idTypesMarking);

        return usersUnregistered;
    }

    function tokenUsersUnmarked(usersUnmarked) {
        return db.tokenUsersUnmarked(tableNotification, usersUnmarked);
    };

    return {
        usersUnmarked,
        tokenUsersUnmarked
    };
}