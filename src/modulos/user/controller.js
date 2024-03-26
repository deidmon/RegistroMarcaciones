const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const helpers = require("../../helpers/helpers");
const constant = require("../../helpers/constants");

const tableUser = 'usuarios';
const tableAssist = 'asistencias';
const tableAddress = 'direcciones';
const tableTypeMarking = 'tipomarcaciones'
const tabletypeValidation = 'validacion';
const tableTokenUser = 'tokennotificaciones';
const tableStateUser = 'estados'
const tableModalityWork = 'modalidadtrabajo' 
const tableRol = 'rol'
const tablePermissions = 'solicitudes';
const bcrypt = require('bcrypt');
const PageSiize = constant.pageSize;


module.exports = function (dbInjected) {

    let db = dbInjected;
    message = ""
    if (!db) {
        db = require('../../DB/mysql');
    }

    /* 📌 Autenticación */
    async function consultUser(user, password) {
        if (!user || !password) {
            message = 'Datos faltantes'
            return { "messages": message }
            /* throw new Error("Datos faltantes"); */
        }
        const data = await db.query(tableUser, { Usuario: user });
        if (!data) {
            /* throw new Error("Credenciales inválidas"); */
            message = 'Credenciales inválidas'
            return { "messages": message }
        }
        const id = data.IdUsuarios;

        return bcrypt.compare(password, data.Contraseña)
            .then(resultado => {
                if (resultado == true) {
                    return userInformation(id)
                } else {
                    /* throw new Error("Credenciales inválidas"); */
                    message = 'Credenciales inválidas'
                    return { "messages": message }
                }
            })
    };

    /* 📌 Obtener información de un usuario*/
    function userInformation(id) {
        return db.userInformation(tableUser, tableAddress, id);
    };

    /* 📌 Obtener todas las asitencias del mes del trabajador*/
    async function consultMarkMonth(idUser, date) {
        if (!idUser) {
            message = 'Ingrese usuario'
            return { "messages": message }
        }
        const dataUser = await db.query(tableUser, { IdUsuarios: idUser });
        if (!dataUser) {
            message = 'Usuario incorrecto'
            return { "messages": message }
        }
        const dataMonth = await db.queryMarkMonth(tabletypeValidation, tableAssist, idUser, date, date);
        if (!dataMonth) {
            message = 'No se encuentran asistencias para este mes.'
            return { "messages": message }
        } else {
            return dataMonth;
        }
    };

    /* 📌 Obtener todas las asitencias de la semana del trabajador*/
    async function consultMarkWeek(idUser) {
        if (!idUser) {
            message = 'Ingrese usuario'
            return { "messages": message }
        }
        const dataUser = await db.query(tableUser, { IdUsuarios: idUser });
        if (!dataUser) {
            message = 'Usuario incorrecto'
            return { "messages": message }
        }
        const dataWeek = await db.queryMarkWeek(tableAssist, tabletypeValidation, idUser);
        if (!dataWeek) {
            message = 'Actualmente, no se han registrado asistencias para esta semana.'
            return { "messages": message }
        } else {
            return dataWeek;
        }
    };

    /* 📌 Obtener todas las asitencias del día del trabajador*/
    async function consultMarkDay(idUser, date) {
        if (!idUser) {
            message = 'No viene usuario'
            return { "messages": message }
        }
        const dataUser = await db.query(tableUser, { IdUsuarios: idUser });
        if (!dataUser) {
            message = 'Usuario incorrecto'
            return { "messages": message }
        }
        /* const dataDay = await db.queryMarkDay(tableAssist, tableTypeMarking, tabletypeValidation, tabletypeJustifications, idUser, date); */
        const dataDay = await db.queryMarkDay(tableAssist, tableTypeMarking, tabletypeValidation, tablePermissions, idUser, date);
        if (!dataDay) {
            message = 'No se encuentran asistencias para esta fecha.'
            return { "messages": message }
        } else {
            return dataDay;
        }
    };

    /* 📌 Obtener información de todos los trabajadores*/
    async function allWorkers(body) {
        function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
            return  offset = (numeroPagina - 1) * tamanoPagina
        };
        const getOffset = obtenerDatosPaginados(body.page, PageSiize);

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        let IdRolUser = whatRolHaveWorker[0].IdRol

        if(IdRolUser === 3){
            return db.queryAllWorkers(tableUser, tableStateUser, tableModalityWork, tableRol, body.name, body.CIP, body.DNI, body.IdEstateWorkerA ?? 1, body.IdEstateWorkerI ?? 2, PageSiize, getOffset);
        }

        var getIdsOfWorkers = await db.queryGetIdAsignedToLeader(body.idUser);//Obtener los ids de trabajadores asignados al lider
        var listaDeIds = getIdsOfWorkers.map(function (rowDataPacket) {//Mapear los objetos RowDataPacket y pasarlos a una lista de  los                 
            return rowDataPacket.idUsuario;
        });
        var idWorkersString = listaDeIds.join(', ');//convierte el array en una cadena separada por comas. 
        if (idWorkersString === '') {
            idWorkersString = '0';
        };
        return db.queryAllWorkersByUser(tableUser, tableStateUser, tableModalityWork, tableRol, body.name,body.CIP, body.DNI, body.IdEstateWorkerA ?? 1, body.IdEstateWorkerI ?? 2, PageSiize, getOffset, idWorkersString);
    };

    /* 📌 Obtener información de todos los trabajadores - contador*/
    async function getWorkersCounter(body) {
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        let IdRolUser = whatRolHaveWorker[0].IdRol;
        let result;
        if(IdRolUser === 3){
             result = await  db.queryGetWorkersCounter(tableUser, body.name ?? "", body.CIP, body.DNI, body.IdEstateWorkerA ?? 1, body.IdEstateWorkerI ?? 2); 
        } else {
            var getIdsOfWorkers = await db.queryGetIdAsignedToLeader(body.idUser);//Obtener los ids de trabajadores asignados al lider
            var listaDeIds = getIdsOfWorkers.map(function (rowDataPacket) {//Mapear los objetos RowDataPacket y pasarlos a una lista de  los                 
                return rowDataPacket.idUsuario;
            });
            var idWorkersString = listaDeIds.join(', ');//convierte el array en una cadena separada por comas. 
            if (idWorkersString === '') {
                idWorkersString = '0';
            };
            result = await  db.queryGetWorkersCounterByUser(tableUser, body.name ?? "", body.CIP, body.DNI, body.IdEstateWorkerA ?? 1, body.IdEstateWorkerI ?? 2, idWorkersString);
        }
          
        if (result && result.length >= 0) {
            const count = result[0];
            const contador= count.totalRegistros // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador; 
         } else {
            return 'No se pudo obtener el recuento.';
        }
    };

    /* 📌 Obtener información de todos lideres*/
    async function getLeaders(body) {
        function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
            return  offset = (numeroPagina - 1) * tamanoPagina
        };

        /* console.log("178"); */
        const getOffset = obtenerDatosPaginados(body.page, PageSiize);
        return db.queryGetLeaders(tableUser, tableRol, body.name, body.CIP, body.DNI, body.IdEstateWorkerA ?? 1, body.IdEstateWorkerI ?? 2, PageSiize, getOffset);
    };

    /* 📌 Obtener información de todos lideres - contador*/
    async function getLeadersCounter(body) {
        result = await  db.queryGetLeadersCounter(tableUser, body.name, body.CIP, body.DNI, body.IdEstateWorkerA ?? 1, body.IdEstateWorkerI ?? 2);
        if (result && result.length >= 0) {
            const count = result[0];
            const contador= count.totalRegistros // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador; 
         } else {
            return 'No se pudo obtener el recuento.';
        }
    };
    
    /* 📌 Añadir usuario*/
    async function addUser(body) {
        if(body.idUser != 0){
            const dataUser = await db.query(tableUser, { IdUsuarios: body.idUser });
            if (dataUser.length == 0) {
                message = 'Usuario incorrecto'
                return { "messages": message }
            }
        }
        
        let user = body.user || '';
        let password = body.password || '';

        if (body.password) {
            password = await bcrypt.hash(body.password.toString(), 5)
        }
        const usuario = {
            IdUsuarios: body.idUser,
            Nombres: body.name,
            Apellidos: body.lastName,
            Activo: body.status,
            Usuario: user,
            Contraseña: password,
            IdRol: body.idRole,
            IdDirec: body.idAddress,
            IdDirecSecu: body.idSecondaryAddress,
            IdModalidad: body.idModality,
            CIP: body.cip,
            DNI: body.DNI,
            idHorarios: body.schedule,
            idPerfil: body.idProfile,
            Email : body.email,
            isFisrtLogin : 1
        }
        const updateUser = {
            IdUsuarios: body.idUser,
            Activo: body.status,
            /* Usuario: user, */
            /* Contraseña: password, */
            IdRol: body.idRole,
            IdDirec: body.idAddress,
            IdDirecSecu: body.idSecondaryAddress,
            IdModalidad: body.idModality,
            idHorarios: body.schedule,
            idPerfil: body.idProfile
        }
        
        if (body.idUser !== 0) {
            const respuesta = await db.update(tableUser, updateUser);
            if (respuesta && respuesta.changedRows > 0) {
                return 'Usuario modificado con éxito';
            } else {
                return 'No se modificó el usuario';
            }
        } 
        const respuesta = await db.add(tableUser, usuario);
        if (respuesta && respuesta.affectedRows > 0) {
            return 'Usuario añadido con éxito';
        } else {
            return 'No se añadió el usuario';
        }

        
    };

    /* 📌 Para añadir el token del celular del usuario para las notificiones */
    async function addTokensUser(body) {
        if (!body.idUser) {
            message = 'Por favor, ingrese un usuario';
            return { "messages": message }
        }
        const dataUser = await db.query(tableUser, { IdUsuarios: body.idUser });
        if (!dataUser) {
            message = 'Usuario incorrecto';
            return { "messages": message }
        };
        const tokenUser = {
            IdUsuarios: body.idUser,
            Token: body.token,
        };
        const respuesta = await db.add(tableTokenUser, tokenUser);
        //message = 'Token registrado con éxito';
        return 'Token registrado con éxito';
        // return respuesta;
    };

    /* 📌 Cantidad de trabajadores*/
    async function getAllWorkersAmount (body) {
        const result = await  db.queryGetJustificationsCounterPending(tableJustifications, body.IdEstadoJustP);  
        if (result && result.length >= 0) {
            const count = result[0];
            const contador = count.totalRegistrosPendientes // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador;
         } else {
            return 0;
        }
    };

    /* 📌 Para activar usuarios*/
    async function activateUsers(body) {
        if (body.idProfile != 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }

        const respuesta = await db.queryActivateUsers(tableUser, body.status, body.idUsers);
        if (respuesta && respuesta.changedRows > 0) {
            return 'Modificación de estado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };

    /* 📌 Actualizar informacion de usuarios*/
    async function updateRolOfWorkers(body){
        const toUpdate = {
            IdRol: body.idRol
        };

        const idWhere = {
            IdUsuarios: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };
        const response = await db.queryUpdateAnyTable(tableUser, toUpdate, idWhere);
        if (response && response.changedRows > 0) {
            return 'Modificación de estado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };

    /* 📌 Actualizar contraseña */
    async function updatePasswordOfUser(body) {
        // Expresiones regulares para validar si la contraseña contiene al menos un número, un carácter y una mayúscula
        const hasNumber = /\d/.test(body.password);
        const hasCharacter = /[a-zA-Z]/.test(body.password);
        const hasUppercase = /[A-Z]/.test(body.password);

        if (!hasNumber || !hasCharacter || !hasUppercase) {
            return { "messages": "La contraseña debe contener al menos un número, un carácter y una mayúscula" };
        }
        
        if(body.password.length < constant.minimumPasswordCharacters){
            return { "messages": `La  contraseña debe tener como minimo ${constant.minimumPasswordCharacters} caracteres` }
        }
        
        let password = body.password;

        if (body.password) {
            password = await bcrypt.hash(body.password.toString(), 5)
        }
        const toUpdate = {
            IdUsuarios: body.idUser,
            Contraseña: password
        };
        const responseInfo = await db.update(tableUser, toUpdate);
        if (responseInfo && responseInfo.changedRows > 0) {
            return 'Contraseña modificada con éxito';
        } else {
            return 'Contraseña modificada con éxito';
        }
    };

    /* 📌 Enviar código de verificación */
    async function sendCodeVerfication(body){

        let initialDate = moment();
        const dateTimeNowMoreOne = await helpers.getDateTimeMoreOne(initialDate);

        const response = await db.queryFindEmailAndSendCode(body.email);
        if(!response || response.length === 0){
            return { "messages": `Correo no encontrado` } 
        }

        let code_user = '';
        for(let i = 0; i <=5; i++){
            let character = Math.ceil(Math.random() * 9)
            code_user += character;
        }
        
        const data = {
            id_user: response[0].IdUsuarios,
            code: code_user,
            state: 1,
            time_exp: dateTimeNowMoreOne,
        }
        //primero consultar la tabla code_user para actualizar o registrar uno nuevo
        const whereVerified = {
            id_user: response[0].IdUsuarios
        }
        const verifiExistRegister = await db.queryGetWhere(constant.tableCodeUser, whereVerified);
        
        if(verifiExistRegister && verifiExistRegister.length > 0) {
            //Actualizamos
            const toUpdate = {
                code: code_user,
                state: 1,
                time_exp: dateTimeNowMoreOne,
            }

            const whereUpdate = {
                id_user: response[0].IdUsuarios
            }
            await db.queryUpdateAnyTable(constant.tableCodeUser, toUpdate, whereUpdate );
        }else{
            await db.addNewRegisterGeneric(constant.tableCodeUser, data);//sino añadimos
        }   

        const responseEmail = await helpers.sendCodeVerificationOutlook(response[0].Email, code_user);//Envia el correo con el código

        if (!responseEmail){
            return { "messages": `No se pudo enviar el código de verificación`} 
        }
        return `${response[0].IdUsuarios}`;
    }

    /* 📌 Verificación de código */
    async function verificationOfCode(body){
        const fechaActual = new Date();
        fechaActual.setHours(fechaActual.getHours() - 5);//le restamos 5 horas porque lo crea con 5 horas de adelanto
        let response = await db.queryVerificationOfCode(body.code, body.id_user);

        if(response  && response.length > 0){

            if(response[0].state == constant.stateActive &&  fechaActual <= response[0].time_exp){
                const toUpdate = {
                    state: constant.stateInactive,
                }
                const whereToUpdate = {
                    id_user: body.id_user
                }
                await db.queryUpdateAnyTable(constant.tableCodeUser, toUpdate, whereToUpdate);
                return 'Código verificado con éxito';
            }else{
                return { "messages": `Código ya no esta disponible`} 
            }   
        }
        return { "messages": `Código no valido`} 
    }
    
    return {
        allWorkers,
        getWorkersCounter,
        userInformation,
        consultUser,
        consultMarkMonth,
        consultMarkWeek,
        consultMarkDay,
        addUser,
        addTokensUser,
        getAllWorkersAmount,
        activateUsers,
        getLeaders,
        getLeadersCounter,
        updateRolOfWorkers,
        updatePasswordOfUser,
        sendCodeVerfication,
        verificationOfCode,
    }
}
