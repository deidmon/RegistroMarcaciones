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
const tableLunch = 'refrigerio';
const ExcelJS = require('exceljs');
const stream = require('stream');
const moment = require('moment-timezone');
const { Console } = require('console');
moment.tz.setDefault('America/Lima');
moment.locale('es'); 

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

    async function reportAsistanceWithLocation(body) {
        /* console.log(body.Fecha) */
        const dataUser = await db.queryReportAsistanceWithLocation( tableAssistance,tableUser, tableTypeMarking, body.FechaInicio, body.FechaFin);
        /* console.log(dataUser) */
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        worksheet.columns = [
            { header: 'Marcacion', key: 'Marcación', width: 10 },
            { header: 'CIP', key: 'CIP', width: 10 },
            { header: 'Fecha', key: 'Fecha', width: 10 },
            { header: 'Hora', key: 'Hora', width: 10 },
            { header: 'Minutos', key: 'Minutos', width: 10 },
            /* { header: 'Codigo_Local', key: 'Código_Local', width: 15 },
            { header: 'TXT', key: 'TXT', width: 25 },
            { header: 'Longitud', key: 'Longitud', width: 10 }, */
            { header: 'Ubicacion', key: 'Ubicacion', width: 40 }
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
        /* console.log(dataUser) */
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
        if(IdRolUser === 3 || IdRolUser === 4){
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
                newdate = row.Fecha.split("-").reverse().join("-");
                const fecha = new Date(row.Fecha); // obtener dia de la semana
                const diaSemana = fecha.getDay() + 1;
                const diaSemanaPersonalizado = (diaSemana ===  0) ?  7 : diaSemana;
                let minutosHoraMarca = convertTimeStringToMinutes(row.Hora);
                let minutosHoraAsignada;
                let diferenciaMinutos;
                
                if (row.diaExcepcion === diaSemanaPersonalizado) {
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
                row.Fecha = newdate
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
        const doubleBorderStyle = {
            top: { style: 'double' },
            left: { style: 'double' },
            bottom: { style: 'double' },
            right: { style: 'double' }
          };

          const simpleBorderStyle = {
            top: { style: 'thin' },
            left: { style: 'thin' },
            bottom: { style: 'thin' },
            right: { style: 'thin' }
          };
          
          const borderStyleSum = {
            top: { style: 'thin' },
            bottom: { style: 'thin' },

          };
          
        const dataInformationUser = await db.userInformationForReport(tableUser, body.idUser);
        const userCIP = dataInformationUser[0].CIP 
        const userDNI = dataInformationUser[0].DNI 
        const userNames = dataInformationUser[0].NombreCompleto
        let initialDate = moment();
        let date = initialDate.format('DD-MM-YYYY');
        const dataUser = await db.queryReportAudit( tableAssistance,tableUser, tableSchedule, tableLunch,tableExceptions, body.FechaInicio, body.FechaFin, body.idUser);
        countRows = dataUser.length 
        /* console.log(dataUser) */
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Mi Hoja');
        // Crear una nueva fila con el título 
        worksheet.mergeCells('A1:U1');
        worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(5).alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        worksheet.getRow(6).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.mergeCells('A2:B2');
        worksheet.getCell('A2').value = 'Compañía:';
        worksheet.mergeCells('C2:J2');
        worksheet.getCell('C2').value = 'GESTION DE SERVICIOS COMPARTIDOS PERÚ SAC';
        worksheet.mergeCells('K2:L2');
        worksheet.getCell('K2').value = 'RUC:';
        worksheet.mergeCells('M2:Q2');
        worksheet.getCell('M2').value = '20501827623';
        worksheet.mergeCells('R2:S2');
        worksheet.getCell('R2').value = 'Fecha emisión:';
        worksheet.getCell('T2').value = date;
        worksheet.mergeCells('A3:B3');
        worksheet.getCell('A3').value = 'CIP';
        worksheet.mergeCells('C3:F3');
        worksheet.getCell('C3').value = userCIP;
        worksheet.getCell('G3').value = 'DNI:';
        worksheet.mergeCells('H3:J3');
        worksheet.getCell('H3').value = userDNI;
        worksheet.mergeCells('K3:L3');
        worksheet.getCell('K3').value = 'Nombre:';
        worksheet.mergeCells('M3:T3');
        worksheet.getCell('M3').value = userNames;

        worksheet.getCell('A4').value = 'CCR:';
        worksheet.mergeCells('B4:G4');
        worksheet.getCell('B4').value = '';
        worksheet.mergeCells('H4:I4');
        worksheet.getCell('H4').value = 'Gerencia';
        worksheet.mergeCells('J4:N4');
        worksheet.getCell('J4').value = '';
        worksheet.mergeCells('O4:P4');
        worksheet.getCell('O4').value = 'Periodo desde';
        worksheet.mergeCells('Q4:R4');
        worksheet.getCell('Q4').value = body.FechaInicio;
        worksheet.getCell('S4').value = 'Hasta';
        worksheet.getCell('T4').value = body.FechaFin;

        worksheet.mergeCells('A5:A6');
        worksheet.getCell('A5').value = 'Fecha';
        worksheet.mergeCells('B5:C5');
        worksheet.getCell('B5').value = 'HORARIO';
        worksheet.mergeCells('D5:G5');
        worksheet.getCell('D5').value = 'JORNADA REAL';
        worksheet.mergeCells('H5:M5');
        worksheet.getCell('H5').value = 'HORAS';
        worksheet.mergeCells('N5:O5');
        worksheet.getCell('N5').value = 'PERMISOS Y SALIDAS';
        worksheet.mergeCells('P5:P6');
        worksheet.getCell('P5').value = 'Horas Recargo nocturno';
        worksheet.mergeCells('Q5:Q6');
        worksheet.getCell('Q5').value = 'Horas extras normal';
        worksheet.mergeCells('R5:R6');
        worksheet.getCell('R5').value = 'Horas extras tipo 2';
        worksheet.mergeCells('S5:S6');
        worksheet.getCell('S5').value = 'Horas falta';
        worksheet.mergeCells('T5:T6');
        worksheet.getCell('T5').value = 'Tipo evento';

        worksheet.getCell('B6').value = 'Entrada';
        worksheet.getCell('C6').value = 'Salida';
        worksheet.getCell('D6').value = 'Entrada';
        worksheet.mergeCells('E6:F6');
        worksheet.getCell('E6').value = 'Descanso';
        worksheet.getCell('G6').value = 'Salida';
        worksheet.getCell('H6').value = 'Asignado';
        worksheet.getCell('I6').value = 'Asist.';
        worksheet.getCell('J6').value = 'Jornada';
        worksheet.getCell('K6').value = 'Horas no laboradas';
        worksheet.getCell('L6').value = 'S. Temp.';
        worksheet.getCell('M6').value = 'Ausencia';
        worksheet.getCell('N6').value = 'S.J.T';
        /* worksheet.getCell('O6').value = 'S.J.N.T'; */
        worksheet.getCell('O6').value = 'S.N.J';
        
        worksheet.columns = [
           /*  { header: 'CIP', key: 'CIP', width: 10 }, */
            { header: 'Fecha', key: 'Fecha', width: 10 },
            { header: 'Entrada', key: 'Entrada', width: 8 },
            { header: 'Salida', key: 'Salida', width: 8 },
           /*  { header: 'IdHorarios', key: 'IdHorarios', width: 10 }, */
            { header: 'HoraInicio', key: 'HoraInicio', width: 8 },
            { header: 'HoraInicioRefrigerio', key: 'HoraInicioRefrigerio', width: 8 },
            { header: 'HoraFinRefrigerio', key: 'HoraFinRefrigerio', width: 8 },
            { header: 'HoraFin', key: 'HoraFin', width: 8 },
            { header: 'Asignado', key: 'Asignado', width: 8 },
            { header: 'Asist', key: 'Asist', width: 8 },
            { header: 'Jornada', key: 'Jornada', width: 8 },
            { header: 'Atraso', key: 'Atraso', width: 15 },
            { header: 'Sobretiempo', key: 'Sobretiempo', width: 8 },
            { header: 'Ausencia', key: 'Ausencia', width: 8 },
            { header: 'SJT', key: 'SJT', width: 8 },
            /* { header: 'SJNT', key: 'SJNT', width: 8 }, */
            { header: 'SNJ', key: 'SNJ', width: 8 },
            { header: 'Horas_Recargo', key: 'Horas_Recargo', width: 10 },
            { header: 'Horas_extras_normal', key: 'Horas_extras_normal', width: 10 },
            { header: 'Horas_extras_tipo2', key: 'Horas_extras_tipo2', width: 10 },
            { header: 'Horas_Falta', key: 'Horas_Falta', width: 10,  },
            { header: 'Tipo_evento', key: 'Tipo_evento', width: 10 },
            { header: 'Planilla de asistencia', key: 'Planilla de asistencia', width: 15,hidden: true, },
            /* { header: 'HoraRefrigerio', key: 'HoraRefrigerio', width: 15 }, */
           ];
           
        let countAbsences = 0
        let sumAsistSeconds =  0;
        let countEarlyExit =  0;
        let sumEarlyExitSeconds =  0;
        /* let prueba = calcularDiferenciaHoras('08:00', '-09:00');
        console.log(prueba) */
        for (const row of dataUser) {
                const fecha = new Date(row.Fecha);
                const diaSemana = fecha.getDay() + 1;
                const diaSemanaPersonalizado = (diaSemana ===  0) ?  7 : diaSemana;
                
                if (row.diaExcepcion === diaSemanaPersonalizado) {
                    row.Entrada = row.HoraInicio_Excepcion
                    row.Salida = row.HoraFin_Excepcion
                    
                }
                
                const horaFinAsist = moment(row.HoraFin, 'HH:mm');
                const horaFinAsig = moment(row.Salida, 'HH:mm');
                if(row.HoraFin !== '00:00' && horaFinAsist.isBefore( horaFinAsig)){
                    countEarlyExit += 1
                    let hourEarlyExit = calcularDiferenciaHoras(horaFinAsig,horaFinAsist)
                    sumEarlyExitSeconds += convertirHoraASegundos(hourEarlyExit);
                } 
                let AsignadoSinRefrigerio = calcularDiferenciaHoras(row.Salida, row.Entrada);
                /* let RefrigerioAsignado = '01:00'; */
                let RefrigerioAsignado
                if (row.HoraRefrigerio === null){
                    RefrigerioAsignado = '00:00'
                } else {
                    RefrigerioAsignado = convertirMinutosAHoras(row.HoraRefrigerio);
                }
                row.Asignado = calcularDiferenciaHoras(AsignadoSinRefrigerio, RefrigerioAsignado);

                if(row.HoraFin === '00:00' && row.HoraFinRefrigerio === '00:00'){
                    if (row.HoraInicioRefrigerio === '00:00'){
                        row.Asist =    '00:00'
                    }else {
                        row.Asist =    calcularDiferenciaHoras(row.HoraInicioRefrigerio, row.HoraInicio)
                    }   
                } else if(row.HoraFin === '00:00'){
                    let AsistidoSinHoraFin = calcularDiferenciaHoras(row.HoraFinRefrigerio, row.HoraInicio);
                    let RefrigerioReal = calcularDiferenciaHoras(row.HoraFinRefrigerio, row.HoraInicioRefrigerio );
                    row.Asist = calcularDiferenciaHoras(AsistidoSinHoraFin, RefrigerioReal);
                }              
                else {
                    let AsistidoSinRefrigerio = calcularDiferenciaHoras(row.HoraFin, row.HoraInicio);
                    let RefrigerioReal = calcularDiferenciaHoras(row.HoraFinRefrigerio, row.HoraInicioRefrigerio );
                    row.Asist = calcularDiferenciaHoras(AsistidoSinRefrigerio, RefrigerioReal);
                }
                
                row.Jornada = row.Asist;
                /* const moment = require('moment'); */
                const hora1 = moment(row.Asignado, 'HH:mm');
                const hora2 = moment(row.Asist, 'HH:mm');
                const hora_simple = moment('02:00', 'HH:mm');
                
                let ausenciaAsignada = false;
                if(row.HoraInicio === '00:00' && row.HoraFin === '00:00'){
                    row.Ausencia = row.Asignado
                    ausenciaAsignada = true; 
                    countAbsences += 1;
                }

                if (!ausenciaAsignada && hora1.isAfter(hora2)) {
                    row.Atraso = calcularDiferenciaHoras(row.Asignado, row.Asist);
                } else if (!ausenciaAsignada && hora1.isBefore(hora2)) {
                    row.Sobretiempo = calcularDiferenciaHoras( row.Asist, row.Asignado);
                } else if (!ausenciaAsignada) {
                    /* return '00:00'; */
                }

                if (row.validacionSalida === 4 && row.validacionSalidaSec === 6) {
                    row.SJT = calcularDiferenciaHoras(row.HoraFin, row.Salida);
                    const horaSJT = moment(row.SJT, 'HH:mm');
                    if(horaSJT.isAfter(hora_simple)){
                        row.Horas_extras_normal = '02:00'
                        row.Horas_extras_tipo2 = calcularDiferenciaHoras(row.SJT, hora_simple)
                    }
                }
                if (row.validacionSalida === 6 && row.validacionSalidaSec === 6) {
                    row.SNJ = calcularDiferenciaHoras(row.HoraFin, row.Salida);
                    // CONSULTAR ACTIVAR SI TAMBIÉN ES PARA SNJ O SÓLO PARA SJT
                    /* const horaSNJ = moment(row.SNJ, 'HH:mm');
                    if(horaSNJ.isAfter(hora_simple)){
                        row.Horas_extras_normal = '02:00'
                        row.Horas_extras_tipo2 = calcularDiferenciaHoras(row.SNJ, hora_simple)
                    } */
                }
                
                row.Horas_Falta = row.Atraso

                const is_holiday = await db.queryCheckHoliday( tableHoliday, row.Fecha);
                /* console.log(is_holiday) */
                if (is_holiday ===1){
                    row.Tipo_evento ='J.FEST.E.';
                    sumAsistSeconds += convertirHoraASegundos(row.Asist);
                    
                } else{
                    row.Tipo_evento ='J.NORMAL'
                }

             worksheet.addRow(row);
        };
        //Total horas en días festivos
        const totalAsist = convertirSegundosAHora(sumAsistSeconds);
        //Total horas en de salidas temprana
        const totalHourEarlyExit = convertirSegundosAHora(sumEarlyExitSeconds);
        // Función para convertir 'HH:MM' a segundos
        function convertirHoraASegundos(hora) {
            const [horas, minutos] = hora.split(':').map(Number);
            return horas *  3600 + minutos *  60;
        }

        // Función para convertir segundos a 'HH:MM'
        function convertirSegundosAHora(segundos) {
            const horas = Math.floor(segundos /  3600);
            const minutos = Math.floor((segundos %  3600) /  60);
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
}
        // Función para convertir horas en formato 'HH:MM' a minutos
        function convertirHorasAMinutos(hora) {
            const partes = hora.split(':');
            const horas = parseInt(partes[0],   10);
            const minutos = parseInt(partes[1],   10);
            return (horas *   60) + minutos;
        }
        
        // Función para sumar horas en un rango de celdas
        function sumarHoras(worksheet, column,rangoInicio, rangoFin) {
            let totalMinutos =  0;
            for (let i = rangoInicio; i <= rangoFin; i++) {
            const valor = worksheet.getCell(`${column}${i}`).value;
            if (valor) {
                totalMinutos += convertirHorasAMinutos(valor);
            }
            }
        
            // Convertir total de minutos a formato 'HH:MM'
            const horas = Math.floor(totalMinutos /   60);
            const minutos = totalMinutos %   60;
            return `${horas.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`;
        }

        const endRows = 7 + countRows;
        /* console.log(endRows) */
        const resultSum_H = sumarHoras(worksheet,'H' , 7, endRows);
        const resultSum_I = sumarHoras(worksheet,'I' , 7, endRows);
        const resultSum_J = sumarHoras(worksheet,'J' , 7, endRows);
        const resultSum_K = sumarHoras(worksheet,'K' , 7, endRows);
        const resultSum_L = sumarHoras(worksheet,'L' , 7, endRows);
        const resultSum_M = sumarHoras(worksheet,'M' , 7, endRows);
        const resultSum_N = sumarHoras(worksheet,'N' , 7, endRows);
        const resultSum_O = sumarHoras(worksheet,'O' , 7, endRows);
        const resultSum_Q = sumarHoras(worksheet,'Q' , 7, endRows);
        const resultSum_R = sumarHoras(worksheet,'R' , 7, endRows);
        const resultSum_S = sumarHoras(worksheet,'S' , 7, endRows);


        worksheet.getCell('H40').value= resultSum_H
        worksheet.getCell('I40').value= resultSum_I
        worksheet.getCell('J40').value= resultSum_J
        worksheet.getCell('K40').value= resultSum_K
        worksheet.getCell('L40').value= resultSum_L;
        worksheet.getCell('M40').value= resultSum_M;
        worksheet.getCell('N40').value= resultSum_N;
        worksheet.getCell('O40').value= resultSum_O;
        

        worksheet.mergeCells('A40:B40');
        worksheet.getCell('A40').value = 'RESUMEN MENSUAL';
        worksheet.mergeCells('A41:T41');
        worksheet.getCell('A41').value = 'RESUMEN GENERAL';
        worksheet.mergeCells('A42:E42');
        worksheet.getCell('A42').value = 'TIEMPO NORMAL';
        worksheet.mergeCells('F42:J42');
        worksheet.getCell('F42').value = 'T.SALIDAS ESPECIALES';
        worksheet.mergeCells('K42:O42');
        worksheet.getCell('K42').value = 'CANTIDAD';
        worksheet.mergeCells('P42:T42');
        worksheet.getCell('P42').value = 'RESULTADO';

        worksheet.mergeCells('A43:D43');
        worksheet.getCell('A43').value = 'Asignado';
        worksheet.getCell('E43').value = resultSum_H;
        worksheet.mergeCells('F43:I43');
        worksheet.getCell('F43').value = 'S.J.T';
        worksheet.getCell('J43').value = resultSum_N;
        worksheet.mergeCells('K43:N43');
        worksheet.getCell('K43').value = 'N° atrasos';
        worksheet.mergeCells('P43:S43');
        worksheet.getCell('P43').value = 'Horas en días festivo';
        worksheet.getCell('T43').value = totalAsist;

        worksheet.mergeCells('A44:D44');
        worksheet.getCell('A44').value = 'Asistencia';
        worksheet.getCell('E44').value = resultSum_I;
        worksheet.mergeCells('F44:I44');
        worksheet.getCell('F44').value = 'S.N.J';
        worksheet.getCell('J44').value = resultSum_O;
        worksheet.mergeCells('K44:N44');
        worksheet.getCell('K44').value = 'Nº salidas temp.';
        worksheet.getCell('O44').value = countEarlyExit;
        worksheet.mergeCells('P44:S44');
        worksheet.getCell('P44').value = 'Horas en recargo nocturno';

        worksheet.mergeCells('A45:D45');
        worksheet.getCell('A45').value = 'Jornada';
        worksheet.getCell('E45').value = resultSum_J;
        worksheet.mergeCells('F45:I45');
        worksheet.getCell('F45').value = 'Total Salidas a descontar';
        worksheet.mergeCells('K45:N45');
        worksheet.getCell('K45').value = 'Nº inasistencias';
        
        worksheet.getCell('O45').value = countAbsences;


        worksheet.mergeCells('A46:D46');
        worksheet.getCell('A46').value = 'Ausencia';
        worksheet.getCell('E46').value = resultSum_M;
        
       /*  worksheet.mergeCells('K46:O46'); */
       /*  worksheet.getCell('K46').value = 'Días c/licencia médica'; */
        worksheet.mergeCells('F46:O46');
        worksheet.mergeCells('P45:S45');
        worksheet.getCell('P45').value = 'TOTAL HORAS EXTRAS NORMAL (25%)';
        worksheet.getCell('T45').value = resultSum_Q;

        worksheet.mergeCells('A47:D47');
        worksheet.getCell('A47').value = 'Horas  no laboradas';
        worksheet.getCell('E47').value = resultSum_K;
        worksheet.mergeCells('F47:O47');
        /* worksheet.mergeCells('K47:O47'); */
       /*  worksheet.getCell('K47').value = 'Nº ausencias parciales'; */
        worksheet.mergeCells('A48:D48');
        worksheet.getCell('A48').value = 'Salida Temprana';
        worksheet.getCell('E48').value = totalHourEarlyExit;
        worksheet.mergeCells('F48:O48');
        worksheet.mergeCells('P46:S46');
        worksheet.getCell('P46').value = 'TOTAL HORAS EXTRAS TIPO 2 (35%)';
        worksheet.getCell('T46').value = resultSum_R;
        worksheet.mergeCells('P47:S47');
        worksheet.getCell('P47').value = 'TOTAL HORAS FALTA';
        worksheet.getCell('T47').value = resultSum_S;
        worksheet.mergeCells('A52:H52');
        worksheet.getCell('A52').value = 'Empleado';

        worksheet.mergeCells('N52:T52');
        worksheet.getCell('N52').value = 'Empleador';

        worksheet.mergeCells('A55:C55');
        worksheet.getCell('A55').value = 'Definiciones:';

        worksheet.mergeCells('D55:M55');
        worksheet.getCell('D55').value = 'S.J.T: Tiempo de salida justificada contada como trabajo';
        worksheet.mergeCells('N55:T55');
        worksheet.getCell('N55').value = 'S.J.N.T: Tiempo de salida justificada contada como no trabajo';

        worksheet.mergeCells('A56:C56');
        worksheet.getCell('A56').value = 'Tipos de evento:';

        worksheet.mergeCells('D56:M56');
        worksheet.getCell('D56').value = 'S.N.J.: Tiempo de salida no justificada';
        worksheet.mergeCells('N56:T56');
        worksheet.getCell('N56').value = 'J.NORMAL: Horario asignado en turno normal';

        /* worksheet.mergeCells('D57:M57'); */
        /* worksheet.getCell('D57').value = 'J.F.H: Jornada fuera de horario asignado'; */
        /* worksheet.mergeCells('N57:T57'); */
        /* worksheet.getCell('N57').value = 'J.FLEX.: Horario asignado en turno flexible'; */

        /* worksheet.mergeCells('D58:M58'); */
        /* worksheet.getCell('D58').value = 'S.EXT.: Salida extraordinaria dentro de jornada'; */
        /* worksheet.mergeCells('N58:T58'); */
        /*  worksheet.getCell('N58').value = 'S.T.H.: Salida especial contada como trabajo sólo en horario, con horario asignado'; */

        worksheet.mergeCells('D59:M59');
        /* worksheet.getCell('D59').value = 'S.T.: Salida especial contada como trabajado, con horario asignado'; */
        worksheet.mergeCells('N59:T59');
        /* worksheet.getCell('N59').value = 'S.N.T.: Salida especial contada como no trabajo, con horario asignado'; */

        worksheet.mergeCells('D60:M60');
        /* worksheet.getCell('D60').value = 'S.T.F.H.: Salida especial contada como trabajada, fuera de horario asignado'; */
        worksheet.mergeCells('N60:T60');
        /* worksheet.getCell('N60').value = 'S.T.H. [V]: Salida especial trabajada en horario, contada como vacaciones'; */

        worksheet.mergeCells('D57:H57');
        worksheet.getCell('D57').value = 'LIC.MED.: Día con licencia médica asignada';
        worksheet.mergeCells('I57:O57');
        worksheet.getCell('I57').value = 'LIBRE: Día sin horario, marcaciones o salidas especiales asignadas';
        worksheet.mergeCells('P57:T57');
        worksheet.getCell('P57').value = 'J.FEST.E.: Jornada en día festivo';

        worksheet.getCell('A58').value = 'Nota:';
        worksheet.mergeCells('B58:T58');
        worksheet.getCell('B58').value = 
        `
        - Azul: marcación automática generada por el sistema (sólo para efectos del correcto cálculo para beneficio del trabajador).
        - Verde: marcacion creada manualmente (por un administrador del sistema).
        - El tiempo de ausencia en días de inasistencia no se contabiliza como horas falta.
        - La jornada de trabajo nocturna se extenderá desde las 22:00 hasta las 06:00 hrs, donde los minutos trabajados dentro del intervalo previamente mencionado serán contados como horas en recargo nocturno.
        - Las horas extras normales se calculan con respecto a los horarios (u horas de trabajo) asignados semanalmente. Las horas extras de tipo 2 corresponden al tiempo que supere las 2 primeras horas extras en día normal de trabajo.
        Puede modificar las configuraciones desde Relojcontrol.com.
        `
        ;

        /* worksheet.getRow(52).font  = {bold: true } */
        worksheet.getRow(51).height = 90;
        worksheet.getRow(52).height = 30;
        worksheet.getRow(58).height = 80;
        worksheet.getRow(42).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(52).alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getRow(58).alignment = { vertical: 'middle', wrapText: true };
        worksheet.getCell('A41').alignment = { vertical: 'middle', horizontal: 'center' };
        worksheet.getCell('A41').border = simpleBorderStyle;
        worksheet.getCell('A48').border = simpleBorderStyle;
        worksheet.getCell('E48').border = simpleBorderStyle;
        worksheet.getCell('A52').border = { top: { style: 'thin' }, };
        worksheet.getCell('N52').border = { top: { style: 'thin' }, };

        worksheet.eachRow({ includeEmpty: true }, function(row, rowNumber) {
            row.eachCell({ includeEmpty: true }, function(cell, colNumber) {
                cell.font = { size:  8 };
            });
        });
        worksheet.getCell('A1').font = {size:  8, bold: true };
        worksheet.getCell('A41').font = {size:  8, bold: true };
        worksheet.getCell('P45').font = {size:  8, bold: true };
        worksheet.getCell('P46').font = {size:  8, bold: true };
        worksheet.getCell('P47').font = {size:  8, bold: true };
        worksheet.getCell('A52').font = {size:  8, bold: true };
        worksheet.getCell('N52').font = {size:  8, bold: true };

        for (let row =  5; row <=  6; row++) {
            for (let col =  1; col <=  20; col++) {
              const cell = worksheet.getCell(row, col);
              cell.font = {size:  8, bold: true };
              cell.border = doubleBorderStyle;
            }
          } 
        for (let row = 42; row <=  47; row++) {
            for (let col =  1; col <=  20; col++) {
              const cell = worksheet.getCell(row, col);
              cell.border = simpleBorderStyle;
            }
          } 
        
          // Poner color gris a las celdas
          for (let row = 40; row <=  40; row++) {
            for (let col =  1; col <=  20; col++) {
              const cell = worksheet.getCell(row, col);
              cell.font = {size:  8, bold: true };
              cell.border = borderStyleSum;
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' } // Gris
              };
            }
          } 
          
          for (let row = 42; row <=  42; row++) {
            for (let col =  1; col <=  20; col++) {
              const cell = worksheet.getCell(row, col);
              cell.font = {size:  8, bold: true };
              cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FFD3D3D3' } // Gris
              };
            }
          } 
        const buffer = await workbook.xlsx.writeBuffer();
         return buffer; 
    };
    function calcularDiferenciaHoras(horaInicio, horaFinal) {
        const inicio = moment(horaInicio, 'HH:mm');
        const final = moment(horaFinal, 'HH:mm');
        let duracion = moment.duration(inicio.diff(final)).asMinutes();
        let horas = Math.floor(duracion /  60);
        let minutos = Math.round(duracion %  60);
        if (inicio.isBefore(final)) {
            duracion = moment.duration(final.diff(inicio)).asMinutes();
            horas = Math.floor(duracion /  60);
            minutos = Math.round(duracion %  60);
        }
        // Ajuste para asegurar que el signo se aplique correctamente
        const signo = inicio.isBefore(final) ? '-' : '';
        return `${signo}${String(Math.abs(horas)).padStart(2, '0')}:${String(Math.abs(minutos)).padStart(2, '0')}`;
    
    }
    function convertirMinutosAHoras(minutos) {
        let horas = Math.floor(minutos /  60);
        let minutosRestantes = minutos %  60;
        return `${horas.toString().padStart(2, '0')}:${minutosRestantes.toString().padStart(2, '0')}`;
    }

    return {
        
        reportAsistance,
        reportOvertime,
        reportRequest,
        reportAudit,
        reportOvertimeNew,
        reportAsistanceWithLocation
    }
}
