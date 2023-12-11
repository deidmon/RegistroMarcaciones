const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const tableUser = 'usuarios';
const tableAssist = 'asistencias';
const tableAddress = 'direcciones';
const tableTypeMarking = 'tipomarcaciones'
const tabletypeValidation = 'validacion';
const tabletypeJustifications = 'justificaciones';
const tableTokenUser = 'tokennotificaciones';
const tableStateUser = 'estados'
const tableModalityWork = 'modalidadtrabajo' 
const tableRol = 'rol'
const bcrypt = require('bcrypt');

module.exports = function (dbInjected) {

    let db = dbInjected;
    message = ""
    if (!db) {
        db = require('../../DB/mysql');
    }
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
    }

    function userInformation(id) {
        return db.userInformation(tableUser, tableAddress, id);
    }

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
    }

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
    }

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
        const dataDay = await db.queryMarkDay(tableAssist, tableTypeMarking, tabletypeValidation, tabletypeJustifications, idUser, date);
        if (!dataDay) {
            message = 'No se encuentran asistencias para esta fecha.'
            return { "messages": message }
        } else {
            return dataDay;
        }
    }

    function allWorkers(body) {
        function obtenerDatosPaginados(numeroPagina, tamanoPagina) {
            return  offset = (numeroPagina - 1) * tamanoPagina
          }
        PageSiize = 10;

        const getOffset = obtenerDatosPaginados(body.page, PageSiize);
        return db.queryAllWorkers(tableUser, tableStateUser, tableModalityWork, tableRol, body.name, body.IdEstateWorkerA ?? 0, body.IdEstateWorkerI ?? 1, PageSiize, getOffset);
    }

    async function getWorkersCounter(body) {
        const result = await  db.queryGetWorkersCounter(tableUser, body.name, body.IdEstateWorkerA ?? 0, body.IdEstateWorkerI ?? 1);  
        if (result && result.length >= 0) {
            const count = result[0];
            const contador= count.totalRegistros // Si TotalRegistros está definido, utiliza ese valor, de lo contrario, usa 0
            return contador; 
         } else {
            return 'No se pudo obtener el recuento.';
        }
    };

    async function addUser(body) {
        let user = body.user || '';
        let password = body.contraseña || '';

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
            IdDirec: body.idAdrres,
            IdDirecSecu: body.idSecondaryAddress,
            IdModalidad: body.idModality,
            CIP: body.cip,
            DNI: body.dni
        }
        if (body.idUser === 0) {
            const respuesta = await db.add(tableUser, usuario);
            return respuesta;
        } else if (body.idUser !== 0) {
            const respuesta = await db.update(tableUser, usuario);
            return respuesta;
        } else {
            /* throw new Error('El valor de TConsulta no es válido'); */
            message = 'El valor de TConsulta no es válido'
            return { "messages": message }
        }
    }

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
        addTokensUser
    }
}
