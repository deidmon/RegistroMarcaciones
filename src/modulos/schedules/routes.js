const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();

router.post('/schedules',allSchedules);
router.post('/addScheduleUser', addScheduleUser);
router.post('/modifySchedule', addSchedule);
router.post('/scheduleByUser', scheduleByUser);
router.put('/activateSchedule', activateSchedule);
errorMessageSchedule = "Algo salio mal, intente más tarde."

async function allSchedules(req, res, next) {
    try{
        const schedule = await controller.allSchedules(req.body);
        response.success(req, res, schedule, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessageSchedule, 500);
    }
};
async function scheduleByUser(req, res, next) {
    try{
        const scheduleUser = await controller.scheduleByUser(req.body);
        if(!scheduleUser.messages){
            response.success(req, res, scheduleUser,"",200);
        }else{
            response.error(req, res,false, scheduleUser.messages, 200);
        }
    }catch(err){
        response.error(req, res, false, errorMessageSchedule, 500);
    }
};

async function addScheduleUser(req, res, next){
    try{
        const updateScheduleUser  = await controller.addScheduleUser(req.body);
        if (updateScheduleUser) {
            mensaje = 'Horario asignado al usuario con éxito';
            response.success(req, res, mensaje, 'Con éxito', 200);
        } else {
            mensaje = 'Horario no asignado al usuario';
            response.error(req, res, mensaje, 400);
        }
    }catch(err){
        response.error(req, res, false, errorMessageSchedule, 500);
    }
};

async function addSchedule(req, res, next){
    try{
        const schedule = await controller.addSchedules(req.body);
       if(!schedule.messages){
            response.success(req, res, "",schedule,200);
        }else{
            response.error(req, res,false, schedule.messages, 200);
        }
       
    }catch(err){
        response.error(req, res, false, errorMessageSchedule, 500);
    }
};

async function activateSchedule(req, res, next) {
    try{
        const activateSchedule = await controller.activateSchedule(req.body);
        if(!activateSchedule.messages){
            response.success(req, res, {}, activateSchedule, 200);
        }else{
            response.error(req, res, false, activateSchedule.messages, 200);
        }
    }catch(err){
        response.error(req, res,false,errorMessageSchedule, 500);
    }
};

module.exports = router;   