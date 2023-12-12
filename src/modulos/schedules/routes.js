const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();

router.get('/schedules',allSchedules);
router.post('/addScheduleUser', addScheduleUser);

errorMessageSchedule = "Algo salio mal, intente más tarde."

async function allSchedules(req, res, next) {
    try{
        const schedule = await controller.allSchedules();
        response.success(req, res, schedule, 'Con éxito', 200);
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


module.exports = router;   