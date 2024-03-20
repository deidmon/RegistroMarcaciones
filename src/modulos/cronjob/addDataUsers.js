const cron = require('node-cron');
const axios = require("axios");
const config = require("../../config");
const constant = require("../../helpers/constants");
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
    return response.data;
  } catch (error) {
    console.error(`Error al consultar data de usuarios.`);
    /* return "Error al consultar data de usuarios."; */
  }
};

async function getDataUsers() {
    const valuesDataUser = /* await consultDataUsers(); */ 
    {
      "personal": [
        {
        "EmpleadoNombres": "Flores Rio, Jose Juan",
        "EmpleadoNumDoc": "90908908",
        "EmpleadoCIP": "890890789",
        "EmpleadoEmail": "Juan@gmail.com"
        
        },
        {
        "EmpleadoNombres": "Flores Rio, Jose Juan2",
        "EmpleadoNumDoc": "90908908",
        "EmpleadoCIP": "890890789",
        "EmpleadoEmail": "Juan2@gmail.com"
        
        },
        {
        "EmpleadoNombres": "Flores Rio, Jose Juan3",
        "EmpleadoNumDoc": "90908908",
        "EmpleadoCIP": "890890789",
        "EmpleadoEmail": "Juan3@gmail.com"
        
        },
        ]
    };
    /* console.log(valuesDataUser) */
    //Actualizamos el estado a deshabilitado a todos los usuarios
    const toUpdate = { Activo: 0}
    const disableStatus = await db.queryUpdateStatusUser(constant.tableUser, toUpdate)
    //Para el json de meta4 verificamos si existe el usuario y lo actualizamos o  agregamos
    await Promise.all(
      valuesDataUser.personal.map(async (row) => {
        /* console.log ( row) */
        try {       
          const usersUnregistered = await db.queryUserExist(
            constant.tableUser,
            row.EmpleadoCIP
          );
         /*  console.log(usersUnregistered) */
          //Actualizamos el estado a activo
          if (usersUnregistered === 1){
            const toUpdate = {Activo: 1}

            const whereUpdate = {
                CIP: row.EmpleadoCIP
            }
            const updateStateUser = await db.queryUpdateAnyTable(constant.tableUser, toUpdate, whereUpdate );
            if (updateStateUser && updateStateUser.affectedRows > 0) {
              console.log('Usuario modificado con éxito');
            } else {
              console.log('No se modifico el usuario');
          }
          }
          
          //Añadir un nuevo usuario
          if (usersUnregistered === 0){        
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
                IdModalidad: /* body.idModality */1,
                CIP: row.EmpleadoCIP,
                DNI: row.EmpleadoNumDoc,
                idHorarios: 1,
                idPerfil: 1,
                Email : row.EmpleadoEmail,
                /* isFisrtLogin : 1 */
            }           
            const respuesta = await db.add(constant.tableUser, usuario);
            if (respuesta && respuesta.affectedRows > 0) {
                console.log('Usuario añadido con éxito');
            } else {
                console.log('No se añadió el usuario');
            }
          }
            
          
        } catch (error) {
          return("Error en la ejecución programada:", error);
        }
      })
    );
    
};

async function getDataUsers2() {
  const valuesDataUser = await consultDataUsers();
  /* console.log(valuesDataUser) */
  /* {
    "personal":[
      {
      "EmpleadoNombres": "Lima Rio, Jose Juan4",
      "EmpleadoNumDoc": "90908900",
      "EmpleadoCIP": "890890011",
      "EmpleadoEmail": "Juan@gmail.com"
      
      },
      {
      "EmpleadoNombres": "Flores Rio, Jose Juan5",
      "EmpleadoNumDoc": "90908901",
      "EmpleadoCIP": "890890012",
      "EmpleadoEmail": "Juan2@gmail.com"
      
      },
      {
      "EmpleadoNombres": "Lin Rio, Jose Juan6",
      "EmpleadoNumDoc": "90908902",
      "EmpleadoCIP": "890890013",
      "EmpleadoEmail": "Juan3@gmail.com"
      
      },
      ]
  }; */
  if(!valuesDataUser){
    console.log('No se hizo la petición')
    return 'No viene data'
  }
  let userActive = []
  //Para el json de meta4 verificamos si existe el usuario lo almacenamos sino lo agregamos
  await Promise.all(
    valuesDataUser.personal.map(async (row) => {
      try {       
        const usersUnregistered = await db.queryUserExist(
          constant.tableUser,
          row.EmpleadoCIP
        );
        /* console.log(usersUnregistered) */
        //Almacenamos el cip del usuario
        if (usersUnregistered === 1){
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
              IdModalidad: /* body.idModality */1,
              CIP: row.EmpleadoCIP,
              DNI: row.EmpleadoNumDoc,
              idHorarios: 1,
              idPerfil: 1 /* VER DATA DE META4 */,
              tiempoPermiso: 0,
              Email : row.EmpleadoCorreoLab,
              /* isFisrtLogin : 1 */
          }             
          const respuesta = await db.add(constant.tableUser, usuario);
          if (respuesta && respuesta.affectedRows > 0) {
              console.log('Usuario añadido con éxito');
          } else {
              console.log('No se añadió el usuario');
          }
        }
          
        
      } catch (error) {
        return("Error en la ejecución programada:", error);
      }
    })
  );
  
  const usersInactive = await db.queryUsersInactive(constant.tableUser, userActive);
 /*  console.log(usersInactive) */
  if (usersInactive && usersInactive.changedRows > 0) {
      console.log(`Usuarios desactivados: ${usersInactive.changedRows}`);
  } else {
      console.log(`No se desactivaron usuarios`);
  }
};

async function startProgrammingDataUsers() {
    function scheduleTask(cronExpression) {
      cron.schedule(cronExpression, async () => {
        /* getDataUsers(); */
        getDataUsers2();

      });
    }
  
    //CAMBIAR LA HORA A LA QUE SE EJECUTARA '01:30:00'
    let uniqueHourCronJob = ["06:38:00"]; //Cronjob inicial 
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