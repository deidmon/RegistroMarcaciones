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
  return hourAndMinutes = "09:32"; /* `${hour}:${minutes}`; */
}

/* 📌 Obtener el día */
async function getJustDay(pInitialDate) {
  return (dayOfWeekName = pInitialDate.format("dddd"));
}

module.exports = {
  parseHourToMinutes,
  getDateToday,
  getTimeNow,
  getJustDay,
};
