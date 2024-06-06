const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();
const stream = require('stream');

router.post('/reportAsistance', reportAsistance);
router.post('/reportAsistanceWithLocation', reportAsistanceWithLocation);
router.post('/reportOvertime', reportOvertime);
router.post('/reportRequest', reportRequest);
router.post('/reportAudit', reportAudit);
router.post('/reportAuditArea', reportAuditArea);

errorMessageSchedule = "Algo salio mal, intente más tarde."

async function reportAsistance(req, res, next){
    try{
        const reportAsistance  = await controller.reportAsistance(req.body);
        if (reportAsistance) {
            const pass = new stream.PassThrough();
            pass.end(reportAsistance);
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

async function reportAsistanceWithLocation(req, res, next){
    try{
        const reportAsistance  = await controller.reportAsistanceWithLocation(req.body);
        if (reportAsistance) {
            const pass = new stream.PassThrough();
            pass.end(reportAsistance);
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

async function reportOvertime(req, res, next){
    try{
        const reportOvertime  =await controller.reportOvertimeNew(req.body); /* await controller.reportOvertime(req.body); */
        if (reportOvertime) {
            const pass = new stream.PassThrough();
            pass.end(reportOvertime);
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

async function reportRequest(req, res, next){
    try{
        const reportRequest  = await controller.reportRequest(req.body);
        if (reportRequest) {
            const pass = new stream.PassThrough();
            pass.end(reportRequest);
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

async function reportAudit(req, res, next){
    try{
        const reportAudit  = await controller.reportAudit(req.body);
        if (reportAudit) {
            const pass = new stream.PassThrough();
            pass.end(reportAudit);
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


async function reportAuditArea(req, res, next){
    try{
        const reportAudit  = await controller.reportAuditArea(req.body);
        if (reportAudit) {
            const pass = new stream.PassThrough();
            pass.end(reportAudit);
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