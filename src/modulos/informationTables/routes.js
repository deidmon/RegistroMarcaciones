const express = require('express');
const response = require('../../red/response');

const controller = require('./index');

const router = express.Router();

router.get('/typesMarking', allTypeMarking);
router.get('/typesValidation',allTypeValidation);

errorMessage = "Algo salio mal, intente más tarde."

async function allTypeMarking(req, res, next) {
    try{
        const user = await controller.allTypeMarking();
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        /* next(err); */
        response.error(req, res, false, errorMessage, 500);
    }
};

async function allTypeValidation(req, res, next) {
    try{
        const user = await controller.allTypeValidation();
        response.success(req, res, user, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

module.exports = router;   