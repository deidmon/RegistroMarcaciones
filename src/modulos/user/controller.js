const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const tableUser = 'usuarios';
const typeMarkingUser='tipomarcaciones'; 
const tableAssist = 'asistencias'; 
const typeTableValidation = 'validacion'; 
const tableAddress ='direcciones'; 
const bcrypt = require ('bcrypt');
// const { query } = require('express');
// const { queryMarca } = require('../../DB/mysql');

module.exports = function(dbInjected){

    let db = dbInjected;

    if(!db){
        db = require('../../DB/mysql');
    }

    let initialDate =  moment();initialDate
    let day = initialDate.format('DD'); // Agrega ceros a la izquierda si es necesario
    let month = initialDate.format('MM'); // Agrega ceros a la izquierda si es necesario
    let age = initialDate.format('YYYY');
    let date = `${age}-${month}-${day}`; 

    async function consultarUser(usuario, password){
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
                return infoUno(id)
            }else{
                throw new Error("Credenciales inválidas");
            }
        })
    }

    function infoUno(id){
        return db.userInformation(tableUser,tableAddress, id);
    }

    async function consultarMarcasMes(idUsuario){
        if (!idUsuario) {
            throw new Error("Ingrese usuario");
        }
        const dataMes = await db.queryMarkMonth(tableAssist,typeTableValidation, idUsuario);
        if (!dataMes) {
            throw new Error("Usuario incorrecto");
        } else{
            return dataMes;
        }  
    }

    async function consultarMarcasSemana(idUsuario){
        if (!idUsuario) {
            throw new Error("Ingrese usuario");
        }
        const dataSemana = await db.queryMarkWeek(tableAssist,typeTableValidation, idUsuario);
        if (!dataSemana) {
            throw new Error("Usuario incorrecto");
        } else{
            return dataSemana;
        }
    }

    async function consultarMarcasDia(IdUser){
        if (!IdUser) {
            throw new Error("No viene usuario");
        }
        const data = await db.queryMarkDay(tableAssist,typeMarkingUser,typeTableValidation, IdUser, date);
        if (!data) {
            throw new Error("No existe marcaciones para este usuario");
        } else{
            return data;
        }
    }

    async function todosTipoMarcacion(){
        return db.allTypeMarking(typeMarkingUser);
    }

    async function TiposValidacion(){
        return db.allTypeValidation(typeTableValidation);
    }
    function todos(){
        return db.todos(tableUser);
    }

    async function agregar(body){
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
            const respuesta = await db.agregar(tableUser, usuario);
            return respuesta;
        } else if (body.idUser !== 0) {
            const respuesta = await db.actualizar(tableUser, usuario);
            return respuesta;
        } else{
            throw new Error('El valor de TConsulta no es válido');
        }
    }
    
    return {
        agregar,
        infoUno,
        consultarUser,
        consultarMarcasMes,
        consultarMarcasSemana,
        consultarMarcasDia,
        todosTipoMarcacion,
        TiposValidacion
    }
}
