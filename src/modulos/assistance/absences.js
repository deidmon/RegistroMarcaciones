/* const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableCronJob = 'horariocron';
const tableParameterization = 'parametrizacion'; 
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

async function registerAbsencesController() {

  let initialDate =  moment();
  const hours = initialDate.format('HH');
  const minutes = initialDate.format('mm');
  const seconds = initialDate.format('ss');

  const formattedTime = `${hours}:${minutes}`;

  //comprobar la hora
  const parametrization = await db.getTableParametrizationTypeMarking(tableParameterization);     
              
    function validateTime(formattedTime) {
        const [hour, minutes] = formattedTime.split(':'); 
        for (const fila of parametrization) {
            const [startTime, minutesHome] = fila.HoraInicio.split(':'); 
            const [endTime, minutesEnd] = fila.HoraFin.split(':'); 
            const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
            const startTimeInMinutes = parseInt(startTime) * 60 + parseInt(minutesHome);
            const hourEndInMinutes = parseInt(endTime) * 60 + parseInt(minutesEnd);

            if (hourInMinutes >= startTimeInMinutes && hourInMinutes <= hourEndInMinutes) {
        
                const TypeMarking = fila.idTipoMarcaciones;
                    return TypeMarking
            }
        }
           
    }
    const idTypesMarking = validateTime(formattedTime);
  let date = new Date() || '';
  try {
    const usersUnregistered = await db.recordFouls(tableUser, tableAssist, idTypesMarking);
    

    if (usersUnregistered && usersUnregistered.length > 0) {
      for (const idUser  of usersUnregistered) {
        const record = {
          IdUsuarios: idUser,
          Fecha: date,
          idTMarcacion: idTypesMarking,
          idValidacion: 3,
          Hora: formattedTime,
        };

        console.log('Registrando falta para el usuario Id:', idUser );

        const response = await db.add(tableAssist, record);
        
      }

      return 'Faltas registradas correctamente';

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
          const hour = row.Horario; 
          const objetMoment = moment.tz(hour, 'HH:mm:ss','America/Lima');
          const minutes = objetMoment.format('mm');
          const hours = objetMoment.format('HH');
        
          return `${minutes} ${hours} * * *`;
        });
  console.log(hourCronJob);
  
  hourCronJob.forEach((cronExpression) => {
  scheduleTask(cronExpression);
  });
}
startProgramming();

 */