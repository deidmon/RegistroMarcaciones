const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const seguridad = require('./security');
const router = express.Router();
const constant = require("../../helpers/constants");

router.post('/marking',/* seguridad(), */ addMarking);
router.post('/update',seguridad(), update);
router.post('/addMarkingVirtual',/* seguridad(), */ addMarkingVirtual);

async function addMarking(req, res, next){
    try{
        const resultValidation  = await controller.addMarking(req.body);
        if(!resultValidation.messages){
            response.success(req, res, resultValidation, "", 200);
        }else{
            response.error(req, res, false, resultValidation.messages, 200);
        }
    }catch(err){
        response.error(req, res, false, constant.errorMessageAsistance, 500);
    }
}; 

async function update(req, res, next){
    try{
        const updateMark  = await controller.update(req.body);
        if (updateMark) {
            
            mensaje = 'Marcación actualizada con éxito';
            response.success(req, res, mensaje, 201);
        } else {
            mensaje = 'Marcación no actualizada';
            response.error(req, res, mensaje, 400);
        } 
    }catch(err){
        /* next(err); */
        response.error(req, res,false,  constant.errorMessageAsistance, 500);
    }
};

async function addMarkingVirtual(req, res, next){
    try{
        const resultValidation  = await controller.addMarkingVirtual(req.body);
        if(!resultValidation.messages){
            response.success(req, res, resultValidation, "", 200);
        }else{
            response.error(req, res, false, resultValidation.messages, 200);
        }
    }catch(err){
        response.error(req, res, false, constant.errorMessageAsistance, 500);
    }
};

module.exports = router;   