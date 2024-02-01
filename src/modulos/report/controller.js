const tableSchedule = 'horarios';
const tableUser = 'usuarios';
const tableAssistance = 'asistencias' ;
const tableTypeMarking = 'tipomarcaciones';
const tableDaysOff = 'descansos';
const tablePermissions = 'solicitudes';
const tableTypeRequest = 'tiposolicitudes';
const tableStateRequest = 'estadosolicitudes';
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

    async function reportOvertime(body) {
        /* console.log(body.Fecha) */
        const dataUser = await db.queryReportOvertime( tableAssistance, tableUser, tableSchedule,tableDaysOff,tableTypeMarking, body.FechaInicio, body.FechaFin);
        console.log(dataUser)
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        /* worksheet.getCell('A1').value = `Rweporte del: ${body.FechaInicio} al ${body.FechaFin}`
        worksheet.addRow([`Reporte del: ${body.FechaInicio} al ${body.FechaFin}`]); */
        worksheet.columns = [
            { header: 'Marcacion', key: 'Marcación', width: 10 },
           /*  { header: 'idTMarcaciones', key: 'idTMarcaciones', width: 10 }, */
           /*  { header: 'idValidacion', key: 'idValidacion', width: 10 }, */
            { header: 'IdUsuarios', key: 'IdUsuarios', width: 10 },
           /*  { header: 'IdHorarios', key: 'IdHorarios', width: 10 }, */
            { header: 'CIP', key: 'CIP', width: 10 },
            { header: 'Fecha', key: 'Fecha', width: 10 },
            { header: 'Hora', key: 'Hora', width: 10 },
            { header: 'HoraEntrada', key: 'HoraEntrada', width: 15 },
            { header: 'HoraSalida', key: 'HoraSalida', width: 15 },
            { header: 'HorasExtra_HH_mm', key: 'HorasExtra_HH_mm', width: 20 },
            { header: 'HorasExtra_HH', key: 'HorasExtra_HH', width: 15 },
           ];
        dataUser.forEach(row => {
            if (row.idValidacionSecond === 6){
                let minutosHora = row.Hora.split(':').reduce((p, c) => parseInt(p) * 60 + parseInt(c));
                let minutosEntrada;
                let diferenciaMinutos;
                // Calcular la diferencia en minutos
                if (row.idTMarcaciones === 1){
                    minutosEntrada = row.HoraEntrada.split(':').reduce((p, c) => parseInt(p) * 60 + parseInt(c));
                    diferenciaMinutos =  minutosEntrada - minutosHora;
                } else {
                    minutosEntrada = row.HoraSalida.split(':').reduce((p, c) => parseInt(p) * 60 + parseInt(c));
                    diferenciaMinutos =   minutosHora - minutosEntrada;
                }
                
                
                
                // Convertir la diferencia de minutos a horas
                let horasDiferencia = Math.floor(diferenciaMinutos / 60);
                let minutosDiferencia = Math.abs(diferenciaMinutos % 60);
                let minutosExtra = horasDiferencia + (minutosDiferencia/60);
        
                let horasDf = `${horasDiferencia}:${minutosDiferencia < 10 ? `0${minutosDiferencia}` : `${minutosDiferencia}`}`;
                let horasDf2 = `${minutosExtra}`;
                row.HorasExtra_HH_mm = horasDf;
                row.HorasExtra_HH = horasDf2;
            }
            
            worksheet.addRow(row);
        });
        /* await workbook.xlsx.writeFile('MiArchivo.xlsx'); */
        const buffer = await workbook.xlsx.writeBuffer();
         return buffer; 
    };

    async function reportRequest(body) {
        let dataUser;
        if (body.idTipoSolicitud === -1) {
            body.idTipoSolicitud = null;
        }
        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        let IdRolUser = whatRolHaveWorker[0].IdRol
        if(IdRolUser === 3){
            dataUser = await db.queryReportRequestRRHH( tablePermissions,tableUser, tableTypeMarking, tableTypeRequest, tableStateRequest, body.idTipoSolicitud, body.FechaInicio, body.FechaFin); 
        }else {
            var getIdsOfWorkers = await db.queryGetIdAsignedToLeader(body.idUser);//Obtener los ids de trabajadores asignados al lider
            var listaDeIds = getIdsOfWorkers.map(function (rowDataPacket) {//Mapear los objetos RowDataPacket y pasarlos a una lista de  los                 
                return rowDataPacket.idUsuario;
            });
            var idWorkersString = listaDeIds.join(', ');//convierte el array en una cadena separada por comas. 
            if (idWorkersString === '') {
                idWorkersString = '0';
            };
            dataUser = await db.queryReportRequest( tablePermissions,tableUser, tableTypeMarking, tableTypeRequest, tableStateRequest, body.idTipoSolicitud, body.FechaInicio, body.FechaFin,idWorkersString);
        }
        
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        worksheet.columns = [
            { header: 'idTipoSolicitud', key: 'idTipoSolicitud', width: 15 },
            { header: 'TipoSolicitud', key: 'TipoSolicitud', width: 15 },
            { header: 'Fecha', key: 'Fecha', width: 10 },
            /* { header: 'idTMarcaciones', key: 'idTMarcaciones', width: 10 }, */
            { header: 'Marcación', key: 'Marcación', width: 10 },
            /* { header: 'IdUsuarios', key: 'IdUsuarios', width: 10 }, */
            { header: 'Motivo', key: 'Motivo', width: 30 },
            { header: 'CIP', key: 'CIP', width: 15 },
            { header: 'idEstadoSolicitud', key: 'idEstadoSolicitud', width: 20 },
            { header: 'EstadoSolicitud', key: 'EstadoSolicitud', width: 20 },
           /*  { header: 'Updated_byF', key: 'Updated_byF', width: 10 }, */
            { header: 'Modificador', key: 'Modificador', width: 20 },
            
           ];
        dataUser.forEach(row => {
        worksheet.addRow(row);
        });
        /* await workbook.xlsx.writeFile('MiArchivo.xlsx'); */
        const buffer = await workbook.xlsx.writeBuffer();
         return buffer; 
    };

    return {
        
        reportAsistance,
        reportOvertime,
        reportRequest
    }
}
