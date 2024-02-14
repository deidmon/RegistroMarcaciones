const tableSchedule = 'horarios';
const tableUser = 'usuarios';
const tableAssistance = 'asistencias' ;
const tableTypeMarking = 'tipomarcaciones';
const tableDaysOff = 'descansos';
const tablePermissions = 'solicitudes';
const tableTypeRequest = 'tiposolicitudes';
const tableStateRequest = 'estadosolicitudes';
const tableExceptions = 'excepciones';
const tableHoliday = 'feriados';
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
            /* { header: 'idTipoSolicitud', key: 'idTipoSolicitud', width: 15 }, */
            { header: 'TipoSolicitud', key: 'TipoSolicitud', width: 15 },
            { header: 'Fecha', key: 'Fecha', width: 10 },
            /* { header: 'idTMarcaciones', key: 'idTMarcaciones', width: 10 }, */
            { header: 'Marcación', key: 'Marcación', width: 10 },
            /* { header: 'IdUsuarios', key: 'IdUsuarios', width: 10 }, */
            { header: 'Motivo', key: 'Motivo', width: 30 },
            { header: 'CIP', key: 'CIP', width: 15 },
            /* { header: 'idEstadoSolicitud', key: 'idEstadoSolicitud', width: 20 }, */
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

    async function reportOvertimeNew(body) {
        const dataUser = await db.queryReportOvertimeNew( tableAssistance, tableUser, tableTypeMarking, tableSchedule, tableExceptions,tableDaysOff, body.FechaInicio, body.FechaFin);
        /* console.log(dataUser) */
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        worksheet.columns = [
            /* { header: 'idTMarcacion', key: 'idTMarcacion', width: 10 }, */
            { header: 'CIP', key: 'CIP', width: 10 },
            { header: 'Fecha', key: 'Fecha', width: 10 },
            { header: 'Hora', key: 'Hora', width: 10 },
            { header: 'Tipo_Hora', key: 'Tipo_Hora', width: 10 },
            { header: 'Cód_Horas', key: 'Cód_Horas', width: 10 },
            { header: 'Cód_Empresa', key: 'Cód_Empresa', width: 10 },
            { header: 'Tipo_Hora1', key: 'Tipo_Hora1', width: 10 },
            /* { header: 'IdHorarios', key: 'IdHorarios', width: 15 },
            { header: 'HoraInicio', key: 'HoraInicio', width: 15 },
            { header: 'HoraFin', key: 'HoraFin', width: 15 },
            { header: 'diaExcepcion', key: 'diaExcepcion', width: 20 },
            { header: 'HoraInicio_Excepcion', key: 'HoraInicio_Excepcion', width: 15 },
            { header: 'HoraFin_Excepcion', key: 'HoraFin_Excepcion', width: 15 },
            { header: 'HorasExtra_HH_mm', key: 'HorasExtra_HH_mm', width: 15 }, */
            { header: 'CARGA', key: 'CARGA', width: 15 },
           ];
           worksheet.spliceColumns(8,  0, []);
           for (const row of dataUser) {
                const is_holiday = await db.queryCheckHoliday( tableHoliday, row.Fecha);
                /* console.log(is_holiday) */
                if (is_holiday ===1){
                    row.Tipo_Hora ='DOB'
                    row.Tipo_Hora1 ='DOB'
                } else{
                    row.Tipo_Hora ='SIM'
                    row.Tipo_Hora1 ='SIM'
                }
                const fecha = new Date(row.Fecha); // obtener dia de la semana
                const diaSemana = fecha.getDay() + 1;
                let minutosHoraMarca = convertTimeStringToMinutes(row.Hora);
                let minutosHoraAsignada;
                let diferenciaMinutos;
                
                if (row.diaExcepcion === diaSemana) {
                    minutosHoraAsignada = convertTimeStringToMinutes(row.idTMarcacion ===  1 ? row.HoraInicio_Excepcion : row.HoraFin_Excepcion);
                } else {
                    minutosHoraAsignada = convertTimeStringToMinutes(row.idTMarcacion ===  1 ? row.HoraInicio : row.HoraFin);
                }

                if(row.idTMarcacion ===  1){
                    diferenciaMinutos =   minutosHoraAsignada - minutosHoraMarca;  
                } else {
                    diferenciaMinutos =  minutosHoraMarca - minutosHoraAsignada;  
                }
                  
                // Convertir la diferencia de minutos a horas
                let horasDiferencia = Math.floor(diferenciaMinutos / 60);
                let minutosDiferencia = Math.abs(diferenciaMinutos % 60);
                let minutosExtra =  (minutosDiferencia/60);
        
                let horasDf = `${horasDiferencia}:${minutosDiferencia}`;
                let horasDf2 = `${horasDiferencia < 10 ? `0${horasDiferencia}` : horasDiferencia}${minutosExtra*100}`;
                row.HorasExtra_HH_mm = horasDf;
                row.CARGA = horasDf2;

            worksheet.addRow(row);
        };
        const buffer = await workbook.xlsx.writeBuffer();
         return buffer; 
    };
    // Convierte string en minutos
    function convertTimeStringToMinutes(timeString) {
        const [hours, minutes] = timeString.split(':').map(Number);
        return hours *  60 + minutes;
    }

    async function reportAudit(body) {
        const dataUser = await db.queryReportAsistance( tableAssistance,tableUser, tableTypeMarking, body.FechaInicio, body.FechaFin);
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        // Crear una nueva fila con el título 
        worksheet.mergeCells('A1:U1');
        const titleCell = worksheet.getCell('A1');
        titleCell.value = 'Planilla de asistencia';
            // Aplicar estilo de alineación al centro tanto horizontal como verticalmente
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
        // Aplicar estilo de alineación al centro a toda la fila  1
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.mergeCells('A2:B2');
        worksheet.getCell('A2').value = 'Compañía:';
        worksheet.mergeCells('C2:J2');
        worksheet.getCell('C2').value = 'GESTION DE SERVICIOS COMPARTIDOS PERÚ SAC';
        worksheet.mergeCells('K2:L2');
        worksheet.getCell('K2').value = 'RUC:';
        worksheet.mergeCells('M2:R2');
        worksheet.getCell('M2').value = '20501827623';
        worksheet.mergeCells('S2:T2');
        worksheet.getCell('S2').value = 'Fecha emisión:';
        worksheet.getCell('U2').value = '12/02/2024';

        worksheet.mergeCells('A3:B3');
        worksheet.getCell('A3').value = 'CIP:';
        worksheet.mergeCells('C3:F3');
        worksheet.getCell('C3').value = '';
        worksheet.getCell('G3').value = 'DNI:';
        worksheet.mergeCells('H3:J3');
        worksheet.getCell('M3').value = '20527623';
        worksheet.mergeCells('K3:L3');
        worksheet.getCell('K3').value = 'Nombre:';
        worksheet.mergeCells('M3:U3');
        worksheet.getCell('M3').value = 'Nombres Apellidos';

        
        worksheet.getCell('A4').value = 'CCR:';
        worksheet.mergeCells('B4:G4');
        worksheet.getCell('B3').value = '';
        worksheet.mergeCells('H4:I4');
        worksheet.getCell('H4').value = 'Gerencia';
        worksheet.mergeCells('J4:O4');
        worksheet.getCell('J4').value = '';
        worksheet.mergeCells('P4:Q4');
        worksheet.getCell('P4').value = 'Periodo desde';
        worksheet.mergeCells('R4:S4');
        worksheet.getCell('R4').value = '01-02-2024';
        worksheet.getCell('T4').value = 'Hasta';
        worksheet.getCell('U4').value = '29-02-2024';

        worksheet.mergeCells('A5:A6');
        worksheet.getCell('A5').value = 'Fecha';
        worksheet.mergeCells('B5:C5');
        worksheet.getCell('B5').value = 'HORARIO';
        worksheet.mergeCells('D5:G5');
        worksheet.getCell('D5').value = 'JORNADA REAL';
        worksheet.mergeCells('H5:M5');
        worksheet.getCell('H5').value = 'HORAS';
        worksheet.mergeCells('N5:P5');
        worksheet.getCell('N5').value = 'PERMISOS Y SALIDAS';
        worksheet.mergeCells('Q5:Q6');
        worksheet.getCell('Q5').value = 'Horas Recargo nocturno';
        worksheet.mergeCells('R5:R6');
        worksheet.getCell('R5').value = 'Horas extras normal';
        worksheet.mergeCells('S5:S6');
        worksheet.getCell('S5').value = 'Horas extras tipo 2';
        worksheet.mergeCells('T5:T6');
        worksheet.getCell('T5').value = 'Horas falta';
        worksheet.mergeCells('U5:U6');
        worksheet.getCell('U5').value = 'Tipo evento';

        worksheet.getCell('B6').value = 'Entrada';
        worksheet.getCell('C6').value = 'Salida';
        worksheet.getCell('D6').value = 'Entrada';
        worksheet.mergeCells('E6:F6');
        worksheet.getCell('E6').value = 'Descanso';
        worksheet.getCell('G6').value = 'Salida';
        worksheet.getCell('H6').value = 'Asignado';
        worksheet.getCell('I6').value = 'Asist.';
        worksheet.getCell('J6').value = 'Jornada';
        worksheet.getCell('K6').value = 'Atraso';
        worksheet.getCell('L6').value = 'S. Temp.';
        worksheet.getCell('M6').value = 'Ausencia';
        worksheet.getCell('N6').value = 'S.J.T';
        worksheet.getCell('O6').value = 'S.J.N.T';
        worksheet.getCell('P6').value = 'S.N.J';

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                cell.font = { size:  8 };
            });
        });
        //////////////////////
        dataUser.forEach(row => {
        /* worksheet.addRow(row); */
        });
        /* await workbook.xlsx.writeFile('MiArchivo.xlsx'); */
        const buffer = await workbook.xlsx.writeBuffer();
         return buffer; 
    };
    function calcularDiferenciaHoras(hora1, hora2) {
        const formato = 'HH:mm:ss';
        const fecha1 = new Date(`1970-01-01 ${hora1}:00`);
        const fecha2 = new Date(`1970-01-01 ${hora2}:00`);
        const diferenciaEnMilisegundos =  fecha1.getTime() - fecha2.getTime();
        const diferenciaEnHoras = diferenciaEnMilisegundos / (1000 *  60 *  60);
        return diferenciaEnHoras;
      }

    return {
        
        reportAsistance,
        reportOvertime,
        reportRequest,
        reportAudit,
        reportOvertimeNew
    }
}
