const express = require('express');
const security = require('./security');
const response = require('../../red/response');
const controller = require('./index');

const router = express.Router();

router.post('/information', security(),consultUser);
router.post('/markingMonth', security(),consultMarkMonth); 
router.post('/markingWeek', security(),consultMarkWeek); 
router.post('/markingDay', security(),consultMarkDay);
router.post('/modifyUser', addUser);
router.post('/addTokenUser', addTokensUser);
router.post('/getAllWorkers', getAllWorkers);
router.get('/getAllWorkersAmount', getAllWorkersAmount);
router.put('/activateUsers', activateUsers);
router.post('/getLeaders', getLeaders);
router.put('/putUpdateRolOfWorkers', updateRolOfWorkers);
router.put('/putupdatePassword', updatePasswordOfUser);


errorMessageUser = "Algo salio mal, intente más tarde"
pageSize = 15;

async function consultUser(req, res, next) {
    try{
        const user = await controller.consultUser(req.body.username, req.body.password);
        if(!user.messages){
            response.success(req, res, user, "", 200);
        }else{
            response.error(req, res, false, user.messages, 403);
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
       if(!items.messages){
            response.success(req, res, items,"",200);
        }else{
            response.error(req, res,false, items.messages, 200);
        }
       
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
  
        const allWorkers = await controller.allWorkers(req.body);

        const pageIndex = (req.body.page)
        const workersCounter = await controller.getWorkersCounter(req.body);
        const pageCount = Math.ceil( workersCounter / pageSize);
        response.successPager(req, res, allWorkers, 200, workersCounter, pageCount, pageIndex, pageSize);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de todos lideres*/
async function getLeaders(req, res, next){
    try{

        const allLeaders= await controller.getLeaders(req.body);
        const pageIndex = (req.body.page)
        const leadersCounter = await controller.getLeadersCounter(req.body);
        const pageCount = Math.ceil( leadersCounter / pageSize);
        response.successPager(req, res, allLeaders, 200, leadersCounter, pageCount, pageIndex, pageSize);
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

async function activateUsers(req, res, next) {
    try{
        const activeUsers = await controller.activateUsers(req.body);
        if(!activeUsers.messages){
            response.success(req, res, activeUsers, "", 200);
        }else{
            response.error(req, res, false, activeUsers.messages, 200);
        }
    }catch(err){
        response.error(req, res,false,errorMessageUser, 500);
    }
};

async function updateRolOfWorkers(req, res, next) {
    try{
        const responseInfo = await controller.updateRolOfWorkers(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 200);
        }
    }catch(err){
        response.error(req, res,false,errorMessageUser, 500);
    }
};

async function updatePasswordOfUser(req, res, next) {
    try{
        const responseInfo = await controller.updatePasswordOfUser(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 200);
        }
    }catch(err){
        response.error(req, res,false,errorMessageUser, 500);
    }
};



module.exports = router;   