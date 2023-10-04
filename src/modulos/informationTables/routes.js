const express = require('express');
const response = require('../../red/response');

const controller = require('./index');

const router = express.Router();

router.get('/typesMarking', allTypeMarking);
router.get('/typesValidation',allTypeValidation);

async function allTypeMarking(req, res, next) {
    try{
        const user = await controller.allTypeMarking();
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function allTypeValidation(req, res, next) {
    try{
        const user = await controller.allTypeValidation();
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

module.exports = router;   