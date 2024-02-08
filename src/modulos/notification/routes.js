const express = require('express');
const cron = require('node-cron');
const db = require('../../DB/mysql');
const response = require('../../red/response');
const controller = require('./index');
const tableCronJob = 'horarionotificaciones';
const tableSchedule = 'horarios';
const axios = require('axios');
const nodemailer = require('nodemailer');
const config = require('../../config');

const router = express.Router();

const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

const bearerToken = 'AAAABAqfEQ8:APA91bEgr4R2yhqoez4YD1mSHtGnQcNChmI7uYRvK7CXFaVWKi98S3v0clv5sxP_UYK9vomiFAEAxPxhbUR-gR2En4b_hRuwxATvLqhq0dtxHgqWT3qQrDzxrGFWJepvmKGsAPwh49Yi';
const endpoint = 'https://fcm.googleapis.com/fcm/send';

router.post('/latenessreport', sendGmail);

errorMessage = "Algo salio mal, intente más tarde.";

async function UsersUnmarked() {
  try {
    const usersUnmarked = await controller.usersUnmarked();
    const tokensUsersUnmarked = await controller.tokenUsersUnmarked(usersUnmarked);
    return tokensUsersUnmarked;
  } catch (err) {
    console.log(err);
  }
}

async function notificationUsersUnmarked() {
  const valuesTokenUser = await UsersUnmarked();
  /* console.log(valuesTokenUser) */
  if (!valuesTokenUser || valuesTokenUser.length === 0) {
    return "Todos los usuarios ya marcaron asistencia";
  }
  const jsonData =
  {
    priority: "high",
    data: {
      "click_action": "FLUTTER_NOTIFICATION_CLICK",
      "body": "Tienes una marcación pendiente por hacer",
      "title": "MARCACIONES"
    },
    registration_ids: valuesTokenUser
  };
  try {
    const response = await axios.post(endpoint, jsonData, {
      headers: {
        'Authorization': `bearer ${bearerToken}`,
      },
    },
    );
    /* console.log(`Usuario notificado con éxito: ${JSON.stringify(jsonData)}`); */
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
  /* const cronJob = await db.queryScheduleNotification(tableSchedule); */
  const hourCronJob = cronJob.map((row) => {
    const hour = row.Hora;
    const objetMoment = moment.tz(hour, 'HH:mm:ss', 'America/Lima');
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

sendGMailPrueba = async () => {

  const config = {
    host: 'smtp.gmail.com',
    port: 587,
    auth: {
      user: config.gmail.authusergmail,
      pass: config.gmail.authuserpass,
    }
  }
  const mensaje = {
    from: "sdwilmer179@gmail.com",
    to: "sdwilmer179@gmail.com",
    subject: "Correo de pruebas",
    text: 'Envio de correo desde node'

  }
  const transport = nodemailer.createTransport(config);

  const info = await transport.sendMail(mensaje);
  console.log(info);
}

async function sendGmail(req, res, next) {
  try {
    const variablesToEmail = await controller.getEmailLeader(req.body);
    const scheduleOfUser = await controller.scheduleByUser(req.body);
    const hourToRegisterMark = await controller.hourToRegisterMark();
    const validationOfMark = req.body.ValidationOfMark;
    console.log(variablesToEmail.Email);
    //configuracion del transporter
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: config.gmail.authusergmail,
        pass: config.gmail.authuserpass,
      }
    })

    //Para quien va, asunto y mensaje
    const mensaje = {
      from: `Valtx ${config.gmail.authusergmail}`,
      to: variablesToEmail.Email,
      subject: "Notificación de asistencias", //asunto
      text: `Estimado ${variablesToEmail.NameLeader} ${variablesToEmail.LastnameLeader},
      
      El usuario ${variablesToEmail.NameOfWorker} ${variablesToEmail.LastNamesWorker} ha registrado su asistencia a las ${hourToRegisterMark}. Por lo tanto, ${validationOfMark.toLocaleLowerCase()} ya que, su horario programado es de ${scheduleOfUser.HoraInicio} a ${scheduleOfUser.HoraFin}.
      
      Por favor, tomar las medidas necesarias.`
    }
    //envio de correo
    const info = await transporter.sendMail(mensaje);
    console.log(info);
      response.success(req, res, info.accepted, 'Con éxito', 200);

  } catch (e) {
    response.error(req, res, false, 'Ocurrio un error', 500);
  }
}

async function addPermissions(req, res, next) {
  try {
    const permission = await controller.addPermissions(req.body);
    if (!permission.messages) {
      response.success(req, res, permission, 'Con éxito', 200);
    } else {
      response.error(req, res, false, permission.messages, 200);
    }
  } catch (err) {
    response.error(req, res, false, errorProfiles, 500);
  }
};
/* sendGMailPrueba(); */
/* sendGmail(); */
module.exports = router;
startProgramming();
