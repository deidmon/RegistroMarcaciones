const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableCronJob = 'horariocron';
const tableSchedule = 'horarios';
const tableDaysOff = 'descansos'; 
const tablePermissions = 'solicitudes';
const tableHoliday = 'feriados';
const tableExceptions = 'excepciones';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

async function registerAbsencesController(idTypesMarking, usersUnregistered, idSchedule,checkBreak) {

  let initialDate =  moment();
  let day = initialDate.format('DD'); 
  let month = initialDate.format('MM'); 
  let age = initialDate.format('YYYY');
  let date = `${age}-${month}-${day}`; 
  const hours = initialDate.format('HH');
  const minutes = initialDate.format('mm');
  const seconds = initialDate.format('ss');

  const formattedTime = `${hours}:${minutes}`;

  try {

    if (usersUnregistered && usersUnregistered.length > 0) {
      const promises = usersUnregistered.map(async (idUser) => {
        if (checkBreak === 0 && (idTypesMarking ===2 || idTypesMarking === 3 )){
          const record = {
            IdUsuarios: idUser,
            Fecha: date,
            idTMarcacion: idTypesMarking,
            idValidacion: 1,
            idValidacionSecond: 1,
            Hora: '',
            Created_by: 0,
            idHorario: idSchedule,
          };

          const response = await db.add(tableAssist, record);
          /* const addJustification =await addJustifications(date, idUser, idTypesMarking) */
        }else {
          const record = {
            IdUsuarios: idUser,
            Fecha: date,
            idTMarcacion: idTypesMarking,
            idValidacion: 3,
            idValidacionSecond: 3,
            Hora: '',
            Created_by: 0,
            idHorario: idSchedule,
          };

          const response = await db.add(tableAssist, record);
          const addJustification =await addJustifications(date, idUser, idTypesMarking)
        }
      });

      const results = await Promise.all(promises);
      return 'Faltas registradas correctamente';

    } 

    return 'Todos los usuarios han registrado asistencia para hoy.';

  } catch (error) {
    console.error('Error al registrar faltas:', error);
    throw error; 
  }
}
async function addJustifications(date, idUser, idTypeMark){
  const data = await db.queryConsultTable(tableAssist,  {IdUsuarios:idUser},{Fecha:date},{IdTMarcacion:idTypeMark});
  /* console.log(data) */
  if (!data || data.length === 0) {
      message ='No existe marcación a justificar';
      return {"messages": message};
  }
  const Justifications = {
      idTipoSolicitud: 1,
      idUsuario: idUser,
      Fecha: date,
      IdTMarcaciones: idTypeMark,
      Motivo: 'No registra marcación' ,
      estadoSolicitudF: 1,
  }  

  const respuesta = await db.addJustification(tablePermissions, Justifications);
      
  if (respuesta) {
      message = 'Justificación añadida con éxito';
      return {"messages": message};
  } 
  message ='No se pudo añadir la justificación';
  return {"messages": message};
  
}


async function startProgramming(idTypesMarking) {
  let task;
  function scheduleTask(cronExpression,schedule, date) {
    task = cron.schedule(cronExpression, async () => {
      let idSchedules = schedule
        await Promise.all(idSchedules.map(async (row) => {
          try {
            const checkBreak = await db.queryCheckBreak(tableSchedule, row) 
            let listUsersWithRequest
            const userWithPermision = await db.queryPermissionByDate(tablePermissions, tableUser, date, row);
            const userWithVacations = await db.queryVacationsByDate(tablePermissions, tableUser,date, row);
            listUsersWithRequest = [...userWithPermision, ...userWithVacations];
            /* console.log(listUsersWithRequest) */
            const usersUnregistered = await db.queryUserAlreadyMarkedToday(tableUser, tableAssist, date, idTypesMarking, row, listUsersWithRequest );
            const message = await registerAbsencesController(idTypesMarking, usersUnregistered, row, checkBreak); 
            console.log(`Ejecución programada a las ${cronExpression}: ${message} - Día: ${date} - horario: H${row} - usuarios: [${usersUnregistered}]`);
          } catch (error) {
            console.error('Error en la ejecución programada:', error);
          }
        
       }))
      task.stop();
    },
    );
  }
      
  ///version 2
  let initialDate = moment();
  let day = initialDate.format('DD'); 
  let month = initialDate.format('MM'); 
  let age = initialDate.format('YYYY');
  let date = `${age}-${month}-${day}`;
  let date_year_format = `${day}-${month}-${age}`;
  const is_holiday = await db.queryCheckHoliday( tableHoliday, date_year_format);
  if (is_holiday ===1){
    console.log('Hoy es feriado no se registra ausencias')
    return
  }
  const dayOfWeekName = initialDate.format('dddd');
  const scheduleByCronJob = await db.queryScheduleByCronjob(tableSchedule, tableDaysOff, tableExceptions, dayOfWeekName);
  const schedule = scheduleByCronJob.map(row => row.IdHorarios);
  const cronJob = await db.cronjob(tableCronJob,idTypesMarking);
  const hourCronJob = cronJob.map((row) => {
          const hour = row.Horario; 
          const objetMoment = moment.tz(hour, 'HH:mm:ss','America/Lima');
          const serverTime = objetMoment.tz('UTC'); //  'ZonaHorariaDelServidor' ------------------cambiar al servidor
          const minutes = serverTime.format('mm');
          const hours = serverTime.format('HH');
        
          return `${minutes} ${hours} * * *`;
        });
  console.log(hourCronJob);
  
  hourCronJob.forEach((cronExpression) => {
  scheduleTask(cronExpression, schedule, date);
  });
}
async function startProgrammingAbsences() {
  function scheduleTask(cronExpression,) {
    cron.schedule(cronExpression, async () => {
      IdSchedulesCronList = await db.queryScheduleCronActive(tableCronJob);
      if (!IdSchedulesCronList || IdSchedulesCronList.length === 0) {
        return "Los cronjob de inasistencia están desactivados";
      }
      await Promise.all(IdSchedulesCronList.map(async (row) => {
        try {
          startProgramming(row); 
        } catch (error) {
          console.error('Error en la ejecución programada:', error);
        }
      
     }))
     
    },
    );
  }

  //CAMBIAR LA HORA A LA QUE SE EJECUTARA '23:00:00'
  let uniqueHourCronJob = ['23:00']; //Cronjob inicial para tomar las horas de notificaciones
  const hourCronJob = uniqueHourCronJob.map((hour) => {
          const objetMoment = moment.tz(hour, 'HH:mm:ss','America/Lima');
          const serverTime = objetMoment.tz('UTC'); //  'ZonaHorariaDelServidor'
          const minutes = serverTime.format('mm');
          const hours = serverTime.format('HH');
        
          return `${minutes} ${hours} * * *`;
        });
  console.log(hourCronJob);
  hourCronJob.forEach((cronExpression) => {
    scheduleTask(cronExpression);
    }

  );
}

startProgrammingAbsences();
