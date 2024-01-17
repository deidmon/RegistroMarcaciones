const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();
const stream = require('stream');

router.post('/reportAsistance', reportAsistance);

errorMessageSchedule = "Algo salio mal, intente más tarde."

async function reportAsistance(req, res, next){
    try{
        const updateScheduleUser  = await controller.reportAsistance(req.body);
        if (updateScheduleUser) {
            const pass = new stream.PassThrough();
            pass.end(updateScheduleUser);
            res.setHeader('Content-Disposition', 'attachment; filename=MiArchivo.xlsx');
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
            pass.pipe(res);
        } else {
            mensaje = 'No se pudo generar el reporte.';
            response.error(req, res, mensaje, 400);
        }
    }catch(err){
        response.error(req, res, false, errorMessageSchedule, 500);
    }
};


module.exports = router;   