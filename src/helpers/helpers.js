/* 📌 Pasar horas a minutos */
async function parseHourToMinutes(hourToParse) {
  const [parseHour, parseMinutes] = hourToParse.split(":");
  return (hourInMinutesParse =
    parseInt(parseHour) * 60 + parseInt(parseMinutes));
}

/* 📌 Obtener la fecha */
async function getDateToday(pInitialDate) {
  let day = pInitialDate.format("DD");
  let month = pInitialDate.format("MM");
  let age = pInitialDate.format("YYYY");
  return (date = `${age}-${month}-${day}`);
}

/* 📌 Obtener la hora */
async function getTimeNow(pInitialDate) {
  let hour = pInitialDate.format("HH");
  let minutes = pInitialDate.format("mm");
  return hourAndMinutes = /* "07:46" */ `${hour}:${minutes}`;
}

/* 📌 Obtener el día */
async function getJustDay(pInitialDate) {
  return (dayOfWeekName = pInitialDate.format("dddd"));
}

/* 📌 Pasar minutos a horas */
async function parseMinutesToHour(minutesToParse) {
  const hours = Math.floor(minutesToParse / 60);
  const minutes = minutesToParse % 60;
  return `${hours}:${minutes.toString().padStart(2, '0')}`;
}

module.exports = {
  parseHourToMinutes,
  getDateToday,
  getTimeNow,
  getJustDay,
  parseMinutesToHour,

};
