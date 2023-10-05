const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableCronJob = 'horariocron';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

async function registerAbsencesController() {

  let initialDate =  moment();
  const hours = initialDate.format('HH');
  const minutes = initialDate.format('mm');
  const seconds = initialDate.format('ss');

  const formattedTime = /* '15:17' */`${hours}:${minutes}`;
  const [hour, minute] = formattedTime.split(':');
  const hourInMinutes = parseInt(hour) * 60 + parseInt(minute);

  //comprobar la hora
  if(hourInMinutes >= 556 && hourInMinutes <= 719){
    idTypesMarking = 1
  }else if (hourInMinutes  >= 796 && hourInMinutes <= 834){
    idTypesMarking = 2
  }else if (hourInMinutes  >= 905 && hourInMinutes <= 1079){
    idTypesMarking = 3
  }else if (hourInMinutes >= 1205 && hourInMinutes <= 1439){
    idTypesMarking = 4
  }
   
  let date = new Date() || '';
  try {
    const usersUnregistered = await db.recordFouls(tableUser, tableAssist, idTypesMarking);
    console.log('Resultado de la consulta:', usersUnregistered);

    if (usersUnregistered && usersUnregistered.length > 0) {
      for (const idUser  of usersUnregistered) {
        const record = {
          IdUsuarios: idUser,
          Fecha: date,
          idTMarcacion: idTypesMarking,
          idValidacion: 3,
        };

        console.log('Registrando falta para el usuario Id:', idUser );

        const response = await db.add(tableAssist, record);
        console.log('Falta registrada en la tabla asistencias:', response);
      }

      return 'Faltas registradas correctamente01';

    } else {
      console.log('Todos los usuarios han registrado asistencia para hoy.');
    }
    return 'Faltas registradas correctamente.';

  } catch (error) {
    console.error('Error al registrar faltas:', error);
    throw error; 
  }
}

async function startProgramming() {
  function scheduleTask(cronExpression) {
    cron.schedule(cronExpression, async () => {
      try {
        const message = await registerAbsencesController();
        console.log(`Ejecución programada a las ${cronExpression}: ${message}`);
      } catch (error) {
        console.error('Error en la ejecución programada:', error);
      }
    });
  }
  
  const cronJob = await db.allUsers(tableCronJob);
  const hourCronJob = cronJob.map((row) => {
          const hour = row.Horario.split(':'); 
          const minutes = hour[1];
          const hours = hour[0];
        
          return `${minutes} ${hours} * * *`;
        });
  console.log(hourCronJob);
  
  hourCronJob.forEach((cronExpression) => {
  scheduleTask(cronExpression);
  });
}
startProgramming();

