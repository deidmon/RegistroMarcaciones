const express = require('express');
const constant = require("./constants");
const response = require("../red/response");
const config = require("../config");
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
async function sendCodeVerificationOutlook(emailUser, codeVerification, req, res) {
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
      text: `Tu código de verifciación para cambiar tu contraseña
      en Sistema de asistencia Valtx es ${codeVerification}. No lo comparatas con nadie.
      \n
      `,
    };
    
    //envio de correo
    const info = await transporter.sendMail(mensaje);
    console.log(info.accepted);
    response.success(req, res, info.accepted, "Con éxito", 200);
  } catch (e) {

    response.error(req, res, false, constant.messageErrorEmail, 500);
  }
}

module.exports = {
  parseHourToMinutes,
  getDateToday,
  getTimeNow,
  getJustDay,
  parseMinutesToHour,
  sendCodeVerificationOutlook
};
