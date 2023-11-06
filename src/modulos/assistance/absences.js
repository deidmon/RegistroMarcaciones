const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableCronJob = 'horariocron';
const tableParameterization = 'parametrizacion'; 
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

async function registerAbsencesController() {

  let initialDate =  moment();
  let day = initialDate.format('DD'); 
  let month = initialDate.format('MM'); 
  let age = initialDate.format('YYYY');
  let date = `${age}-${month}-${day}`; 
  const hours = initialDate.format('HH');
  const minutes = initialDate.format('mm');
  const seconds = initialDate.format('ss');

  const formattedTime = `${hours}:${minutes}`;

  const idTypesMarking = 1;
  try {
    const usersUnregistered = await db.recordFoulsCronjob(tableUser, tableAssist);
    

    if (usersUnregistered && usersUnregistered.length > 0) {
      for (const idUser  of usersUnregistered) {
        const record = {
          IdUsuarios: idUser,
          Fecha: date,
          idTMarcacion: idTypesMarking,
          idValidacion: 3,
          Hora: '',
          Created_by: 0,
        };

        console.log('Registrando falta para el usuario Id:', idUser );

        const response = await db.add(tableAssist, record);
        
      }

      return 'Faltas registradas correctamente';

    } 
    return 'Todos los usuarios han registrado asistencia para hoy.';

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
  
  const cronJob = await db.cronjob(tableCronJob);
  const hourCronJob = cronJob.map((row) => {
          const hour = row.Horario; 
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