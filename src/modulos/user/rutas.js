const express = require('express');
const seguridad = require('./seguridad');
const response = require('../../red/response');
const controlador = require('./index');
// const { actualizar } = require('../../DB/mysql');

const router = express.Router();
router.get('/typesMarking', todosTipoMarcacion);
router.get('/typesValidation',TiposValidacion);
router.get('/information', seguridad(),consultarUser);
router.get('/markingMonth', seguridad(),consultarMarcasMes); 
router.get('/markingWeek', seguridad(),consultarMarcasSemana); 
router.get('/markingDay', seguridad(),consultarMarcasDia);
router.post('/update', agregar);

async function consultarUser(req, res, next) {
    try{
        const user = await controlador.consultarUser(req.body.username, req.body.password);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultarMarcasMes(req, res, next) {
    try{
        const user = await controlador.consultarMarcasMes(req.body.idUser);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}
async function consultarMarcasSemana(req, res, next) {
    try{
        const user = await controlador.consultarMarcasSemana(req.body.idUser);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultarMarcasDia(req, res, next) {
    try{
        const user = await controlador.consultarMarcasDia(req.body.idUser);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function agregar(req, res, next){
    try{
        const items = await controlador.agregar(req.body);
       if(req.body.idUser == 0){
            mensaje = 'Item guardado con exito';
       }else{
            mensaje = 'Item actualizado con exito';
       }
       response.success(req, res, mensaje,201);
    }catch(err){
        next(err);
    }
}; 

async function todosTipoMarcacion(req, res, next) {
    try{
        const user = await controlador.todosTipoMarcacion();
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function TiposValidacion(req, res, next) {
    try{
        const user = await controlador.TiposValidacion();
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}
module.exports = router;   