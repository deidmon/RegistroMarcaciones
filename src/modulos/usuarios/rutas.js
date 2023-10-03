const express = require('express');
const seguridad = require('./seguridad');
const respuesta = require('../../red/respuesta');
const controlador = require('./index');
const { actualizar } = require('../../DB/mysql');

const router = express.Router();
router.get('/tiposmarcacion', todosTipoMarcacion);
router.get('/TiposValidacion',TiposValidacion);
router.get('/', seguridad(),consultarUser);
router.get('/marcacionMes', seguridad(),consultarMarcasMes); 
router.get('/marcacionSemana', seguridad(),consultarMarcasSemana); 
router.post('/actualizar', agregar);
router.get('/marcacionDia', seguridad(),consultarMarcasDia);

async function consultarUser(req, res, next) {
    try{
        const user = await controlador.consultarUser(req.body.Usuario, req.body.Contraseña);
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultarMarcasMes(req, res, next) {
    try{
        const user = await controlador.consultarMarcasMes(req.body.idUsuario);
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}
async function consultarMarcasSemana(req, res, next) {
    try{
        const user = await controlador.consultarMarcasSemana(req.body.idUsuario);
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultarMarcasDia(req, res, next) {
    try{
        const user = await controlador.consultarMarcasDia(req.body.idUsuario);
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function agregar(req, res, next){
    try{
        const items = await controlador.agregar(req.body);
       if(req.body.IdUsuario == 0){
            mensaje = 'Item guardado con exito';
       }else{
            mensaje = 'Item actualizado con exito';
       }
       respuesta.success(req, res, mensaje,201);
    }catch(err){
        next(err);
    }
}; 

async function todosTipoMarcacion(req, res, next) {
    try{
        const user = await controlador.todosTipoMarcacion();
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function TiposValidacion(req, res, next) {
    try{
        const user = await controlador.TiposValidacion();
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}
module.exports = router;   