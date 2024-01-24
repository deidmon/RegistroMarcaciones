const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const tablePermissions = 'solicitudes';
const tableTypePermissions = 'tiposolicitudes';
const tableState = 'estados';
const tableAssist = 'asistencias';
const tableJustifications = 'justificaciones';
const tableUser = 'usuarios';
const tableTypeMark = 'tipomarcaciones';
const tableStatePermissions = 'estadosolicitudes';
const tableAssignmentStaff = 'asignacionpersonal';
const tableLeader = 'lider';
const tableDaysOff = 'descansos';
const tableSchedule = 'horarios';

module.exports = function(dbInyectada){
    let db = dbInyectada;
    message = ""
    if(!db){
        db = require('../../DB/mysql');
    }

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

        const consultRole = await db.query(tableUser, {IdUsuarios : body.idUser})
        const idRole =  consultRole.IdRol;
        let statusPermission = 1
        /* if(idRole === 1){
            statusPermission = 1
        } */

        /* if(body.idRole === 1){
            statusPermission = 1
        } */

        const Justifications = {          		
            idTipoSolicitud: 1,
            idUsuario: body.idUser,
            Fecha: date,
            idTMarcaciones: body.idTypeMark,
            Motivo: body.reason,
            estadoSolicitudF: statusPermission,
        }

        const respuesta = await db.addJustification(tablePermissions, Justifications);

        if (respuesta) {
            message = 'Justificación añadida con éxito';
            return { "messages": message };
        }
        message = 'No se pudo añadir la justificación';
        return { "messages": message };

    };

    async function addPermissions(body) {
        let fechaString =  body.datePermission;
        let fechaMoment = moment(fechaString, 'YYYY/MM/DD');
        const dayOfWeekName = fechaMoment.format('dddd');  
        const daysOff = await db.queryGetDaysOff(tableDaysOff,tableSchedule, tableUser, { IdUsuarios: body.idUser });
        if (daysOff.includes(dayOfWeekName)) {
            message = `Debes elegir un día laborable para pedir permiso`
            return { "messages": message }
        }
        const checkPermissions = await db.queryCheckPermission(tablePermissions, 2, body.idUser, {FechaPermiso: body.datePermission});
        if (checkPermissions === 1) {
            message = 'Ya tiene un permiso enviado para esa fecha';
            return { "messages": message };
        }
        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;


        let statusPermission = 1
        /* let statusPermission = 4
        if(body.idRole === 1){
            statusPermission = 1
        } */

        const Permissions = {          		
            idTipoSolicitud: 2,
            idUsuario: body.idUser,
            Fecha: date,
            FechaPermiso: body.datePermission,
            Motivo: body.reason,
            estadoSolicitudF: statusPermission,
        }

        const respuesta = await db.addJustification(tablePermissions, Permissions);

        if (respuesta) {
            message = 'Permiso añadido con éxito';
            return { "messages": message };
        }
        message = 'No se pudo añadir el permiso';
        return { "messages": message };

    };

    async function addVacations(body) {
        const checkPermissions = await db.queryCheckPermission(tablePermissions, 3, body.idUser, {FechaDesde: body.dateStart} );
        if (checkPermissions === 1) {
            message = 'Ya registro vacaciones para esa fecha';
            return { "messages": message };
        }
        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;
        /* const data = await db.queryConsultTable(tableAssist, { IdUsuarios: body.idUser }, { Fecha: date }, { IdTMarcacion: body.idTypeMark }); */

        let statusPermission = 1
        /* if(body.idRole === 1){
            statusPermission = 1
        } */   //OTRA OPCION ES MANDAR TODAS LAS VACIONES EN ESTADO 4

        const Vacations = {          		
            idTipoSolicitud: 3,
            idUsuario: body.idUser,
            Fecha: date,
            FechaDesde: body.dateStart,
            FechaHasta: body.dateEnd,
            Motivo: body.reason,
            estadoSolicitudF: statusPermission,
        }

        const respuesta = await db.addJustification(tablePermissions, Vacations);

        if (respuesta) {
            message = 'Vacaciones añadida con éxito';
            return { "messages": message };
        }
        message = 'No se pudo hacer el registro de vacaciones';
        return { "messages": message };

    };

    async function addAuthorization(body) {
        const checkAuthorization = await db.queryCheckTimePermission(tablePermissions, 4, body.idUser, body.date);

        if (checkAuthorization > 0) {
            message = 'Ya tiene una autorización asignada para esa fecha';
            return { "messages": message };
        }
        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;
        

        let statusPermission = 2

        const authorization = {          		
            idTipoSolicitud: 4,
            idUsuario: body.idUser,
            Fecha: date,
            FechaPermiso: body.date,
            idTMarcaciones: 1,
            Motivo: body.reason,
            estadoSolicitudF: 2,
            Updated_byF: body.idUserAuthorizer,
            tiempoPermiso: body.timePermission,
        }

        const respuesta = await db.addJustification(tablePermissions, authorization);

        if (respuesta) {
            message = 'Autorización añadida con éxito';
            return { "messages": message };
        }
        message = 'No se pudo hacer el registro de autorizción';
        return { "messages": message };

    };

    async function updatePermissions(body) {

        let initialDate = moment();
        let day = initialDate.format('DD');
        let month = initialDate.format('MM');
        let age = initialDate.format('YYYY');
        let hour = initialDate.format('HH');
        let minutes = initialDate.format('mm');
        let date = `${age}-${month}-${day}`;
        const datum = await db.queryConsultTable(tablePermissions, { idTipoSolicitud: body.idTypePermission }, { IdUsuario: body.idUser }, { Fecha: body.date }, );
        if (!datum || datum.length === 0) {
            message = 'No existe la permiso a actualizar';
            return { "messages": message };
        }
        const idPermission = datum[0].id;
        if (body.idStatusPermission != 1) {
                
            if (body.idStatusPermission <= 3){
                const firstUpdate = {          		
                    estadoSolicitudF: body.idStatusPermission, 
                    Updated_byF: body.idUserModifier 
                }
                const respond = await db.queryUpdatePermission(tablePermissions, firstUpdate, idPermission);
            } else {
                const secondUpdate = {          		
                    estadoSolicitudS: body.idStatusPermission, 
                    Updated_byS: body.idUserModifier 
                }
                const respond = await db.queryUpdatePermission(tablePermissions, secondUpdate, idPermission);
            }
                       
            if (body.idStatusPermission == 2 && body.idTypePermission === 1) {
                idTypeMark = datum[0].idTMarcaciones
                const data = await db.queryConsultTable(tableAssist, { IdUsuarios: body.idUser }, { Fecha: body.date }, { IdTMarcacion: idTypeMark });
                if (!data || data.length === 0) {
                    message = 'No existe marcación a actualizar';
                    return { "messages": message };
                }
                const idMark = data[0].IdAsistencias;
                const Mark = {};
                Mark.idValidacion = 4;
                Mark.Updated_at = date;
                Mark.Updated_by = body.idUserModifier;
                const respuesta = await db.queryUpdateAssists(tableAssist, Mark, idMark);

                message = 'Justificación actualizada con éxito';
                return { "messages": message };
            }
            
            message = 'Permiso ha sido actualizado';
            return { "messages": message };

        }
        message = 'No se puede actualizar la justificación';
        return { "messages": message };
    };

    async function listPermissions(body){
        if (body.idPermission === -1) {
            body.idPermission = null;
        }
        if (body.idStatus === -1) {
            body.idStatus = null;
        }
        return db.queryListPermissions(tableTypePermissions, tableState, body.idStatus, body.idPermission);
    };

    async function getAllPermissions(body) {
        if (body.idStatusPermission === -1) {
            body.idStatusPermission = null;
        }
        if (body.idStatusPermission === -1) {
            body.idStatusPermission = null;
        }
        function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
          return  offset = (numeroPagina - 1) * tamanoPagina
        }
        PageSiize = 7;
        const getOffset = obtenerDatosPaginados(body.page, PageSiize);
        return db.queryGetPermissions(tablePermissions, tableUser, tableTypeMark, tableStatePermissions,tableTypePermissions, tableAssignmentStaff, tableLeader,body.name, body.idUser, body.idStatusPermission, PageSiize, getOffset);  
    };

    async function getPermissionsCounter(body) {
        const result = await  db.queryGetJustificationsCounter(tableJustifications, tableUser, body.name, body.IdEstadoJustP , body.IdEstadoJustJ , body.IdEstadoJustR );  
        if (result && result.length >= 0) {
            const count = result[0];
            const contador= count.totalRegistros // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            console.log(contador);
            return contador; 
         } else {
            return 0;
        }
    };

    async function getPermissionsCounterPending (body) {
        const result = await  db.queryGetJustificationsCounterPending(tableJustifications, body.IdEstadoJustP);  
        if (result && result.length >= 0) {
            const count = result[0];
            const contador = count.totalRegistrosPendientes // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador; 
         } else {
            return 0;
        }
    };

    /* 📌 Todos los solicitudes de un trabajador*/
    async function allRequestOfWorker(body) { 
        PageSiize = 7;
        const getOffset = obtenerDatosPaginados(body.page, PageSiize);
        return db.queryAllRequestOfUser(body.idUser, body.typeRequest, body.stateInProgress, body.stateApprovedByLeader, body.stateRejectedByLeader, body.stateInProgressRRHH, body.stateAprovedByRRHH, body.stateRejectedByRRHH, PageSiize, getOffset)
    }

    /* 📌 Todos los solicitudes de un trabajador - contador */
    async function allRequestOfWorkerCounter(body){
        const resultRequestOfWorkerCount = await  db.queryAllRequestOfUserCounter(body.idUser, body.typeRequest, body.stateInProgress, body.stateApprovedByLeader, body.stateRejectedByLeader, body.stateInProgressRRHH, body.stateAprovedByRRHH, body.stateRejectedByRRHH);  
        console.log(resultRequestOfWorkerCount.length);
        if (resultRequestOfWorkerCount && resultRequestOfWorkerCount.length >= 0) {//Mayor a cero porque si es >= 0 si es cero al intentar acceder a la posicion 0 saldra error
            const count = resultRequestOfWorkerCount[0];
            const contador = count.totalRecords // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador; 
         } else {
            return 0;
        }
    }

    /* 📌 Para obtener datos paginados */
    function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
        return  offset = (numeroPagina - 1) * tamanoPagina
    }

    return {
        addAuthorization,
        addJustifications,
        addPermissions,
        addVacations,
        listPermissions,
        updatePermissions,
        getAllPermissions,
        getPermissionsCounter,
        getPermissionsCounterPending,
        allRequestOfWorker,
        allRequestOfWorkerCounter
        
    }
}
