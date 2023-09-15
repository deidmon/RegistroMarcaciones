const express = require('express');
const seguridad = require('./seguridad');
const respuesta = require('../../red/respuesta');
const controlador = require('./index');
const { actualizar } = require('../../DB/mysql');

const router = express.Router();
router.get('/tiposmarcacion', todosTipoMarcacion);
router.get('/', seguridad(),consultarUser);
router.get('/marcacion', seguridad(),consultarMarcas); 
router.post('/actualizar', agregar);

async function consultarUser(req, res, next) {
    try{
        const user = await controlador.consultarUser(req.body.Usuario, req.body.Contraseña);
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultarMarcas(req, res, next) {
    try{
        const user = await controlador.consultarMarcas(req.body.idUsuario);
        respuesta.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function agregar(req, res, next){
    try{
        //const items = await controlador.agregar(req.body);
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
module.exports = router;   