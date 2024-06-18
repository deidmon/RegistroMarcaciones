const cron = require('node-cron');
const db = require('../../DB/mysql'); 
const tableAssist = 'asistencias';
const tableUser = 'usuarios';
const tableCronJob = 'horariocron';
const tableSchedule = 'horarios';
const tableDaysOff = 'descansos'; 
const tablePermissions = 'solicitudes';
const tableHoliday = 'feriados';
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');

async function registerAbsencesController(idTypesMarking, usersUnregistered, idSchedule) {

  let initialDate =  moment();
  let day = initialDate.format('DD'); 
  let month = initialDate.format('MM'); 
  let age = initialDate.format('YYYY');
  let date = `${age}-${month}-${day}`; 

  try {

    if (usersUnregistered && usersUnregistered.length > 0) {
        const promises = usersUnregistered.map(async (idUser) => {
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
        
        });

        const results = await Promise.all(promises);
        return 'Faltas registradas correctamente';

    } 

    return 'Todos los usuarios con horario H0 han registrado asistencia para hoy.';

  } catch (error) {
        console.error('Error al registrar faltas:', error);
    throw error; 
  }
}

async function addJustifications(date, idUser, idTypeMark) {
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
  function scheduleTask(cronExpression,schedule, date, validateDayWeek, startDate, endDate, yesterday) {
    task = cron.schedule(cronExpression, async () => {
        let idSchedules = schedule
        //Cantidad de feriados
        const countHolidays = await db.queryCountHolidayWeek(tableHoliday, startDate, date); 
        try {
          let usersUnregistered
          let message
          let listUsersWithRequest
          const userWithPermision = await db.queryPermissionByDate(tablePermissions, tableUser, date, idSchedules);
          const userWithVacations = await db.queryVacationsByDate(tablePermissions, tableUser,date, idSchedules);
          listUsersWithRequest = [...userWithPermision, ...userWithVacations];
          //Usuarios que no han marcado ese tipo de marcación hoy
          usersUnregistered = await db.queryUserAlreadyMarkedToday(tableUser, tableAssist, date, idTypesMarking, idSchedules, listUsersWithRequest ) ;
          usersUnregistered = usersUnregistered.length === 0 ? [] : usersUnregistered;

          if (validateDayWeek == 1){
            console.log('Hoy lunes no se registra faltas para tipo marcación entrada')
            return
          }
          if (validateDayWeek == 2 & countHolidays == 1){
            console.log('Hoy es martes y hubo feriado durante está semana, no se registra falta tipo marcación entrada')
            return
          }
          
          if (usersUnregistered.length === 0 ){
            console.log(`No hay usuarios a marcar falta de tipo de marcación: ${idTypesMarking}`)
            return
          }
          
         //Verificar las asistencias para cada usuario
          if (idTypesMarking == 1){
            await Promise.all(usersUnregistered.map(async (idUser) => {
            //Verificar la cantidad de permisos hasta ayer
            const countPermission = await db.queryCountWithPermissionUntilYesterday(tablePermissions, tableUser, startDate, yesterday, idUser);
            // restar la cantidad de permisos al usuario en countAsistance
            const countAsistance = validateDayWeek - countHolidays - countPermission - 1
            
            //si el countAsistance es 0 no marcar inasistencia
            if(countAsistance == 0){
              console.log(`No le corresponde falta al usuario: ${idUser}`)
              return
            }
            // Verificar si las marcaciones hasta hoy >= countAsistance 
            const verifyCountMarkUser = await db.queryVerifyCorrespondsFault(tableAssist, startDate, date, idTypesMarking,  idUser, countAsistance)
            
            if (verifyCountMarkUser == 0){
              message = await registerAbsencesController(idTypesMarking, [idUser], idSchedules);
              console.log(`Ejecución programada a las ${cronExpression}: ${message} - Día: ${date} - horario: H${idSchedules} - usuario: [${idUser}]`);
            }else {
              console.log(`No le corresponde falta al usuario: ${idUser}`)
            }
            
            }))
            
            
          }else {
            // Usuarios que marcaron entrada pero no han marcado la marcación del tipo de marcación actual
            const userToMarkedAbsencesToday = await db.queryUserAlreadyMarkedEntryToday(tableAssist, tableUser, date, 1, idSchedules, usersUnregistered );
            message = await registerAbsencesController(idTypesMarking, userToMarkedAbsencesToday, idSchedules);
            console.log(`Ejecución programada a las ${cronExpression}: ${message} - Día: ${date} - horario: H${idSchedules} - usuarios: [${userToMarkedAbsencesToday}]`);
          }
          
        } catch (error) {
          console.error('Error en la ejecución programada:', error);
        }
       
      task.stop();
    },
    );
  }
      
  ///version 2
  let initialDate = moment();
  let day = initialDate.format('DD'); 
  let month = initialDate.format('MM'); 
  let year = initialDate.format('YYYY');
  let date = `${year}-${month}-${day}`;
  let date_year_format = `${day}-${month}-${year}`;
  let yesterday = initialDate.subtract(1, 'days').format('YYYY-MM-DD');
  const fecha = new Date(date);
  const dayWeek = fecha.getDay() + 1;
  const validateDayWeek = (dayWeek ===  0) ?  7 : dayWeek;
  const fechaEspecifica = moment(date); // Fecha específica
  const weekNumber = fechaEspecifica.week(); //Número de semana

  // Calcula la fecha de inicio y fin de la semana
  function getWeekDates(year, weekNumber) {
        
        const startDate = moment().year(year).week(weekNumber).startOf('week').format('YYYY-MM-DD');        
        const endDate = moment(startDate).add(6, 'days').format('YYYY-MM-DD');
        
        return {
            startDate,
            endDate
        };
    }

  const dates = getWeekDates(year, weekNumber);

  //Comprobar si es feriado
  const is_holiday = await db.queryCheckHoliday( tableHoliday, date_year_format);
  if (is_holiday ===1){
    console.log('Hoy es feriado no se registra ausencias')
    return
  }


  const schedule = [0] // horario H0
  const cronJob = await db.cronjob(tableCronJob,idTypesMarking);
  const hourCronJob = cronJob.map((row) => {
    const hour = row.Horario; 
    let serverTime = moment.tz(hour, 'HH:mm:ss','America/Lima');
    // Agregar 3 minutos
    /* serverTime = serverTime.add(3, 'minutes'); */
    const minutes = serverTime.format('mm');
    const hours = serverTime.format('HH');

    return `${minutes} ${hours} * * *`;
    });

  console.log(hourCronJob);
  
  hourCronJob.forEach((cronExpression) => {
    scheduleTask(cronExpression, schedule, date, validateDayWeek, dates.startDate, dates.endDate, yesterday);
  });
}
async function startProgrammingAbsences() {
    function scheduleTask(cronExpression,) {
        cron.schedule(cronExpression, async () => {
            idListTypesMark = await db.queryScheduleCronActive(tableCronJob);
            if (!idListTypesMark || idListTypesMark.length === 0) {
                return "Los cronjob de inasistencia están desactivados";
            }
            await Promise.all(idListTypesMark.map(async (row) => {
                try {
                    startProgramming(row); 
                } catch (error) {
                    console.error('Error en la ejecución programada:', error);
                }
            
            }))
        
        });
    }

    //CAMBIAR LA HORA A LA QUE SE EJECUTARA '23:00:00'
    let uniqueHourCronJob = ['05:10']; //Cronjob inicial para tomar las horas de notificaciones
    const hourCronJob = uniqueHourCronJob.map((hour) => {
        const serverTime = moment.tz(hour, 'HH:mm:ss','America/Lima');
        //const serverTime = objetMoment.tz('UTC'); //  'ZonaHorariaDelServidor'
        const minutes = serverTime.format('mm');
        const hours = serverTime.format('HH');
        
        return `${minutes} ${hours} * * *`;
            
        });
    console.log(hourCronJob);
    hourCronJob.forEach((cronExpression) => {
        scheduleTask(cronExpression);
    });
}

startProgrammingAbsences();
