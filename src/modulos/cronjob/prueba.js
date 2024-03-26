const express = require("express");
const response = require("../../red/response");
const nodemailer = require("nodemailer");
const router = express.Router();

const cron = require('node-cron');
const axios = require("axios");
const config = require("../../config");
const constant = require("../../helpers/constants");
const helpers = require("../../helpers/helpers");
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const db = require('../../DB/mysql');
const bcrypt = require('bcrypt');

const tableSchedule = "horarios";
const tableAssist = "asistencias";
const tableUser = "usuarios";
const tableDaysOff = "descansos";
const tablePermissions = "solicitudes";
const tableExceptions = "excepciones";
const tableHoliday = "feriados";

const bearerToken =
  "AAAAD85SmVo:APA91bHw2px9VZxOyeLzdqb98FSYA1W8asL5-VYV2qV_HXjoz6V-aWKpamk9L9f0S8vlXxKLnVodLAHNAgOAavTvZ2mAQHyj7_V9oLdYCR2If4XltZUAWqZTcspPpIxQVqwryMeh4F97";
const endpoint = "https://fcm.googleapis.com/fcm/send";
const valuesTokenUser = "fBuPMh9DQD-oyr9crKy3f_:APA91bH-5s3HkejGBoY8hQyzduymI95LAQNKuP9Zd7PW4jKz8f5eteawvVijg3P4Dh1Mxqscrg3W8cJ-jFyveiyHc482H8K6tURXoGZJ5RX7RlnUVGvg_g5WwgtJIZsLPMn-NAEVJAkb"


/* 📌 ---*/
async function notificationUsersUnmarked() {

   
  const jsonData = {
    priority: "high",
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      body: "Tienes una marcación pendiente por hacer",
      title: "MARCACIONES",
    },
    registration_ids: [],
  };
  try {
    const response = await axios.post(endpoint, jsonData, {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    });
    console.log(`Usuario notificado con éxito: ${JSON.stringify(jsonData)}`);
    console.log(response.data);
    return "Usuarios notificados con éxito";
  } catch (error) {
    console.error(`Error al notificar usuario: ${error}`);
    return "Error al notificar usuarios";
  }
};
 
async function getDataUsers2() {
    
    notificationUsersUnmarked()
};

async function startProgrammingDataUsers() {
    function scheduleTask(cronExpression) {
      cron.schedule(cronExpression, async () => {
        /* getDataUsers(); */
        getDataUsers2();

      });
    }
  
    //CAMBIAR LA HORA A LA QUE SE EJECUTARA '04:20:00'
    let uniqueHourCronJob = ["14:17:00"]; //Cronjob inicial 
    const hourCronJob = uniqueHourCronJob.map((hour) => {
      const objetMoment = moment.tz(hour, "HH:mm:ss", "America/Lima");
      const serverTime = objetMoment.tz("UTC"); //  'ZonaHorariaDelServidor'
      const minutes = serverTime.format("mm");
      const hours = serverTime.format("HH");
  
      return `${minutes} ${hours} * * *`;
    });
    console.log(hourCronJob);
    hourCronJob.forEach((cronExpression) => {
      scheduleTask(cronExpression);
    });
};

startProgrammingDataUsers()