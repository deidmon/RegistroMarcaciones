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

async function registerAbsencesController(idTypesMarking, usersUnregistered) {

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
      /* for (const idUser  of usersUnregistered) { */
        const record = {
          IdUsuarios: idUser,
          Fecha: date,
          idTMarcacion: idTypesMarking,
          idValidacion: 3,
          idValidacionSecond: 3,
          Hora: '',
          Created_by: 0,
        };

        console.log('Registrando falta para el usuario Id:', idUser );

        const response = await db.add(tableAssist, record);
        const addJustification =await addJustifications(date, idUser, idTypesMarking)
        
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
  function scheduleTask(cronExpression,schedule, date) {
    cron.schedule(cronExpression, async () => {
      let idSchedules = schedule
        try {
          let listUsersWithRequest
          const userWithPermision = await db.queryPermissionByDate(tablePermissions, tableUser, date, idSchedules);
          const userWithVacations = await db.queryVacationsByDate(tablePermissions, tableUser,date, idSchedules);
          listUsersWithRequest = [...userWithPermision, ...userWithVacations];
          /* console.log(listUsersWithRequest) */
          const usersUnregistered = await db.queryUserAlreadyMarkedToday(tableUser, tableAssist, date, idTypesMarking, idSchedules, listUsersWithRequest );
          console.log(usersUnregistered)
          const message = await registerAbsencesController(idTypesMarking, usersUnregistered); 
          console.log(`Ejecución programada a las ${cronExpression}: ${message} el ${date}`);
        } catch (error) {
          console.error('Error en la ejecución programada:', error);
        }
      
     
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
  /* console.log(schedule) */
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

startProgramming(1); 
startProgramming(4); 