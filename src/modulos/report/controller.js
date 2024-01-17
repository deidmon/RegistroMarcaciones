const tableSchedule = 'horarios';
const tableUser = 'usuarios';
const tableAssistance = 'asistencias' ;
const tableTypeMarking = 'tipomarcaciones';
const ExcelJS = require('exceljs');
const stream = require('stream');


module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    async function reportAsistance(body) {
        /* console.log(body.Fecha) */
        const dataUser = await db.queryReportAsistance( tableAssistance,tableUser, tableTypeMarking, body.FechaInicio, body.FechaFin);
        /* console.log(dataUser) */
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        worksheet.columns = [
            { header: 'Marcacion', key: 'Marcación', width: 10 },
            { header: 'CIP', key: 'CIP', width: 10 },
            { header: 'Fecha', key: 'Fecha', width: 10 },
            { header: 'Hora', key: 'Hora', width: 10 },
            { header: 'Minutos', key: 'Minutos', width: 10 },
            { header: 'Codigo_Local', key: 'Código_Local', width: 15 },
            { header: 'TXT', key: 'TXT', width: 25 },
            { header: 'Longitud', key: 'Longitud', width: 10 },
           ];
        dataUser.forEach(row => {
        worksheet.addRow(row);
        });
        /* await workbook.xlsx.writeFile('MiArchivo.xlsx'); */
        const buffer = await workbook.xlsx.writeBuffer();
         return buffer; 
    };

    return {
        
        reportAsistance
    }
}
