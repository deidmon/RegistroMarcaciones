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

    if(!db){
        db = require('../../DB/mysql');
    }

    let initialDate =  moment();
    let day = initialDate.format('DD'); // Agrega ceros a la izquierda si es necesario
    let month = initialDate.format('MM'); // Agrega ceros a la izquierda si es necesario
    let age = initialDate.format('YYYY');
    let date = `${age}-${month}-${day}`; 

    async function consultUser(usuario, password){
        if (!usuario || !password) {
            throw new Error("Datos faltantes");
        }
        const data = await db.query(tableUser, {Usuario: usuario});
        if (!data) {
            throw new Error("Credenciales inválidas");
        }
        const id = data.IdUsuarios;

        return bcrypt.compare(password, data.Contraseña)
        .then(resultado =>{
            if(resultado == true){
                return userInformation(id)
            }else{
                throw new Error("Credenciales inválidas");
            }
        })
    }

    function userInformation(id){
        return db.userInformation(tableUser,tableAddress, id);
    }

    async function consultMarkMonth(idUsuario){
        if (!idUsuario) {
            throw new Error("Ingrese usuario");
        }
        const dataMes = await db.queryMarkMonth(tableAssist,tabletypeValidation, idUsuario);
        if (!dataMes) {
            throw new Error("Usuario incorrecto");
        } else{
            return dataMes;
        }  
    }

    async function consultMarkWeek(idUsuario){
        if (!idUsuario) {
            throw new Error("Ingrese usuario");
        }
        const dataSemana = await db.queryMarkWeek(tableAssist,tabletypeValidation, idUsuario);
        if (!dataSemana) {
            throw new Error("Usuario incorrecto");
        } else{
            return dataSemana;
        }
    }

    async function consultMarkDay(IdUser){
        if (!IdUser) {
            throw new Error("No viene usuario");
        }
        const data = await db.queryMarkDay(tableAssist,tableTypeMarking,tabletypeValidation, IdUser, date);
        if (!data) {
            throw new Error("No existe marcaciones para este usuario");
        } else{
            return data;
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
            const respuesta = await db.actualizar(tableUser, usuario);
            return respuesta;
        } else{
            throw new Error('El valor de TConsulta no es válido');
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
