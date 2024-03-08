const express = require("express");
const cron = require("node-cron");
const db = require("../../DB/mysql");
const response = require("../../red/response");
const controller = require("./index");
const axios = require("axios");
const nodemailer = require("nodemailer");
const config = require("../../config");
const constant = require("../../helpers/constants");
const router = express.Router();
const moment = require("moment-timezone");
moment.tz.setDefault("America/Lima");

const tableSchedule = "horarios";
const tableAssist = "asistencias";
const tableUser = "usuarios";
const tableDaysOff = "descansos";
const tablePermissions = "solicitudes";
const tableExceptions = "excepciones";
const tableHoliday = "feriados";

const bearerToken =
  "AAAABAqfEQ8:APA91bEgr4R2yhqoez4YD1mSHtGnQcNChmI7uYRvK7CXFaVWKi98S3v0clv5sxP_UYK9vomiFAEAxPxhbUR-gR2En4b_hRuwxATvLqhq0dtxHgqWT3qQrDzxrGFWJepvmKGsAPwh49Yi";
const endpoint = "https://fcm.googleapis.com/fcm/send";

router.post("/latenessreport", sendmailOutlook);

/* 📌 ---*/
async function UsersUnmarked(usersUnmarked) {
  try {
    const tokensUsersUnmarked = await controller.tokenUsersUnmarked(
      usersUnmarked
    );
    return tokensUsersUnmarked;
  } catch (err) {
    console.log(err);
  }
};

/* 📌 ---*/
async function notificationUsersUnmarked(usersUnmarked) {
  if (!usersUnmarked || usersUnmarked.length === 0) {
    return "Todos los usuarios ya marcaron asistencia";
  }
  const valuesTokenUser = await UsersUnmarked(usersUnmarked);
  // console.log(valuesTokenUser)
  if (!valuesTokenUser || valuesTokenUser.length === 0) {
    return "Todos los usuarios ya marcaron asistencia";
  }
  const jsonData = {
    priority: "high",
    data: {
      click_action: "FLUTTER_NOTIFICATION_CLICK",
      body: "Tienes una marcación pendiente por hacer",
      title: "MARCACIONES",
    },
    registration_ids: valuesTokenUser,
  };
  try {
    const response = await axios.post(endpoint, jsonData, {
      headers: {
        Authorization: `bearer ${bearerToken}`,
      },
    });
    //console.log(`Usuario notificado con éxito: ${JSON.stringify(jsonData)}`);
    return "Usuarios notificados con éxito";
  } catch (error) {
    console.error(`Error al notificar usuario: ${error.message}`);
    return "Error al notificar usuarios";
  }
};

