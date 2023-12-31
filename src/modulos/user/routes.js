const express = require('express');
const security = require('./security');
const response = require('../../red/response');
const controller = require('./index');

const router = express.Router();

router.post('/information', security(),consultUser);
router.post('/markingMonth', security(),consultMarkMonth); 
router.post('/markingWeek', security(),consultMarkWeek); 
router.post('/markingDay', security(),consultMarkDay);
router.post('/update', addUser);
router.post('/addTokenUser', addTokensUser);
router.post('/getAllWorkers', getAllWorkers);
router.get('/getAllWorkersAmount', getAllWorkersAmount);

errorMessageUser = "Algo salio mal, intente más tarde"

async function consultUser(req, res, next) {
    try{
        const user = await controller.consultUser(req.body.username, req.body.password);
        if(!user.messages){
            response.success(req, res, user, "", 200);
        }else{
            response.error(req, res, false, user.messages, 200);
        }
    }catch(err){
        /* next(err); */
         response.error(req, res, false, errorMessageUser, 500);
    }
};

async function consultMarkMonth(req, res, next) {
    try{
        const userMon = await controller.consultMarkMonth(req.body.idUser,req.body.date);
        if(!userMon.messages){
            response.success(req, res, userMon, "", 200);
        }else{
            response.error(req, res, false, userMon.messages, 201);
        }
    }catch(err){
        /* next(err); */
        response.error(req, res,false,errorMessageUser, 500);
    }
};

async function consultMarkWeek(req, res, next) {
    try{
        const userWeek = await controller.consultMarkWeek(req.body.idUser);
        if(!userWeek.messages){
            response.success(req, res, userWeek, "", 200);
        }else{
            response.error(req, res, false, userWeek.messages, 200);
        }
    }catch(err){
        response.error(req, res,false,errorMessageUser, 500);
    }
};

async function consultMarkDay(req, res, next) {
    try{
        const userDay = await controller.consultMarkDay(req.body.idUser, req.body.date);
        if(!userDay.messages){
            response.success(req, res, userDay,"",200);
        }else{
            response.error(req, res, false, userDay.messages, 200);
        }
    }catch(err){
        response.error(req, res, false, errorMessageUser, 500);
    }
};

async function addUser(req, res, next){
    try{
        const items = await controller.addUser(req.body);
       if(req.body.idUser == 0){
            mensaje = 'Item guardado con exito';
       }else{
            mensaje = 'Item actualizado con exito';
       }
       response.success(req, res,"", mensaje, 201);
    }catch(err){
        response.error(req, res, false, errorMessageUser, 500);
    }
};

async function addTokensUser(req, res, next){
    try{
        const userToken = await controller.addTokensUser(req.body);
        if(!userToken.messages){
            console.log("hola ", userToken.message);
            response.success(req, res, userToken, "", 200);
        }else{
            response.error(req, res, false, userToken.messages, 200);
        }
    }catch(err){
        response.error(req, res, false, errorMessageUser, 500);
    }
};

async function getAllWorkers(req, res, next){
    try{
        pageSize = 7;
        console.log("Aqui llega");
        const allWorkers= await controller.allWorkers(req.body);
        console.log("Aqui llega");
        const pageIndex = (req.body.page)
        const workersCounter = await controller.getWorkersCounter(req.body);
        const pageCount = Math.ceil( workersCounter / pageSize);
        response.successPager(req, res, allWorkers, 200, workersCounter, pageCount, pageIndex, pageSize);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};


async function getAllWorkersAmount(req, res, next){
    try{
        const workersCounter = await controller.getWorkersCounter(req.body);
        response.success(req, res, workersCounter, 'Con exito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};
module.exports = router;   