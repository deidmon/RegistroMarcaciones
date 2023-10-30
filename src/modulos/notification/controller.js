const auth = require('../../auth');
const bcrypt =require ('bcrypt');
const tableUser = 'usuarios';
const tableAssist = 'asistencias';
const tableParameterization = 'parametrizacion'; 
const tableNotification = 'tokennotificaciones';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

module.exports = function(dbInjected){

    let db = dbInjected;
    message = ""

    if(!db){
        db = require('../../DB/mysql');
    }
    async function usersUnmarked(){
            let initialDate =  moment();
            const hours = initialDate.format('HH');
            const minutes = initialDate.format('mm');
            const seconds = initialDate.format('ss');

         const formattedTime = `${hours}:${minutes}`;
        //comprobar la hora
        const parametrization = await db.getTableParametrizationTypeMarking(tableParameterization);     
                    
        function validateTime(formattedTime) {
            const [hour, minutes] = formattedTime.split(':'); 
            for (const fila of parametrization) {
                const [startTime, minutesHome] = fila.HoraInicio.split(':'); 
                const [endTime, minutesEnd] = fila.HoraFin.split(':'); 
                const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
                const startTimeInMinutes = parseInt(startTime) * 60 + parseInt(minutesHome);
                const hourEndInMinutes = parseInt(endTime) * 60 + parseInt(minutesEnd);

                if (hourInMinutes >= startTimeInMinutes && hourInMinutes <= hourEndInMinutes) {
            
                    const TypeMarking = fila.idTipoMarcaciones;
                        return TypeMarking
                }
            }
         
         }
        const idTypesMarking = validateTime(formattedTime);
        const usersUnregistered = await db.recordFouls(tableUser, tableAssist, idTypesMarking);

        return usersUnregistered
        
    }
    function tokenUsersUnmarked(usersUnmarked){
        return db.tokenUsersUnmarked(tableNotification,usersUnmarked);
    }

    return {
        usersUnmarked,
        tokenUsersUnmarked
        
    }
  
}