/* 📌 ---*/
async function startProgramming(idTypesMarking) {
  let task;
  function scheduleTask(cronExpression, dayOfWeekName, date) {
    task = cron.schedule(cronExpression, async () => {
      let time = cronToTime(cronExpression);
      let IdHorariosList;
      let IdScheduleByHour;
      if (idTypesMarking === 1) {
        IdHorariosList = await db.queryScheduleByHour(
          tableSchedule,
          tableDaysOff,
          tableExceptions,
          dayOfWeekName,
          { HoraInicio: time }
        );
        IdScheduleByHour = IdHorariosList.map((row) => row.IdHorarios);
        // console.log(IdScheduleByHour)
      }
      if (idTypesMarking === 4) {
        IdHorariosList = await db.queryScheduleByHour(
          tableSchedule,
          tableDaysOff,
          tableExceptions,
          dayOfWeekName,
          { HoraFin: time }
        );
        IdScheduleByHour = IdHorariosList.map((row) => row.IdHorarios);
        // console.log(IdScheduleByHour)
      }

      await Promise.all(
        IdScheduleByHour.map(async (row) => {
          try {
            let listUsersWithRequest;
            const userWithPermision = await db.queryPermissionByDate(
              tablePermissions,
              tableUser,
              date,
              row
            );
            const userWithVacations = await db.queryVacationsByDate(
              tablePermissions,
              tableUser,
              date,
              row
            );
            listUsersWithRequest = [...userWithPermision, ...userWithVacations];
            /* console.log(listUsersWithRequest) */
            const usersUnregistered = await db.queryUserAlreadyMarkedToday(
              tableUser,
              tableAssist,
              date,
              idTypesMarking,
              row,
              listUsersWithRequest
            );
            const message = await notificationUsersUnmarked(usersUnregistered);
            console.log(
              `Ejecución programada a las ${cronExpression}: ${message} - Día: ${date} - horario: H${row} - usuarios notificados: [${usersUnregistered}]`
            );
          } catch (error) {
            console.error("Error en la ejecución programada:", error);
          }
        })
      );
      task.stop();
    });
  }

  ///version 2
  let initialDate = moment();
  let day = initialDate.format("DD");
  let month = initialDate.format("MM");
  let age = initialDate.format("YYYY");
  let date = `${age}-${month}-${day}`;
  let date_year_format = `${day}-${month}-${age}`;
  const is_holiday = await db.queryCheckHoliday(tableHoliday, date_year_format);
  if (is_holiday === 1) {
    console.log("Hoy es feriado no habrá notificaciones");
    return;
  }
  const dayOfWeekName = initialDate.format("dddd");
  const cronJob = await db.queryScheduleByCronjob(
    tableSchedule,
    tableDaysOff,
    tableExceptions,
    dayOfWeekName
  );
  /* const schedule = cronJob.map(row => row.IdHorarios);
  console.log(schedule) */
  let horas;
  if (idTypesMarking === 1) {
    horas = cronJob.map((row) => row.HoraInicio);
  } else {
    horas = cronJob.map((row) => row.HoraFin);
  }
  let uniqueHourCronJob = [...new Set(horas)];
  const hourCronJob = uniqueHourCronJob.map((hour) => {
    const objetMoment = moment.tz(hour, "HH:mm:ss", "America/Lima");
    const serverTime = objetMoment.tz("UTC"); //  'ZonaHorariaDelServidor' ------------------cambiar al servidor 'UTC'
    const minutes = serverTime.format("mm");
    const hours = serverTime.format("HH");
    /* // Obtén el día del mes (1-31)
          const day = serverTime.format('DD');
          // Obtén el mes (1-12)
          const month = serverTime.format('MM');
          // Obtén el día de la semana (0-6, donde  0 es domingo y  6 es sábado)
          const dayOfWeek = serverTime.format('d');
          const year = serverTime.format('YYYY'); */
    return `${minutes} ${hours} * * *`;
  });
  console.log(hourCronJob);
  hourCronJob.forEach((cronExpression) => {
    scheduleTask(cronExpression, dayOfWeekName, date);
  });
};

//-------------Habilitar -5 horas cuando subimos a AWS
function cronToTime(cron) {
  const segments = cron.split(" ");
  let hours = parseInt(segments[1], 10); // Cambia 'const' por 'let'
  const minutes = parseInt(segments[0], 10);
  // Restar   5 horas
  hours -= 5;

  // Si las horas son menores que   0, restarlas al día anterior
  if (hours < 0) {
    hours += 24;
  }
  // Formatear en 'HH:mm'
  const formattedTime = `${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}`;
  return formattedTime;
};

