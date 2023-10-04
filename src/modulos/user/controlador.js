const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const TABLA = 'usuarios';
const tipomarcacion='tipomarcaciones';
const TABLAMARCA = 'asistencias';
const TABLAVALIDACION = 'validacion';
const TABLADIRECCIONES ='direcciones';
const bcrypt =require ('bcrypt');
const { query } = require('express');
const { queryMarca } = require('../../DB/mysql');

module.exports = function(dbInyectada){

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    let fechaInicial =  moment();
    let dia = fechaInicial.format('DD'); // Agrega ceros a la izquierda si es necesario
    let mes = fechaInicial.format('MM'); // Agrega ceros a la izquierda si es necesario
    let año = fechaInicial.format('YYYY');

    let fecha = `${año}-${mes}-${dia}`; 
    async function consultarMarcasDia(IdUsuarios){
        if (!IdUsuarios) {
            throw new Error("No viene usuario");
        }
        const data = await db.consultarMarcasDia(TABLAMARCA,tipomarcacion,TABLAVALIDACION, IdUsuarios, fecha);
        if (!data) {
            throw new Error("No existe marcaciones para este usuario");
        } else{
            return data;
        }
        
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

    async function consultarMarcasMes(idUsuario){
        if (!idUsuario) {
            throw new Error("Ingrese usuario");
        }
        const dataMes = await db.queryMarcaMes(TABLAMARCA,TABLAVALIDACION, idUsuario);
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
        const dataSemana = await db.queryMarca(TABLAMARCA,TABLAVALIDACION, idUsuario);
        if (!dataSemana) {
            throw new Error("Usuario incorrecto");
        } else{
            return dataSemana;
        }
        
    }

    async function todosTipoMarcacion(){
        return db.todosTipoMarcacion(tipomarcacion);
    }

    async function TiposValidacion(){
        return db.todosTipoValidacion(TABLAVALIDACION);
    }
    function todos(){
        return db.todos(TABLA);
    }

    function infoUno(id){
        return db.infoUno(TABLA,TABLADIRECCIONES, id);
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
            IdDirec: body.IdDirec,	
            IdDirecSecu:body.IdDirecSecu	
        }  
        if (body.IdUsuario === 0) {
            const respuesta = await db.agregar(TABLA, usuario);
            return respuesta;
        } else if (body.IdUsuario !== 0) {
            const respuesta = await db.actualizar(TABLA, usuario);
            return respuesta;
        } else {
            
            throw new Error('El valor de TConsulta no es válido');}
        
        

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
