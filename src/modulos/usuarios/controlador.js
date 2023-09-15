const TABLA = 'usuarios';
const tipomarcacion='tipomarcaciones';
const TABLAMARCA = 'asistencias';
const TABLAVALIDACION = 'validacion';
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

    async function consultarMarcas(idUsuario){
        if (!idUsuario) {
            throw new Error("Ingrese usuario");
        }
        const data = await db.queryMarca(TABLAMARCA,TABLAVALIDACION, idUsuario);
        if (!data) {
            throw new Error("Usuario incorrecto");
        } else{
            return data;
        }
        
    }

    async function todosTipoMarcacion(){
        return db.todos(tipomarcacion);
    }

    function infoUno(id){
        return db.infoUno(TABLA, id);
    }

    async function agregar(body){
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
            const respuesta = await db.actualizar(TABLA, usuario);
            return respuesta;
        } else {
            // Manejar un valor inesperado
            throw new Error('El valor de TConsulta no es válido');}
        
        

    }
    
    return {
        agregar,
        infoUno,
        consultarUser,
        consultarMarcas,
        todosTipoMarcacion
    }
}
