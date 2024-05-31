const cron = require('node-cron');
const axios = require("axios");
const config = require("../../config");
const constant = require("../../helpers/constants");
const helpers = require("../../helpers/helpers");
const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const db = require('../../DB/mysql');
const bcrypt = require('bcrypt');

var date;
const apiClave = "sTSR8wr4HeS5GAIR5ESP4TEFA76GojVlHAVj0RBHrEHdLUAniKij3AhIWQ8Ed";
const endpoint = "https://portal.valtx.pe/ApiServiciosRRHH/personal/consulta?codigo";


/* 📌Consultar a la base de Meta-4*/
async function consultDataUsers() {
  
  try {
    const response = await axios.get(endpoint, /* jsonData, */ {
      headers: {
        apiClave: apiClave,
        'Content-Type': 'application/json',
      },
      timeout : 500000,
    }
  );
  /* console.log("response.data", response.data) */
    return response.data;
  } catch (error) {
    console.error(`Error al consultar data de usuarios. ${error}`);
    /* return "Error al consultar data de usuarios."; */
  }
};

function modalityOfWork(userModality) {
  modality = Number(userModality)
  switch (modality) {
     case 1:
       return 3;
     case 2:
       return 1;
     case 4:
       return 2;
     default:
       return 2;
  }
 }
 function convertDate(originalDate) {
  const partsDate = originalDate.split('/');
  return `${partsDate[2]}-${partsDate[1]}-${partsDate[0]}`;
 }

 function validateSchedule(schedule) {
  const regex = /40(\d{2})/; // Expresión regular que busca '40' 
  const match = schedule.match(regex);
  if (match) {
  const scheduleUser = match[1]; 
  return scheduleUser;
  } 
  return '10000';
 }

 function validateCodeArea(texto) {
  const regex = /^\d+/; // Expresión regular que busca codigo del area
  const match = texto.match(regex);
  if (match) {
    const codeArea = match[0]; 
    return codeArea;
  } 
  return 0;
  
 }

 async function getDataUsers22() {
  const valuesDataUser = await consultDataUsers();
  if(!valuesDataUser){
    console.log('No se hizo la petición')
    return 'No viene data'
  }
  let userActive = []
  //Para el json de meta4 verificamos si existe el usuario lo almacenamos sino lo agregamos
  const promises = valuesDataUser.personal.map(async (row) => {
    try {       
      const usersUnregistered = await db.queryVerifyUserIsActive(
        constant.tableUser,
        row.EmpleadoCIP
      );
      //Convertir el horario de meta4 a horario de la base de datos
      let scheduleUser = validateSchedule(row.EmpleadoCodHorario || 'Sin horario');
      //Usuario ya está activado
      if (usersUnregistered === 1){
        /* const isUserActive = await db.queryVerifyUserIsActive(constant.tableUser) */
        userActive.push(row.EmpleadoCIP);
        // Verificar el horario y modificarlo  ---------------- DESACTIVAR LA SEGUNDA VEZ QUE SE EJECUTE
        const consultUserSchedule = await db.queryGetIdSchedule(constant.tableUser, {CIP : row.EmpleadoCIP})
        let scheduleExist = await db.queryScheduleExist(constant.tableSchedule, scheduleUser)
        if (scheduleExist === 0){
          scheduleExist = 8;
        }
        if( consultUserSchedule !== scheduleExist){
          const updateItem = {
            IdHorarios: scheduleExist, 
          }             
          const updateScheduleUser = await db.queryUpdateAnyTable(constant.tableUser, updateItem,{CIP : row.EmpleadoCIP} );
        }
        //ACTUALIZAR CODEAREA DE LOS USUARIOS --SOLO LA PRIMERA VEZ
        /* const updateCodeArea = {
          CodeArea: validateCodeArea(row.EmpleadoUnidad), 
        }             
        const updateCodeAreaUser = await db.queryUpdateAnyTable(constant.tableUser, updateCodeArea,{CIP : row.EmpleadoCIP} ); */

      }
      //Existe el usuario pero está inactivo
      if (usersUnregistered === 0){
        userActive.push(row.EmpleadoCIP);
        const updateStateUser = await db.queryUpdateStateUsers(constant.tableUser,row.EmpleadoCIP)
      }
      
      //Añadir un nuevo usuario
      if (usersUnregistered === -1){    
        userActive.push(row.EmpleadoCIP);     
        const userNames = row.EmpleadoNombres.split(",");
        const apellidos = userNames[0];
        const nombres = userNames[1];
        password = await bcrypt.hash(row.EmpleadoNumDoc.toString(), 5);
        let scheduleExist = await db.queryScheduleExist(constant.tableSchedule, scheduleUser)
        if (scheduleExist === 0){
          scheduleExist = 8;
        }
        const usuario = {
            Nombres: nombres,
            Apellidos: apellidos,
            Activo: 1,
            Usuario: row.EmpleadoNumDoc,
            Contraseña: password,
            IdRol: /* body.idRole */1,
            IdDirec: /* body.idAddress */1,
            IdDirecSecu: /* body.idSecondaryAddress */2,
            IdModalidad: modalityOfWork(row.EmpleadoCodModalidad),
            CIP: row.EmpleadoCIP,
            DNI: row.EmpleadoNumDoc,
            idHorarios: scheduleExist, /* luego cambiar el horario */
            idPerfil: 1 /* VER DATA DE META4 */,
            /* tiempoPermiso: 0, */
            Email : row.EmpleadoCorreoLab,
            isFisrtLogin : 1,
            /* CodeArea: validateCodeArea(row.EmpleadoUnidad) */
        }             
        const respuesta = await db.add(constant.tableUser, usuario);
        if (respuesta && respuesta.affectedRows > 0) {
            console.log(`Usuario añadido con éxito, CIP: ${row.EmpleadoCIP}`);
        } else {
            console.log('No se añadió el usuario');
        }        
      }
      
      if(Array.isArray(row.VacacionesDtoLista) && row.VacacionesDtoLista.length > 0){
        let initialDate = moment();
        let date = await helpers.getDateToday(initialDate);
        const userId = await db.queryUserId(constant.tableUser, row.EmpleadoCIP)
        const verifyLicensing = await db.queryVerifyLicensing(constant.tablePermissions, {
          idUsuario: userId}, {idTipoSolicitud:3}, {FechaDesde: convertDate(row.VacacionesDtoLista[0].FechaInicio)}, {FechaHasta: convertDate(row.VacacionesDtoLista[0].FechaFin)},
          { estadoSolicitudF: 2});  
        if (verifyLicensing === 0){
          const addLicensingUser = {
            idUsuario: userId,
            idTipoSolicitud:3,
            Fecha: date,
            FechaDesde: convertDate(row.VacacionesDtoLista[0].FechaInicio),
            FechaHasta: convertDate(row.VacacionesDtoLista[0].FechaFin),
            estadoSolicitudF: 2
          } 
          const addLicensing = await db.addNewRegister(constant.tablePermissions, addLicensingUser);
          if(addLicensing.affectedRows ===1){
            console.log(`Licencia añadida, usuario: ${userId}, CIP: ${row.EmpleadoCIP}`)
          }
        }

      }

      //funcion para asignar personal:
      if (row.EmpleadoCodJefe && row.EmpleadoCodJefe.trim()!== "") {
        const userId = await db.queryUserId(constant.tableUser, row.EmpleadoCIP)
        const verifyUserLeader = await db.queryConsultUserLeader(constant.tablePersonalAssigment, userId)
        const liderId = await db.queryUserId(constant.tableUser, row.EmpleadoCodJefe)
        if(verifyUserLeader === -1){
          const newWorkerAsignedToLeader = {
                  idLider: liderId,
                  idUsuario: userId
          };
          const responsoInsert = await db.addNewRegister(constant.tablePersonalAssigment, newWorkerAsignedToLeader );
          if(responsoInsert.affectedRows === 1){
            console.log(`Asignado a líder con éxito`)
          }
        }else if(verifyUserLeader !== liderId){
          const toUpdate = {
            idLider: liderId
          };
          const idWhere = {
              idUsuario: userId
          };
          const response = await db.queryUpdateAnyTable(constant.tablePersonalAssigment, toUpdate, idWhere);
          if (response && response.affectedRows > 0) {
            console.log('Modificado con éxito');
          }
        }
      }
      
    } catch (error) {
      return("Error en la ejecución programada:", error);
    }
    });
    const results = await Promise.all(promises);
  
  const usersInactive = await db.queryUsersInactive(constant.tableUser, userActive);
 /*  console.log(usersInactive) */
  if (usersInactive && usersInactive.changedRows > 0) {
      console.log(`Usuarios desactivados: ${usersInactive.changedRows}`);
  } else {
      console.log(`No hay usuarios a desactivar`);
  }
};
 
async function startProgrammingDataUsers() {
    function scheduleTask(cronExpression) {
      cron.schedule(cronExpression, async () => {
        /* getDataUsers(); */
        getDataUsers22();

      });
    }
  
    //CAMBIAR LA HORA A LA QUE SE EJECUTARA '04:20:00'
    let uniqueHourCronJob = ["05:00:00"]; //Cronjob inicial 
    const hourCronJob = uniqueHourCronJob.map((hour) => {
      const serverTime = moment.tz(hour, "HH:mm:ss", "America/Lima");
      //const serverTime = objetMoment.tz("UTC"); //  'ZonaHorariaDelServidor'
      const minutes = serverTime.format("mm");
      const hours = serverTime.format("HH");
  
      return `${minutes} ${hours} * * *`;
    });
    console.log(hourCronJob);
    hourCronJob.forEach((cronExpression) => {
      scheduleTask(cronExpression);
    });
};

startProgrammingDataUsers()