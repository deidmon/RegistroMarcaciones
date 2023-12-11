const tableSchedule = 'horarios';
const tableUser = 'usuarios';

module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function allSchedules(){
        return db.queryAllSchedules(tableSchedule);
    };

    async function addScheduleUser(body) {
        const dataUser = await db.queryAddScheduleUser(tableUser, body.idSchedule, body.idUsers);
        return dataUser;
    };

    return {
        allSchedules,
        addScheduleUser
    }
}
