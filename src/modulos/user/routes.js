const express = require('express');
const security = require('./security');
const response = require('../../red/response');
const controller = require('./index');

const router = express.Router();

router.get('/information', security(),consultUser);
router.get('/markingMonth', security(),consultMarkMonth); 
router.get('/markingWeek', security(),consultMarkWeek); 
router.get('/markingDay', security(),consultMarkDay);
router.post('/update', addUser);

async function consultUser(req, res, next) {
    try{
        const user = await controller.consultUser(req.body.username, req.body.password);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultMarkMonth(req, res, next) {
    try{
        const user = await controller.consultMarkMonth(req.body.idUser);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}
async function consultMarkWeek(req, res, next) {
    try{
        const user = await controller.consultMarkWeek(req.body.idUser);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function consultMarkDay(req, res, next) {
    try{
        const user = await controller.consultMarkDay(req.body.idUser);
        response.success(req, res, user, 200);
    }catch(err){
        next(err);
    }
}

async function addUser(req, res, next){
    try{
        const items = await controller.addUser(req.body);
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

module.exports = router;   