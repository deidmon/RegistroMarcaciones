const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const tableJustifications = 'justificaciones';
const tableAssist = 'asistencias';
const tableTypesMarking = 'tipomarcaciones';
const tableUser = 'usuarios';
const tableStateNotifications = 'estadojustificaciones';
const tableTypesValidation = 'validacion';

module.exports = function (dbInjected) {

    let db = dbInjected;
    message = ""
    if (!db) {
        db = require('../../DB/mysql');
    }

    /* 📌 Para añadir una justificacion*/
    async function addJustifications(body) {
        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;
        const data = await db.queryConsultTable(tableAssist, { IdUsuarios: body.idUser }, { Fecha: date }, { IdTMarcacion: body.idTypeMark });

        if (!data || data.length === 0) {
            message = 'No existe marcación a justificar';
            return { "messages": message };
        }
        const Justifications = {

            IdUsuario: body.idUser,
            Fecha: date,
            IdTMarcaciones: body.idTypeMark,
            Motivo: body.reason,
            IdEstadoJust: 1,
        }

        const respuesta = await db.addJustification(tableJustifications, Justifications);

        if (respuesta) {
            message = 'Justificación añadida con éxito';
            return { "messages": message };
        }
        message = 'No se pudo añadir la justificación';
        return { "messages": message };

    };

    /* 📌 Para actualizar justificaciones*/
    async function updateJustifications(body) {

        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;
        const datum = await db.queryConsultTable(tableJustifications, { IdUsuario: body.idUser }, { Fecha: body.date }, { IdTMarcaciones: body.idTypeMark });
        if (!datum || datum.length === 0) {
            message = 'No existe la justificación a actualizar';
            return { "messages": message };
        }
        const idJustification = datum[0].idJustificacion;
        
        if (body.idStatusJustification != 1) {

            const respond = await db.queryUpdateJustifactions(tableJustifications, { IdEstadoJust: body.idStatusJustification, Updated_by: body.idUserModifier }, idJustification);
            if (body.idStatusJustification == 2) {
                const verifyAssistance = {
                    IdUsuarios: body.idUser,
                    Fecha: date,
                    idTMarcación: body.idTypeMark,
                }
                
                const data = await db.queryConsultTable(tableAssist, { IdUsuarios: body.idUser }, { Fecha: body.date }, { IdTMarcacion: body.idTypeMark });
                if (!data || data.length === 0) {
                    message = 'No existe marcación a actualizar';
                    return { "messages": message };
                }
                const idMark = data[0].IdAsistencias;
                const Mark = {};

                Mark.Hora = body.hour;
                Mark.idValidacion = 4;
                Mark.Updated_at = date;
                Mark.Updated_by = body.idUserModifier;
                const respuesta = await db.queryUpdateAssists(tableAssist, Mark, idMark);

                message = 'Justificación actualizada con éxito';
                return { "messages": message };
            }
            
            message = 'Justificación ha sido actualizada a rechazada';
            return { "messages": message };

        }
        message = 'No se puede actualizar la justificación';
        return { "messages": message };
    };

    /* 📌 Obtener todas las justificaciones de todos los trabajadores*/
    async function getAllJustifications(body) {
        function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
          return  offset = (numeroPagina - 1) * tamanoPagina
        }
        PageSiize = 7;
        const getOffset = obtenerDatosPaginados(body.page, PageSiize);
        return db.queryGetJustifications(tableJustifications, tableUser, tableUser, tableTypesMarking, tableStateNotifications, tableAssist, body.name, body.IdEstadoJustP ?? 1, body.IdEstadoJustJ ?? 2, body.IdEstadoJustR ?? 3, PageSiize, getOffset);  
    };
    
    /* 📌 Obtener justificaciones - contador*/
    async function getJustificationsCounter(body) {
        const result = await  db.queryGetJustificationsCounter(tableJustifications, tableUser, body.name, body.IdEstadoJustP , body.IdEstadoJustJ , body.IdEstadoJustR );  
        if (result && result.length >= 0) {
            const count = result[0];
            const contador= count.totalRegistros // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            /* console.log(contador); */
            return contador; 
         } else {
            return 0;
        }
    };

    /* 📌 Obtener justificaciones pendientes*/
    async function getJustificationsCounterPending (body) {
        const result = await  db.queryGetJustificationsCounterPending(tableJustifications, body.IdEstadoJustP);  
        if (result && result.length >= 0) {
            const count = result[0];
            const contador = count.totalRegistrosPendientes // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador; 
         } else {
            return 0;
        }
    };

    return {
        addJustifications,
        getAllJustifications,
        updateJustifications,
        getJustificationsCounter,
        getJustificationsCounterPending
    }

}
