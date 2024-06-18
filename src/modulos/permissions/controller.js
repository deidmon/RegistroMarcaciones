const axios = require("axios");
const moment = require("moment-timezone");
moment.tz.setDefault("America/Lima");
const constant = require("../../helpers/constants");
const tablePermissions = "solicitudes";
const tableTypePermissions = "tiposolicitudes";
const tableState = "estados";
const tableAssist = "asistencias";
const tableJustifications = "justificaciones";
const tableUser = "usuarios";
const tableTypeMark = "tipomarcaciones";
const tableStatePermissions = "estadosolicitudes";
const tableAssignmentStaff = "asignacionpersonal";
const tableLeader = "lider";
const tableDaysOff = "descansos";
const tableSchedule = "horarios";
const tableHoliday = 'feriados';
const PageSiize = constant.pageSize;
var date;
const apiClave = "sTSR8wr4HeS5GAIR5ESP4TEFA76GojVlHAVj0RBHrEHdLUAniKij3AhIWQ8Ed";
const endpoint = "https://portal.valtx.pe/ApiServiciosRRHH/registroVacaciones/registrar";
const endpointIndicator = "https://portal.valtx.pe/ApiServiciosRRHH/indicadorVacaciones/indicadores";

module.exports = function (dbInyectada) {
  let db = dbInyectada;
  message = "";
  if (!db) {
    db = require("../../DB/mysql");
  }

  async function getDateCurrent() {
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    date = `${age}-${month}-${day}`;
  }
  /* 📌 Para obtener datos paginados */
  function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
    return (offset = (numeroPagina - 1) * tamanoPagina);
  }

  /* 📌 Para añadir una justificacion*/
  async function addJustifications(body) {
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    let hour = initialDate.format("HH");
    let minutes = initialDate.format("mm");
    let date = `${age}-${month}-${day}`;
    const data = await db.queryConsultTable(
      tableAssist,
      { IdUsuarios: body.idUser },
      { Fecha: date },
      { IdTMarcacion: body.idTypeMark }
    );
    if (!data || data.length === 0) {
      message = "No existe marcación a justificar";
      return { messages: message };
    }

    const consultRole = await db.query(tableUser, { IdUsuarios: body.idUser });
    const idRole = consultRole.IdRol;
    let statusPermission = 1;
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
    };

    const respuesta = await db.addJustification(
      tablePermissions,
      Justifications
    );

    if (respuesta) {
      message = "Justificación añadida con éxito";
      return { messages: message };
    }
    message = "No se pudo añadir la justificación";
    return { messages: message };
  }

  /* 📌 Para añadir un permiso*/
  async function addPermissions(body) {
    let fechaString = body.datePermission;
    let fechaMoment = moment(fechaString, "YYYY/MM/DD");
    const dayOfWeekName = fechaMoment.format("dddd");
    const daysOff = await db.queryGetDaysOff(
      tableDaysOff,
      tableSchedule,
      tableUser,
      { IdUsuarios: body.idUser }
    );
    const fechaActual = new Date();
    //le restamos 16 horas porque lo crea con 5 horas de adelanto y si la fecha que viene de front se crea con menos horas
        fechaActual.setHours(fechaActual.getHours() - 16);
    var dateObject = new Date(fechaString);

    /* console.log("fechaActual", fechaActual);
    console.log("dateObject", dateObject); */

    if (dateObject < fechaActual){
      message = `La fecha de solicitud no puede ser anterior a la fecha actual`;
      return { messages: message };
    }
    
    if (daysOff.includes(dayOfWeekName)) {
      message = `Debes elegir un día laborable para pedir permiso`;
      return { messages: message };
    }
    
    let date_holiday = moment(fechaString, 'YYYY/MM/DD', true).format('DD-MM-YYYY');
    const is_holiday = await db.queryCheckHoliday( tableHoliday, date_holiday);
    if (is_holiday ===1){
      message = 'La fecha de solicitud no puede ser un feriado';
      return { messages: message };
      
    }
    const checkPermissions = await db.queryCheckPermission(
      tablePermissions,
      2,
      body.idUser,
      { FechaPermiso: body.datePermission }
    );
    if (checkPermissions === 1) {
      message = "Ya tiene un permiso enviado para esa fecha";
      return { messages: message };
    }
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    let date = `${age}-${month}-${day}`;

    let statusPermission = 1;
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
    };

    const respuesta = await db.addJustification(tablePermissions, Permissions);

    if (respuesta) {
      message = "Solicitud de permiso añadido con éxito";
      return message;
    }
    message = "No se pudo añadir la solicitud de permiso";
    return { messages: message };
  }

  /* 📌 Para añadir solicitud de vacaciones */
  async function addVacations(body) {
    const checkPermissions = await db.queryCheckPermission(
      tablePermissions,
      3,
      body.idUser,
      { FechaDesde: body.dateStart }
    );
    if (checkPermissions === 1) {
      message = "Ya registro vacaciones para esa fecha";
      return { messages: message };
    }
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    let hour = initialDate.format("HH");
    let minutes = initialDate.format("mm");
    let date = `${age}-${month}-${day}`;
    /* const data = await db.queryConsultTable(tableAssist, { IdUsuarios: body.idUser }, { Fecha: date }, { IdTMarcacion: body.idTypeMark }); */

    let statusPermission = 1;
    /* if(body.idRole === 1){
            statusPermission = 1
        } */ //OTRA OPCION ES MANDAR TODAS LAS VACIONES EN ESTADO 4

    const Vacations = {
      idTipoSolicitud: 3,
      idUsuario: body.idUser,
      Fecha: date,
      FechaDesde: body.dateStart,
      FechaHasta: body.dateEnd,
      Motivo: body.reason,
      estadoSolicitudF: statusPermission,
    };

    const respuesta = await db.addJustification(tablePermissions, Vacations);

    if (respuesta) {
      message = "Solicitud de vacaciones añadida con éxito";
      return { messages: message };
    }
    message = "No se pudo registrar la solicitud de vacaciones";
    return { messages: message };
  }

    /* 📌 Para añadir solicitud de vacaciones con meta4*/
    async function addVacations2(body) {
        try {
           const response = await axios.post(endpoint, {}, {
             params: body,
             /* {
               codigo: body.codigo,
               perfil: body.perfil,
               inicio: body.inicio,
               fin: body.fin,
               adelanto: body.adelanto,
             }, */
             headers: {
               apiClave: apiClave,
            },
           }
          );
           /* console.log(response.data); */
           return response.data
        } catch (error) {
          console.error(error.response);
          return { messages: error.response.data };
        }
       
    }

    /* 📌 Para traer información de los indicadores vacacionales en meta4*/
    async function holidayIndicators(body) {
      try {
          const response = await axios.get(endpointIndicator, {
            params: {
            codigo: body.codigo,
            
          },
            headers: {
              apiClave: apiClave,
              'Content-Type': 'application/json',
          },
          }
        );
          /* console.log(response.data); */
          return response.data
      } catch (error) {
        console.error(error.response);
        return { messages: error.response.data };
      }
      
  }

  /* 📌 Para permitir que el trabajador ingrese antes de su hora - solo puede realizar el lider*/
  async function addAuthorization(body) {
    let fechaString = body.date;
    let fechaMoment = moment(fechaString, "YYYY/MM/DD");
    const dayOfWeekName = fechaMoment.format("dddd");
    const daysOff = await db.queryGetDaysOff(
      tableDaysOff,
      tableSchedule,
      tableUser,
      { IdUsuarios: body.idUser }
    );
    if (daysOff.includes(dayOfWeekName)) {
      message = `No se puede asignar está autorización porque es un día no laborable para este usuario`;
      return { messages: message };
    }
    const checkAuthorization = await db.queryCheckTimePermission(
      tablePermissions,
      4,
      body.idUser,
      body.date
    );

    if (checkAuthorization > 0) {
      message = "Ya tiene una autorización asignada para esa fecha";
      return { messages: message };
    }
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    let hour = initialDate.format("HH");
    let minutes = initialDate.format("mm");
    let date = `${age}-${month}-${day}`;

    let statusPermission = 2;

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
    };

    const respuesta = await db.addJustification(
      tablePermissions,
      authorization
    );

    if (respuesta) {
      message = "Autorización añadida con éxito";
      return { messages: message };
    }
    message = "No se pudo hacer el registro de autorizción";
    return { messages: message };
  }

  /* 📌 Para actualizar aceptar o rechazar solicitud*/
  async function updatePermissions(body) {
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    let hour = initialDate.format("HH");
    let minutes = initialDate.format("mm");
    let date = `${age}-${month}-${day}`;
    const datum = await db.queryConsultTable(
      tablePermissions,
      { idTipoSolicitud: body.idTypePermission },
      { IdUsuario: body.idUser },
      { Fecha: body.date }
    );
    if (!datum || datum.length === 0) {
      message = "No existe la permiso a actualizar";
      return { messages: message };
    }
    const idPermission = datum[0].id;
    if (body.idStatusPermission != 1) {
      if (body.idStatusPermission <= 3) {
        const firstUpdate = {
          estadoSolicitudF: body.idStatusPermission,
          Updated_byF: body.idUserModifier,
        };
        const respond = await db.queryUpdatePermission(
          tablePermissions,
          firstUpdate,
          idPermission
        );
      } else {
        const secondUpdate = {
          estadoSolicitudS: body.idStatusPermission,
          Updated_byS: body.idUserModifier,
        };
        const respond = await db.queryUpdatePermission(
          tablePermissions,
          secondUpdate,
          idPermission
        );
      }

      if (body.idStatusPermission == 2 && body.idTypePermission === 1) {
        idTypeMark = datum[0].idTMarcaciones;
        const data = await db.queryConsultTable(
          tableAssist,
          { IdUsuarios: body.idUser },
          { Fecha: body.date },
          { IdTMarcacion: idTypeMark }
        );
        if (!data || data.length === 0) {
          message = "No existe marcación a actualizar";
          return { messages: message };
        }
        const idMark = data[0].IdAsistencias;
        const Mark = {};
        Mark.idValidacion = 4;
        Mark.Updated_at = date;
        Mark.Updated_by = body.idUserModifier;
        const respuesta = await db.queryUpdateAssists(
          tableAssist,
          Mark,
          idMark
        );

        message = "Justificación actualizada con éxito";
        return { messages: message };
      }

      message = "Permiso ha sido actualizado";
      return { messages: message };
    }
    message = "No se puede actualizar la justificación";
    return { messages: message };
  }

  /* 📌 Para listar permisos */
  async function listPermissions(body) {
    if (body.idPermission === -1) {
      body.idPermission = null;
    }
    if (body.idStatus === -1) {
      body.idStatus = null;
    }
    return db.queryListPermissions(
      tableTypePermissions,
      tableState,
      body.idStatus,
      body.idPermission
    );
  }

  /* 📌 Obtener todos permisos */
  async function getAllPermissions(body) {
    if (body.idStatusPermission === -1) {
      body.idStatusPermission = null;
    }
    if (body.idStatusPermission === -1) {
      body.idStatusPermission = null;
    }
    function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
      return (offset = (numeroPagina - 1) * tamanoPagina);
    }

    const getOffset = obtenerDatosPaginados(body.page, PageSiize);
    return db.queryGetPermissions(
      tablePermissions,
      tableUser,
      tableTypeMark,
      tableStatePermissions,
      tableTypePermissions,
      tableAssignmentStaff,
      tableLeader,
      body.name,
      body.idUser,
      body.idStatusPermission,
      PageSiize,
      getOffset
    );
  }

  /* 📌 Contador de permisos */
  async function getPermissionsCounter(body) {
    const result = await db.queryGetJustificationsCounter(
      tableJustifications,
      tableUser,
      body.name,
      body.IdEstadoJustP,
      body.IdEstadoJustJ,
      body.IdEstadoJustR
    );
    if (result && result.length >= 0) {
      const count = result[0];
      const contador = count.totalRegistros; // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
      /* console.log(contador); */
      return contador;
    } else {
      return 0;
    }
  }

  /* 📌 Contador de permisos pendientes */
  async function getPermissionsCounterPending(body) {
    const result = await db.queryGetJustificationsCounterPending(
      tableJustifications,
      body.IdEstadoJustP
    );
    if (result && result.length >= 0) {
      const count = result[0];
      const contador = count.totalRegistrosPendientes; // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
      return contador;
    } else {
      return 0;
    }
  }

  /* 📌 Todos los solicitudes de un trabajador*/
  async function allRequestOfWorker(body) {
    const getOffset = obtenerDatosPaginados(body.page, PageSiize);
    return db.queryAllRequestOfUser(
      body.idUser,
      body.typeRequest,
      body.stateInProgress,
      body.stateApprovedByLeader,
      body.stateRejectedByLeader,
      body.stateInProgressRRHH,
      body.stateAprovedByRRHH,
      body.stateRejectedByRRHH,
      PageSiize,
      getOffset
    );
  }

  /* 📌 Todos los solicitudes de un trabajador - contador */
  async function allRequestOfWorkerCounter(body) {
    const resultRequestOfWorkerCount = await db.queryAllRequestOfUserCounter(
      body.idUser,
      body.typeRequest,
      body.stateInProgress,
      body.stateApprovedByLeader,
      body.stateRejectedByLeader,
      body.stateInProgressRRHH,
      body.stateAprovedByRRHH,
      body.stateRejectedByRRHH
    );
    /* console.log(resultRequestOfWorkerCount.length); */
    if (resultRequestOfWorkerCount && resultRequestOfWorkerCount.length >= 0) {
      //Mayor a cero porque si es >= 0 si es cero al intentar acceder a la posicion 0 saldra error
      const count = resultRequestOfWorkerCount[0];
      const contador = count.totalRecords; // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
      return contador;
    } else {
      return 0;
    }
  }

  /* 📌 Todos los solicitudes de los trabajadores asignados a un lider*/
  async function allRequestOfWorkersAsignedToLeader(body) {
    var getIdsOfWorkers = await db.queryGetIdAsignedToLeader(body.idLeader); //Obtener los ids de trabajadores asignados al lider
    var listaDeIds = getIdsOfWorkers.map(function (rowDataPacket) {
      //Mapear los objetos RowDataPacket y pasarlos a una lista de  los
      return rowDataPacket.idUsuario;
    });
    var idWorkersString = listaDeIds.join(", "); //convierte el array en una cadena separada por comas.
    if (idWorkersString === "") {
      //Poner almenos un valor para que no salga error
      idWorkersString = "0";
    }
    const getOffset = obtenerDatosPaginados(body.page, PageSiize);
    return db.queryAllRequestOfUserAsignedToLeader(
      idWorkersString,
      body.filterName,
      body.filterCIP,
      body.filterDNI,
      body.typeRequest,
      body.stateInProgress,
      body.stateApprovedByLeader,
      body.stateRejectedByLeader,
      body.stateInProgressRRHH,
      body.stateAprovedByRRHH,
      body.stateRejectedByRRHH,
      PageSiize,
      getOffset
    );
  }

  /* 📌 Todos los solicitudes de los trabajadores asignados a un lider - contador */
  async function allRequestOfUserAsignedToLeaderCounter(body) {
    var getIdsOfWorkers = await db.queryGetIdAsignedToLeader(body.idLeader); //Obtener los ids de trabajadores asignados al lider
    var listaDeIds = getIdsOfWorkers.map(function (rowDataPacket) {
      //Mapear los objetos RowDataPacket y pasarlos a una lista de  los
      return rowDataPacket.idUsuario;
    });
    var idWorkersString = listaDeIds.join(", "); //convierte el array en una cadena separada por comas.
    if (idWorkersString === "") {
      idWorkersString = "0";
    }
    const resultRequestOfWorkerCount =
      await db.queryAllRequestOfUserAsignedToLeaderCounter(
        idWorkersString,
        body.filterName,
        body.filterCIP,
        body.filterDNI,
        body.typeRequest,
        body.stateInProgress,
        body.stateApprovedByLeader,
        body.stateRejectedByLeader,
        body.stateInProgressRRHH,
        body.stateAprovedByRRHH,
        body.stateRejectedByRRHH
      );
    if (resultRequestOfWorkerCount && resultRequestOfWorkerCount.length >= 0) {
      //Mayor a cero porque si es >= 0 si es cero al intentar acceder a la posicion 0 saldra error
      const count = resultRequestOfWorkerCount[0];
      const contador = count.totalRecords; // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
      return contador;
    } else {
      return 0;
    }
  }

  /* 📌 Todos los solicitudes de todos los trabajadores para RRHH*/
  async function allRequestOfAllWorkersToRRHH(body) {
    const getOffset = obtenerDatosPaginados(body.page, PageSiize);
    return db.queryAllRequestOfUserToRRHH(
      body.typeRequest,
      body.filterName,
      body.filterCIP,
      body.filterDNI,
      body.stateInProgress,
      body.stateApprovedByLeader,
      body.stateRejectedByLeader,
      body.stateInProgressRRHH,
      body.stateAprovedByRRHH,
      body.stateRejectedByRRHH,
      PageSiize,
      getOffset
    );
  }

  /* 📌 Todos los solicitudes de todos los trabajadores para RRHH - contador */
  async function allRequestOfAllWorkersCounterToRRHH(body) {
    const resultRequestOfWorkerCounter =
      await db.queryAllRequestOfUserToRRHHCounter(
        body.typeRequest,
        body.filterName,
        body.filterCIP,
        body.filterDNI,
        body.stateInProgress,
        body.stateApprovedByLeader,
        body.stateRejectedByLeader,
        body.stateInProgressRRHH,
        body.stateAprovedByRRHH,
        body.stateRejectedByRRHH
      );
    if (
      resultRequestOfWorkerCounter &&
      resultRequestOfWorkerCounter.length >= 0
    ) {
      //Mayor a cero porque si es >= 0 si es cero al intentar acceder a la posicion 0 saldra error
      const count = resultRequestOfWorkerCounter[0];
      const contador = count.totalRecords; // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
      return contador;
    } else {
      return 0;
    }
  }

  /* 📌 Aceptar o rechazar solicitudes */
  async function managementOfRequests(body) {
    //1.Primero verificar el rol si es lider o rrhh
    const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
    const idRoles = whatRolHaveWorker.map((row) => row.IdRol);
    if (idRoles.includes(1)) {
      message = "No tienes permiso para actualizar";
      return { messages: message };
    }

    //Si es lider actualizara estos datos
    const valuesOfLider = {
      estadoSolicitudF: body.estadoSolicitudF,
      Updated_byF: body.idUser,
    };

    //Si es rrhh actualizara estos otros
    const valuesOfRRHH = {
      estadoSolicitudF: body.estadoSolicitudF,
      Updated_byS: body.idUser,
    };

    await getDateCurrent();

    const findOutIdsToModifyAssistance = await db.queryConsultRequest(
      tablePermissions,
      body.ids
    );
    if(body.estadoSolicitudF == 2){
        if (findOutIdsToModifyAssistance.length != 0) {
            /* console.log("pasa por aqui"); */
          for (let i = 0 ; i < findOutIdsToModifyAssistance.length; i++) {
            /* console.log("hola ",findOutIdsToModifyAssistance[i].idUsuario); */
            const data = await db.queryConsultTable(
              tableAssist,
              { IdUsuarios: findOutIdsToModifyAssistance[i].idUsuario },
              { Fecha: findOutIdsToModifyAssistance[i].Fecha },
              { IdTMarcacion: findOutIdsToModifyAssistance[i].idTMarcaciones }
            );
                /* console.log("aqui"); */
            if (!data || data.length === 0) {
              message = "No existe marcación a actualizar";
              return { messages: message };
            }
           
            /* console.log("soy la i: ", i); */
            const idMark = data[0].IdAsistencias;
    
            /* console.log("fecha")
            console.log("fecha",date) */
            const toUpdateInAssistance = {
              idValidacion: 4,
              Updated_at: date,
              Updated_by: body.idUser,
            };
    
            const respuesta = await db.queryUpdateAssists(
              tableAssist,
              toUpdateInAssistance,
              idMark
            );
          }
        }
    }
    

    /* console.log("antes de actualizar solicitudes"); */
    const updatigRequests = await db.queryManagementOfRequests(
      tablePermissions,
      idRoles.includes(2) ? valuesOfLider : valuesOfRRHH,
      body.ids
    );

    if (updatigRequests && updatigRequests.changedRows > 0) {
      return "Modificación de estado con éxito";
    } else {
      return "No se realizó ninguna modificación";
    }
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
    allRequestOfWorkerCounter,
    allRequestOfWorkersAsignedToLeader,
    allRequestOfUserAsignedToLeaderCounter,
    allRequestOfAllWorkersToRRHH,
    allRequestOfAllWorkersCounterToRRHH,
    managementOfRequests,
    addVacations2,
    holidayIndicators
  };
};
