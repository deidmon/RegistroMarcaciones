const express = require('express');
const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();
const tableCronJob = 'horarionotificaciones';
const axios = require('axios');

const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');



const bearerToken = 'AAAABAqfEQ8:APA91bEgr4R2yhqoez4YD1mSHtGnQcNChmI7uYRvK7CXFaVWKi98S3v0clv5sxP_UYK9vomiFAEAxPxhbUR-gR2En4b_hRuwxATvLqhq0dtxHgqWT3qQrDzxrGFWJepvmKGsAPwh49Yi';
const endpoint = 'https://fcm.googleapis.com/fcm/send'; 

errorMessage = "Algo salio mal, intente más tarde."
async function UsersUnmarked() {
    try{
        const usersUnmarked = await controller.usersUnmarked();
        const tokensUsersUnmarked = await controller.tokenUsersUnmarked(usersUnmarked);
        return tokensUsersUnmarked 
    }catch(err){
        console.log(err)
        
    }
}

async function notificationUsersUnmarked() {    
        const valuesTokenUser = await UsersUnmarked();
        /* console.log(valuesTokenUser) */
        if(!valuesTokenUser || valuesTokenUser.length === 0){
          return "Todos los usuarios ya marcaron asistencia"
        }
        const jsonData = 
        { 
     
            priority: "high",
            data: {
                   "click_action": "FLUTTER_NOTIFICATION_CLICK",
                   "body": "Tienes una marcación pendiente por hacer",
                   "title": "MARCACIONES"
                 },
            registration_ids : valuesTokenUser
         };
        try {
          const response = await axios.post(endpoint, jsonData,{
            headers: {
                'Authorization': `bearer ${bearerToken}`,
            },
          },
          );
          console.log(`Usuario notificado con éxito: ${JSON.stringify(jsonData)}`);
          return "Usuarios notificados con éxito"
        } catch (error) {
          console.error(`Error al notificar usuario: ${error.message}`);
          return "Error al notificar usuarios"
        }
      
    
  }
  


async function startProgramming() {
  function scheduleTask(cronExpression) {
    cron.schedule(cronExpression, async () => {
      try {
        const message = await notificationUsersUnmarked();
        console.log(`Ejecución programada a las ${cronExpression}: ${message}`);
      } catch (error) {
        console.error('Error en la ejecución programada:', error);
      }
    });
  }
  
  const cronJob = await db.cronjobNotification(tableCronJob);
  const hourCronJob = cronJob.map((row) => {
          const hour = row.Hora; 
          const objetMoment = moment.tz(hour, 'HH:mm:ss','America/Lima');
          const serverTime = objetMoment.tz('UTC'); //  'ZonaHorariaDelServidor' 
          const minutes = serverTime.format('mm');
          const hours = serverTime.format('HH');
        
          return `${minutes} ${hours} * * *`;
        });
  console.log(hourCronJob);
  
  hourCronJob.forEach((cronExpression) => {
  scheduleTask(cronExpression);
  });
}
startProgramming();
