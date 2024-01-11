const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableCronJob = 'horariocron';
const tableSchedule = 'horarios';
const tableDaysOff = 'descansos';
const tableJustifications = 'justificaciones';
const tableParameterization = 'parametrizacion'; 
const tablePermissions = 'solicitudes';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

async function registerAbsencesController(idTypesMarking, IdHorarios) {

  let initialDate =  moment();
  let day = initialDate.format('DD'); 
  let month = initialDate.format('MM'); 
  let age = initialDate.format('YYYY');
  let date = `${age}-${month}-${day}`; 
  const hours = initialDate.format('HH');
  const minutes = initialDate.format('mm');
  const seconds = initialDate.format('ss');

  const formattedTime = `${hours}:${minutes}`;

  /* const idTypesMarking = idTypesMarking; */
  const dayOfWeekName = initialDate.format('dddd'); 
  const daysOff = await db.queryGetDaysOffBySchedule(tableDaysOff,tableSchedule, { IdHorarios: IdHorarios });
  if (daysOff.includes(dayOfWeekName)) {
    return 'Día de descanso'
  }
  try {
    const usersUnregistered = await db.recordFoulsCronjob(tableUser, tableAssist,{ IdHorarios: IdHorarios } ,{ idTMarcacion : idTypesMarking }, { IdHorarios: IdHorarios });
    console.log(usersUnregistered)

    if (usersUnregistered && usersUnregistered.length > 0) {
      const promises = usersUnregistered.map(async (idUser) => {
      /* for (const idUser  of usersUnregistered) { */
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
  function scheduleTask(cronExpression) {
    cron.schedule(cronExpression, async () => {
      const IdHorariosList = await db.querylistSchedule(tableSchedule);
      console.log(IdHorariosList)
     /*  for (const IdHorarios of IdHorariosList) { */
     await Promise.all(IdHorariosList.map(async (IdHorarios) => {
        try {
          const message = await registerAbsencesController(idTypesMarking,IdHorarios);
          console.log(`Ejecución programada a las ${cronExpression}: ${message}`);
        } catch (error) {
          console.error('Error en la ejecución programada:', error);
        }
      /* } */
     }))
    },
    );
  }
  
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
  scheduleTask(cronExpression);
  });
}
startProgramming(1); 
startProgramming(4); 