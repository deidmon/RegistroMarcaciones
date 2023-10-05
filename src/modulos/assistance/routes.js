const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const seguridad = require('./security');
const router = express.Router();

router.post('/marking',/* seguridad(), */ addMarking);
router.post('/update',seguridad(), update);

async function addMarking(req, res, next){
    try{
        const resultValidation  = await controller.addMarking(req.body);
        /* response.success(req, res, resultadoValidacion,201); */
        if(!resultValidation.messages){
            response.success(req, res, resultValidation,"",200)
        }else{
            response.error(req, res,false,resultValidation.messages, 200)
        }
    }catch(err){
        next(err);
    }
}; 

async function update(req, res, next){
    try{
        const updateMark  = await controller.update(req.body);
        if (updateMark) {
            console.log(updateMark)
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