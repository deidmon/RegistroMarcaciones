const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const tableUser = 'usuarios';
const tableAssist = 'asistencias'; 
const tableAddress ='direcciones';
const tableTypeMarking = 'tipomarcaciones'
const tabletypeValidation = 'validacion';
const bcrypt = require ('bcrypt');
// const { query } = require('express');
// const { queryMarca } = require('../../DB/mysql');

module.exports = function(dbInjected){

    let db = dbInjected;
    message = ""
    if(!db){
        db = require('../../DB/mysql');
    }

    let initialDate =  moment();
    let day = initialDate.format('DD'); // Agrega ceros a la izquierda si es necesario
    let month = initialDate.format('MM'); // Agrega ceros a la izquierda si es necesario
    let age = initialDate.format('YYYY');
    let date = `${age}-${month}-${day}`; 

    async function consultUser(user, password){
        if (!user || !password) {
            message ='Datos faltantes'
            return {"messages": message}
            /* throw new Error("Datos faltantes"); */
        }
        const data = await db.query(tableUser, {Usuario: user});
        if (!data) {
            /* throw new Error("Credenciales inválidas"); */
            message ='Credenciales inválidas'
            return {"messages": message}
        }
        const id = data.IdUsuarios;

        return bcrypt.compare(password, data.Contraseña)
        .then(resultado =>{
            if(resultado == true){
                return userInformation(id)
            }else{
                /* throw new Error("Credenciales inválidas"); */
                message ='Credenciales inválidas'
                return {"messages": message}
            }
        })
    }

    function userInformation(id){
        return db.userInformation(tableUser,tableAddress, id);
    }

    async function consultMarkMonth(idUser){
        if (!idUser) {
            /* throw new Error("Ingrese usuario"); */
            message ='Ingrese usuario'
            return {"messages": message}
        }
        const dataUser = await db.query(tableUser, {IdUsuarios: idUser});
        if (!dataUser) {
            message ='Usuario incorrecto'
            return {"messages": message}
        }
        const dataMonth = await db.queryMarkMonth(tableAssist,tabletypeValidation, idUser);
        if (!dataMonth) {
            /* throw new Error("Usuario incorrecto"); */
            /* message ='Usuario incorrecto' */
            return {"messages": 'No existe marcaciones para este usuario'}
        } else{
            return dataMonth;
        }  
    }

    async function consultMarkWeek(idUser){
        if (!idUser) {
            /* throw new Error("Ingrese usuario"); */
            message ='Ingrese usuario'
            return {"messages": message}
        }
        const dataUser = await db.query(tableUser, {IdUsuarios: idUser});
        if (!dataUser) {
            message ='Usuario incorrecto'
            return {"messages": message}
        }
        const dataWeek = await db.queryMarkWeek(tableAssist,tabletypeValidation, idUser);
        if (!dataWeek) {
            /* throw new Error("Usuario incorrecto"); */
            message ='No existe marcaciones para este usuario'
            return {"messages": message}
        } else{
            return dataWeek;
        }
    }

    async function consultMarkDay(idUser){
        if (!idUser) {
            /* throw new Error("No viene usuario"); */
            message ='No viene usuario'
            return {"messages": message}
        }
        const dataUser = await db.query(tableUser, {IdUsuarios: idUser});
        if (!dataUser) {
            message ='Usuario incorrecto'
            return {"messages": message}
        }
        const dataDay = await db.queryMarkDay(tableAssist,tableTypeMarking,tabletypeValidation, idUser, date);
        if (!dataDay) {
            /* throw new Error("No existe marcaciones para este usuario"); */
            message ='No existe marcaciones para este usuario' 
            return {"messages": message}
        } else{
            return dataDay;
        }
    }

    function allUsers(){
        return db.allUsers(tableUser);
    }

    async function addUser(body){
        let user = body.user || '';
        let password = body.contraseña || '';

        if(body.password){
            password = await bcrypt.hash(body.password.toString(), 5) 
        }
        const usuario = {
            IdUsuarios: body.idUser,
            Nombres: body.name,
            Apellidos: body.lastName,
            Activo: body.status,
            Usuario: user ,
            Contraseña: password,
            IdRol: body.idRole,
            IdDirec: body.idAdrres,	
            IdDirecSecu: body.idSecondaryAddress	
        }  
        if (body.idUser === 0) {
            const respuesta = await db.add(tableUser, usuario);
            return respuesta;
        } else if (body.idUser !== 0) {
            const respuesta = await db.update(tableUser, usuario);
            return respuesta;
        } else{
            /* throw new Error('El valor de TConsulta no es válido'); */
            message ='El valor de TConsulta no es válido'
            return {"messages": message}
        }
    }
    
    return {
        allUsers,
        addUser,
        userInformation,
        consultUser,
        consultMarkMonth,
        consultMarkWeek,
        consultMarkDay,
    }
}
