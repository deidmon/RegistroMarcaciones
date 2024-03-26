const cron = require('node-cron');
const axios = require("axios");
const config = require("../../config");
const constant = require("../../helpers/constants");
const helpers = require("../../helpers/helpers");
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const db = require('../../DB/mysql');
const bcrypt = require('bcrypt');

var date;
const apiClave = "sTSR8wr4HeS5GAIR5ESP4TEFA76GojVlHAVj0RBHrEHdLUAniKij3AhIWQ8Ed";
const endpoint = "http://10.4.220.15/ApiServiciosRRHH/registroVacaciones/registrar";



async function registrarvacaciones() {
  try {
     const response = await axios.post(endpoint, {}, {
       params: {
         codigo: "000044820",
         perfil: "U",
         inicio: "24/04/2024",
         fin: "28/04/2024",
         adelanto: "0",
       },
       headers: {
         apiClave: apiClave,
       },
     });
     console.log(response);
     return response.data;
  } catch (error) {
     console.error(error.response.data);
  }
 };
 async function getDataUsers22() {
  const valuesDataUser = await registrarvacaciones();

};
 
async function startProgrammingDataUsers() {
    function scheduleTask(cronExpression) {
      cron.schedule(cronExpression, async () => {
        /* getDataUsers(); */
        getDataUsers22();

      });
    }
  
    //CAMBIAR LA HORA A LA QUE SE EJECUTARA '04:20:00'
    let uniqueHourCronJob = ["04:48:00"]; //Cronjob inicial 
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