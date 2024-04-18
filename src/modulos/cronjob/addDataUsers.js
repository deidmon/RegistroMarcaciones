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
    console.error(`Error al consultar data de usuarios. ${error.data}`);
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
      //Usuario ya está activado
      if (usersUnregistered === 1){
        /* const isUserActive = await db.queryVerifyUserIsActive(constant.tableUser) */
        userActive.push(row.EmpleadoCIP);
        // Verificar el horario y modificarlo
        const consultUserSchedule = await db.queryGetIdSchedule(constant.tableUser, {CIP : row.EmpleadoCIP})
        if( consultUserSchedule !==  Number(row.EmpleadoCodHorario)){
          const updateItem = {
            IdHorarios: row.EmpleadoCodHorario, 
          }             
          const updateScheduleUser = await db.queryUpdateAnyTable(constant.tableUser, updateItem,{CIP : row.EmpleadoCIP} );
        }
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
        password = await bcrypt.hash(row.EmpleadoNumDoc.toString(), 5)
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
            idHorarios: row.EmpleadoCodHorario /* luego cambiar el horario */,
            idPerfil: 1 /* VER DATA DE META4 */,
            /* tiempoPermiso: 0, */
            Email : row.EmpleadoCorreoLab,
            isFisrtLogin : 1
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
    let uniqueHourCronJob = ["15:15:00"]; //Cronjob inicial 
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