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

errorMessage = "Algo salio mal, intente más tarde."
async function consultUser(req, res, next) {
    try{
        const user = await controller.consultUser(req.body.username, req.body.password);
        if(!user.messages){
            response.success(req, res, user,"",200)
        }else{
            response.error(req, res,false,user.messages, 200)
        }
    }catch(err){
        /* next(err); */
         response.error(req, res,false,errorMessage, 500) 
    }
}

async function consultMarkMonth(req, res, next) {
    try{
        const userMon = await controller.consultMarkMonth(req.body.idUser);
        if(!userMon.messages){
            response.success(req, res, userMon,"",200)
        }else{
            response.error(req, res,false,userMon.messages, 201)
        }
    }catch(err){
        /* next(err); */
        response.error(req, res,false,errorMessage, 500) 
    }
}
async function consultMarkWeek(req, res, next) {
    try{
        const userWeek = await controller.consultMarkWeek(req.body.idUser);
        if(!userWeek.messages){
            response.success(req, res, userWeek,"",200)
        }else{
            response.error(req, res,false,userWeek.messages, 200)
        }
    }catch(err){
        /* next(err); */
        response.error(req, res,false,errorMessage, 500) 
    }
}

async function consultMarkDay(req, res, next) {
    try{
        const userDay = await controller.consultMarkDay(req.body.idUser, req.body.date);
        if(!userDay.messages){
            response.success(req, res, userDay,"",200)
        }else{
            response.error(req, res,false,userDay.messages, 200)
        }
    }catch(err){
        /* next(err); */
        response.error(req, res,false,errorMessage, 500) 
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
       response.success(req, res,"", mensaje,201);
    }catch(err){
        /* next(err); */
        response.error(req, res,false,errorMessage, 500) 
    }
}; 

module.exports = router;   