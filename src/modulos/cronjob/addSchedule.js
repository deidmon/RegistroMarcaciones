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

cron.schedule('25 15 * * *', () => {
    // Agrega aquí la lógica que deseas ejecutar
    console.log("Empezo la hora");
    scheduleAssignmentCron();
    console.log('La tarea se ejecutó a las 6 a.m.');
});