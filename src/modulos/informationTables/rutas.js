const express = require('express');
const respuesta = require('../../red/response');

const controlador = require('./index');
const seguridad = require('./seguridad');

const router = express.Router();

router.post('/marking',/* seguridad(), */ agregar);
router.post('/actualizar',seguridad(), actualizar);

async function agregar(req, res, next){
    try{
        const resultadoValidacion  = await controlador.agregar(req.body);
        respuesta.success(req, res, resultadoValidacion,201);
    }catch(err){
        next(err);
    }
}; 
async function actualizar(req, res, next){
    try{
        const actualizacion  = await controlador.actualizar(req.body);
        if (actualizacion) {
            console.log(actualizacion)
            mensaje = 'Marcación actualizada con éxito';
            respuesta.success(req, res, mensaje, 201);
        } else {
            mensaje = 'Marcación no actualizada';
            respuesta.error(req, res, mensaje, 400);

            // Cambia el código de estado según corresponda
        }
       
    }catch(err){
        next(err);
    }
}; 


module.exports = router;   