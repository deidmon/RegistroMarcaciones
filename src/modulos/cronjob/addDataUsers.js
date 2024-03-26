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
const endpoint = "http://10.4.220.15/ApiServiciosRRHH/personal/consulta?codigo";


/* 📌Consultar a la base de Meta-4*/
async function consultDataUsers() {
  
  try {
    const response = await axios.get(endpoint, /* jsonData, */ {
      headers: {
        apiClave: apiClave,
        'Content-Type': 'application/json',
      },
    }
  );
    /* console.log(response.data) */
    return response.data;
  } catch (error) {
    console.error(`Error al consultar data de usuarios.`);
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
       return 1;
  }
 }
 function convertDate(originalDate) {
  const partsDate = originalDate.split('-');
  return `${partsDate[2]}-${partsDate[1]}-${partsDate[0]}`;
 }

 async function getDataUsers22() {
  const valuesDataUser = await consultDataUsers();
  /* console.log(valuesDataUser) */
  /* {
    "personal":[
      {
      "EmpleadoNombres": "Lima Rio, Jose Juan4",
      "EmpleadoNumDoc": "90908900",
      "EmpleadoCIP": "890890011",
      "EmpleadoCorreoLab": "Juan@gmail.com",
      "EmpleadoCodModalidad": 3,
      "LicenciasDtoLista" :{
        "FechaInicio" : "22-03-2024",
        "FechaFin" : "30-03-2024"
      }
      
      },
      {
        "EmpleadoNombres": "Lima Rio, Jose Juan444",
        "EmpleadoNumDoc": "90908000",
        "EmpleadoCIP": "890890111",
        "EmpleadoCorreoLab": "Juan@gmail.com",
        "EmpleadoCodModalidad": 3,
        "LicenciasDtoLista" :{
          "FechaInicio" : "22-03-2024",
          "FechaFin" : "30-03-2024"
        }
        
        },
      {
      "EmpleadoNombres": "Flores Rio, Jose Juan5",
      "EmpleadoNumDoc": "90908901",
      "EmpleadoCIP": "890890012",
      "EmpleadoCodModalidad": 3,
      "EmpleadoCorreoLab": "Juan2@gmail.com",
      "LicenciasDtoLista" :{
        
      }
      
      },
      {
      "EmpleadoNombres": "Lin Rio, Jose Juan6",
      "EmpleadoNumDoc": "90908902",
      "EmpleadoCIP": "890890013",
      "EmpleadoCodModalidad": 3,
      "EmpleadoCorreoLab": "Juan3@gmail.com",      
      },
      ]
  }; */
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
      //Almacenamos el cip del usuario
      if (usersUnregistered === 1){
        /* const isUserActive = await db.queryVerifyUserIsActive(constant.tableUser) */
        userActive.push(row.EmpleadoCIP);
      }
      //Existe el usuario pero está inactivo
      if (usersUnregistered === 0){
        const updateStateUser = await db.queryUpdateStateUsers(constant.tableUser,row.EmpleadoCIP)
        userActive.push(row.EmpleadoCIP);
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
            idHorarios: 1,
            idPerfil: 1 /* VER DATA DE META4 */,
            tiempoPermiso: 0,
            Email : row.EmpleadoCorreoLab,
            isFisrtLogin : 1
        }             
        const respuesta = await db.add(constant.tableUser, usuario);
        if (respuesta && respuesta.affectedRows > 0) {
            console.log('Usuario añadido con éxito');
        } else {
            console.log('No se añadió el usuario');
        }        
      }
      
      if( row.LicenciasDtoLista &&  Object.keys(row.LicenciasDtoLista).length > 0){
        let initialDate = moment();
        let date = await helpers.getDateToday(initialDate);
        const userId = await db.queryUserId(constant.tableUser, row.EmpleadoCIP)
        /* console.log(userId)   */         
        const verifyLicensing = await db.queryVerifyLicensing(constant.tablePermissions, {
          idUsuario: userId}, {idTipoSolicitud:3}, {FechaDesde: convertDate(row.LicenciasDtoLista.FechaInicio)}, {FechaHasta: convertDate(row.LicenciasDtoLista.FechaFin)},
          { estadoSolicitudF: 2});
        /* console.log(verifyLicensing) */
        if (verifyLicensing === 0){
          const addLicensingUser = {
            idUsuario: userId,
            idTipoSolicitud:3,
            Fecha: date,
            FechaDesde: convertDate(row.LicenciasDtoLista.FechaInicio),
            FechaHasta: convertDate(row.LicenciasDtoLista.FechaFin),
            estadoSolicitudF: 2
          } 
          const addLicensing = await db.addNewRegister(constant.tablePermissions, addLicensingUser);   
          console.log('Licencia añadida')
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
 
async function getDataUsers2() {
  const valuesDataUser = /* await consultDataUsers(); */
  /* console.log(valuesDataUser) */
  {
    "personal":[
      {
      "EmpleadoNombres": "Lima Rio, Jose Juan4",
      "EmpleadoNumDoc": "90908900",
      "EmpleadoCIP": "890890011",
      "EmpleadoCorreoLab": "Juan@gmail.com",
      "EmpleadoCodModalidad": 3,
      "LicenciasDtoLista" :{
        "FechaInicio" : "22-03-2024",
        "FechaFin" : "30-03-2024"
      }
      
      },
      {
        "EmpleadoNombres": "Lima Rio, Jose Juan444",
        "EmpleadoNumDoc": "90908000",
        "EmpleadoCIP": "890890111",
        "EmpleadoCorreoLab": "Juan@gmail.com",
        "EmpleadoCodModalidad": 3,
        "LicenciasDtoLista" :{
          "FechaInicio" : "22-03-2024",
          "FechaFin" : "30-03-2024"
        }
        
        },
      {
      "EmpleadoNombres": "Flores Rio, Jose Juan5",
      "EmpleadoNumDoc": "90908901",
      "EmpleadoCIP": "890890012",
      "EmpleadoCodModalidad": 3,
      "EmpleadoCorreoLab": "Juan2@gmail.com",
      "LicenciasDtoLista" :{
        
      }
      
      },
      {
      "EmpleadoNombres": "Lin Rio, Jose Juan6",
      "EmpleadoNumDoc": "90908902",
      "EmpleadoCIP": "890890013",
      "EmpleadoCodModalidad": 3,
      "EmpleadoCorreoLab": "Juan3@gmail.com",      
      },
      ]
  };
  if(!valuesDataUser){
    console.log('No se hizo la petición')
    return 'No viene data'
  }
  let userActive = []
  //Para el json de meta4 verificamos si existe el usuario lo almacenamos sino lo agregamos
  const promises = valuesDataUser.personal.map(async (row) => {
    try {       
      const usersUnregistered = await db.queryUserExist(
        constant.tableUser,
        row.EmpleadoCIP
      );
      //Almacenamos el cip del usuario
      if (usersUnregistered === 1){
        /* const isUserActive = await db.queryVerifyUserIsActive(constant.tableUser) */
        userActive.push(row.EmpleadoCIP);
      }
      
      //Añadir un nuevo usuario
      if (usersUnregistered === 0){    
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
            idHorarios: 1,
            idPerfil: 1 /* VER DATA DE META4 */,
            tiempoPermiso: 0,
            Email : row.EmpleadoCorreoLab,
            isFisrtLogin : 1
        }             
        const respuesta = await db.add(constant.tableUser, usuario);
        if (respuesta && respuesta.affectedRows > 0) {
            console.log('Usuario añadido con éxito');
        } else {
            console.log('No se añadió el usuario');
        }        
      }
      
      if( row.LicenciasDtoLista &&  Object.keys(row.LicenciasDtoLista).length > 0){
        let initialDate = moment();
        let date = await helpers.getDateToday(initialDate);
        const userId = await db.queryUserId(constant.tableUser, row.EmpleadoCIP)
        /* console.log(userId)   */         
        const verifyLicensing = await db.queryVerifyLicensing(constant.tablePermissions, {
          idUsuario: userId}, {idTipoSolicitud:3}, {FechaDesde: convertDate(row.LicenciasDtoLista.FechaInicio)}, {FechaHasta: convertDate(row.LicenciasDtoLista.FechaFin)},
          { estadoSolicitudF: 2});
        /* console.log(verifyLicensing) */
        if (verifyLicensing === 0){
          const addLicensingUser = {
            idUsuario: userId,
            idTipoSolicitud:3,
            Fecha: date,
            FechaDesde: convertDate(row.LicenciasDtoLista.FechaInicio),
            FechaHasta: convertDate(row.LicenciasDtoLista.FechaFin),
            estadoSolicitudF: 2
          } 
          const addLicensing = await db.addNewRegister(constant.tablePermissions, addLicensingUser);   
          console.log('Licencia añadida')
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
    let uniqueHourCronJob = ["12:43:00"]; //Cronjob inicial 
    const hourCronJob = uniqueHourCronJob.map((hour) => {
      const objetMoment = moment.tz(hour, "HH:mm:ss", "America/Lima");
      const serverTime = objetMoment.tz("UTC"); //  'ZonaHorariaDelServidor'
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