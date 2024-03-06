const express = require('express');
const constant = require("./constants");
const response = require("../red/response");
const config = require("../config");
const nodemailer = require("nodemailer");
const router = express.Router();


/* 📌 Pasar horas a minutos */
async function parseHourToMinutes(hourToParse) {
  const [parseHour, parseMinutes] = hourToParse.split(":");
  return (hourInMinutesParse =
    parseInt(parseHour) * 60 + parseInt(parseMinutes));
};

/* 📌 Obtener la fecha */
async function getDateToday(pInitialDate) {
  let day = pInitialDate.format("DD");
  let month = pInitialDate.format("MM");
  let age = pInitialDate.format("YYYY");
  return (date = `${age}-${month}-${day}`);
};

/* 📌 Obtener la hora */
async function getTimeNow(pInitialDate) {
  let hour = pInitialDate.format("HH");
  let minutes = pInitialDate.format("mm");
  return hourAndMinutes = /* "06:46" */ `${hour}:${minutes}`;
};

/* 📌 Obtener el día */
async function getJustDay(pInitialDate) {
  return (dayOfWeekName = pInitialDate.format("dddd"));
};

/* 📌 Pasar minutos a horas */
async function parseMinutesToHour(minutesToParse) {
  const hours = Math.floor(minutesToParse / 60);
  const minutes = minutesToParse % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
};

/* 📌 Enviamos correo al usario con su codigo de verificación*/
async function sendCodeVerificationOutlook(emailUser, codeVerification) {
  try {
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
    console.log("Aqui llegaaaaaaaaaaaaaaaaaaaaaaaaaaaaa el correo")
    //Para quien va, asunto y mensaje
    const mensaje = {
      from: `Valtx ${config.outlook.authuservmail}`,
      to: emailUser,
      subject: "Código de verificación", //asunto
      text: `Tu código de verificación para cambiar tu contraseña en Sistema de asistencia Valtx es ${codeVerification}. No lo comparatas con nadie.
      \n
      `,
    };
    
    //envio de correo
    const info = await transporter.sendMail(mensaje);
    console.log(info.accepted);
    return true;
    /* response.success(req, res, info.accepted, "Con éxito", 200); */
  } catch (e) {
    return false;
    /* response.error(req, res, false, constant.messageErrorEmail, 500); */
  }
}

/* 📌 Obtener la fecha y hora + 1 hora que sera el tiempo de expiración */
async function getDateTimeToday(pInitialDate) {
  let day = pInitialDate.format("DD");
  let month = pInitialDate.format("MM");
  let age = pInitialDate.format("YYYY");
  let hour = pInitialDate.format("HH");

  // Sumar una hora al valor de la hora actual
  let newHour = parseInt(hour) + 1;
  if (newHour < 10) {
    newHour = '0' + newHour; // Añadir un cero delante si es necesario para mantener el formato HH
  } else if (newHour >= 24) {
    newHour = '00'; // Reiniciar a 00 si la suma supera las 23 horas
  }
  return (date = `${age}-${month}-${day} ${newHour}`);
};

/* 📌 Obtener la fecha y hora + 1 hora que sera el tiempo de expiración */
async function getDateTimeToday(pInitialDate) {
  let day = pInitialDate.format("DD");
  let month = pInitialDate.format("MM");
  let age = pInitialDate.format("YYYY");
  let hour = pInitialDate.format("HH");
  return (date = `${age}-${month}-${day} ${hour}`);
}

module.exports = {
  parseHourToMinutes,
  getDateToday,
  getTimeNow,
  getJustDay,
  parseMinutesToHour,
  sendCodeVerificationOutlook,
  getDateTimeToday,
};
