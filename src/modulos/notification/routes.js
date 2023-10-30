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



const bearerToken = 'tokendefirebase';
const endpoint = 'https://fcm.googleapis.com/fcm/send'; 

errorMessage = "Algo salio mal, intente más tarde."
async function UsersUnmarked() {
    try{
        const usersUnmarked = await controller.usersUnmarked();
        const tokensUsersUnmarked = await controller.tokenUsersUnmarked(usersUnmarked);
        /* console.log(tokensUsersUnmarked) */
        return tokensUsersUnmarked 
    }catch(err){
        console.log(err)
        
    }
}

async function notificationUsersUnmarked() {
    try {      
        const valuesTokenUser = UsersUnmarked()
        const jsonData = 
        { 
     
            priority: "high",
            data: {
                   "click_action": "FLUTTER_NOTIFICATION_CLICK",
                   "body": "Tienes una marcación pendiente por hacer",
                   "title": "MARCACIONES"
                 },
            to : valuesTokenUser
         };
        try {
          const response = await axios.post(endpoint, jsonData,{
            headers: {
                'Authorization': `Bearer ${bearerToken}`,
            },
          },
          );
          console.log(response)
  
          console.log(`Usuario notificado con éxito: ${JSON.stringify(jsonData)}`);
        } catch (error) {
          console.error(`Error al notificar usuario: ${error.message}`);
        }
      
    } catch (error) {
      console.error(`Error: ${error.message}`);
    }
  }
  


/* notificationUsersUnmarked(); */
/* notificationUsersUnmarked() */

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