/* 📌 Enviamos correo gmail al lider*/
async function sendGmail(req, res, next) {
  try {
    const variablesToEmail = await controller.getEmailLeader(req.body);
    const scheduleOfUser = await controller.scheduleByUser(req.body);
    const hourToRegisterMark = await controller.hourToRegisterMark();
    const validationOfMark = req.body.ValidationOfMark;
    console.log(variablesToEmail.Email);

    //configuracion del transporter
    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 587,
      secure: false,
      auth: {
        user: config.gmail.authusergmail,
        pass: config.gmail.authuserpass,
      },
    });

    //Para quien va, asunto y mensaje
    const mensaje = {
      from: `Valtx ${config.gmail.authusergmail}`,
      to: variablesToEmail.Email,
      subject: "Notificación de asistencias", //asunto
      text: `Estimado ${variablesToEmail.NameLeader} ${
        variablesToEmail.LastnameLeader
      },
      
      El usuario ${variablesToEmail.NameOfWorker} ${
        variablesToEmail.LastNamesWorker
      } ha registrado su asistencia a las ${hourToRegisterMark}. Por lo tanto, ${validationOfMark.toLocaleLowerCase()} ya que, su horario programado es de ${
        scheduleOfUser.HoraInicio
      } a ${scheduleOfUser.HoraFin}.
      
      Por favor, tomar las medidas necesarias.`,
    };
    //envio de correo
    const info = await transporter.sendMail(mensaje);
    console.log(info);
    response.success(req, res, info.accepted, "Con éxito", 200);
  } catch (e) {
    response.error(req, res, false, "Ocurrio un error", 500);
  }
};

/* 📌 Enviamos correo gmail al lider*/
async function sendmailOutlook(req, res, next) {
  try {

    const variablesToEmail = await controller.getEmailLeader(req.body);
    console.log(variablesToEmail,'variablesToEmail');
    if(variablesToEmail) {
      const scheduleOfUser = await controller.scheduleByUser(req.body);
      const typeMarkDescription = await controller.typeMarkDescription(req.body);
      const hourToRegisterMark = await controller.hourToRegisterMark();
      const validationOfMark = req.body.ValidationOfMark;

      //configuracion del transporter
      const transporter = nodemailer.createTransport({
        host: constant.vmailHost,
        port: constant.mailPort,
        secure: false,
        auth: {
          user: config.outlook.authuservmail,
          pass: config.outlook.authusevpass,
        },
      });

      //Para quien va, asunto y mensaje
      const mensaje = {
        from: `Valtx ${config.outlook.authuservmail}`,
        to: variablesToEmail.Email,
        subject: "Notificación de asistencias", //asunto
        text: `Estimado(a) ${variablesToEmail.NameLeader} ${
          variablesToEmail.LastnameLeader
        },\n
El usuario ${variablesToEmail.NameOfWorker} ${
          variablesToEmail.LastNamesWorker
        } ha registrado su asistencia de ${
          typeMarkDescription.descripcion
        } a las ${hourToRegisterMark}.\n\nPor lo tanto, ${validationOfMark.toLocaleLowerCase()}\n\nYa que, su horario programado es de ${
          scheduleOfUser.HoraInicio
        } a ${scheduleOfUser.HoraFin}.\nPara mas detalles, por favor ir a ${constant.linkValtx} e ingresar a la sección de justificaciones

Atentamente 
Dirección Gestión y Desarrollo Humano.`,
      };

      //envio de correo
      const info = await transporter.sendMail(mensaje);

      return response.success(req, res, info.accepted, "Con éxito", 200);
    }
    return response.success(req, res, ["No tiene lider asignado"], "Con éxito", 200);
  } catch (e) {
    response.error(req, res, false, constant.messageErrorEmail, 500);
  }
};

async function addPermissions(req, res, next) {
  try {
    const permission = await controller.addPermissions(req.body);
    if (!permission.messages) {
      response.success(req, res, permission, "Con éxito", 200);
    } else {
      response.error(req, res, false, permission.messages, 200);
    }
  } catch (err) {
    response.error(req, res, false, errorProfiles, 500);
  }
};

async function startProgrammingNotifications() {
  function scheduleTask(cronExpression) {
    cron.schedule(cronExpression, async () => {
      startProgramming(1);
      startProgramming(4);
    });
  }

  //CAMBIAR LA HORA A LA QUE SE EJECUTARA '01::00:00'
  let uniqueHourCronJob = ["01:00:00"]; //Cronjob inicial para tomar las horas de notificaciones
  const hourCronJob = uniqueHourCronJob.map((hour) => {
    const objetMoment = moment.tz(hour, "HH:mm:ss", "America/Lima");
    /* console.log(objetMoment) */
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

module.exports = router;

startProgrammingNotifications();
