const TABLA = 'usuarios';
const TABLAMARCA = 'asistencias';
const bcrypt =require ('bcrypt');
const { query } = require('express');
const { queryMarca } = require('../../DB/mysql');

module.exports = function(dbInyectada){

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    async function consultarUser(usuario, password){
        if (!usuario || !password) {
            throw new Error("Datos faltantes");
          }
        const data = await db.query(TABLA, {Usuario: usuario});
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
/*     async function consultarMarcas(usuario, password){
        if (!usuario) {
            throw new Error("Datos faltantes");
        }
        const data = await db.query(TABLA, {Usuario: usuario});
        if (!data) {
            throw new Error("Usuario incorrecto");
        }
        const id = data.IdUsuarios;

        return bcrypt.compare(password, data.Contraseña)
        .then(resultado =>{
            if(resultado == true){
                
                return queryMarca(TABLAMARCA, {IdUsuarios: id})
            }else{
                throw new Error("Credenciales inválidas");
            }
        })
    } */
    async function consultarMarcas(IdRol, idUsuario){
        if (!IdRol) {
            throw new Error("Datos incorrectos");
        }
        const data = await db.queryMarca(TABLAMARCA, {idUsuarios: idUsuario});
        if (!data) {
            throw new Error("Usuario incorrecto");
        } else{
            return data;
        }
        
    }
    function todos(){
        return db.todos(TABLA);
    }
    function uno(id){
        return db.uno(TABLA, id);
    }
    function infoUno(id){
        return db.infoUno(TABLA, id);
    }
    async function agregar(body){
        /* if(body.TConsulta == 0){
            
       }else{
            
       } */
        let user = body.usuario || '';
        let password = body.contraseña || '';

        if(body.contraseña){
            password = await bcrypt.hash(body.contraseña.toString(), 5) 
       }
        const usuario = {
            IdUsuarios:body.IdUsuario,
            Nombres: body.nombre,
            Apellidos: body.apellidos,
            Activo: body.activo,
            Usuario:user ,
            Contraseña:password,
            IdRol: body.IdRol,
        }  
        if (body.IdUsuario === 0) {
            // Agregar un nuevo registro
            const respuesta = await db.agregar(TABLA, usuario);
            return respuesta;
        } else if (body.IdUsuario !== 0) {
            // Modificar un registro existente
            /* const condicion = {
                IdUsuarios: body.id, // Debes especificar la condición para identificar el registro que deseas modificar
            }
            const respuesta = await db.actualizar(TABLA, usuario, condicion); */
            const respuesta = await db.actualizar(TABLA, usuario);
            return respuesta;
        } else {
            // Manejar un valor inesperado de TConsulta
            throw new Error('El valor de TConsulta no es válido');}
        
        

    }
    
    function eliminar(body){
        return db.eliminar(TABLA, body);
    }
    return {
        todos,
        uno,
        agregar,
        eliminar,
        infoUno,
        consultarUser,
        consultarMarcas
    }
}
