const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const seguridad = require('./security');
const router = express.Router();

router.post('/marking',/* seguridad(), */ addMarking);
router.post('/update',seguridad(), update);

async function addMarking(req, res, next){
    try{
        const resultadoValidacion  = await controller.addMarking(req.body);
        response.success(req, res, resultadoValidacion,201);
    }catch(err){
        next(err);
    }
}; 

async function update(req, res, next){
    try{
        const actualizacion  = await controller.update(req.body);
        if (actualizacion) {
            console.log(actualizacion)
            mensaje = 'Marcación actualizada con éxito';
            response.success(req, res, mensaje, 201);
        } else {
            mensaje = 'Marcación no actualizada';
            response.error(req, res, mensaje, 400);
        } 
    }catch(err){
        next(err);
    }
}; 

module.exports = router;   