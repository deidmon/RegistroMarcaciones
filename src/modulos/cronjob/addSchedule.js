const cron = require('node-cron');
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const db = require('../../DB/mysql');

var date;
const tableWorkers= 'usuarios'; 
const scheduleAssignment = 'asignacionhorarios';


async function getDateCurrent() {
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    date = `${age}-${month}-${day}`;
};

async function scheduleAssignmentCron() {
    const responseInfo = await db.querygenericToGetAll(scheduleAssignment); 
    await getDateCurrent();
    for(var i = 0; i < responseInfo.length; i++){

        if (date == responseInfo[i].fecha.toISOString().split('T')[0]){
            const response = await db.queryAddScheduleUser(tableWorkers, responseInfo[i].idHorarios, responseInfo[i].idUsuario);
            
            let whereDeleteRow = {
                id : responseInfo[i].id
            }
            await db.querygenericToDeleteData(scheduleAssignment, whereDeleteRow)
        }
    }
};

async function startProgrammingScheduleAssignment() {
    function scheduleTask(cronExpression) {
      cron.schedule(cronExpression, async () => {
        scheduleAssignmentCron();
      });
    }
  
    //CAMBIAR LA HORA A LA QUE SE EJECUTARA '02:00:00'
    let uniqueHourCronJob = ["02:00:00"]; //Cronjob inicial 
    const hourCronJob = uniqueHourCronJob.map((hour) => {
      const objetMoment = moment.tz(hour, "HH:mm:ss", "America/Lima");
      const serverTime = objetMoment.tz("UTC"); //  'ZonaHorariaDelServidor'
      const minutes = serverTime.format("mm");
      const hours = serverTime.format("HH");
  
      return `${minutes} ${hours} * * *`;
    });
    console.log(hourCronJob);
    hourCronJob.forEach((cronExpression) => {
      scheduleTask(cronExpression);
    });
  };

  startProgrammingScheduleAssignment()