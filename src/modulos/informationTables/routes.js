const express = require('express');
const response = require('../../red/response');

const controller = require('./index');

const router = express.Router();

router.get('/typesMarking', allTypeMarking);
router.get('/typesValidation', allTypeValidation);
router.get('/getAllInformationOfTypesMaking', allInformationOfTypesMaking);
router.get('/getAllInformationOfTypesValidation',allInformationOfTypesValidation);
router.get('/getAllInformationOfTypesRequest', allInformationOfTypesRequest);
router.get('/getAllInformationOfModalityWork', allInformationOfModalityWork);
router.get('/getAllInformationOfStateOfRequest', allInformationOfStateOfRequest);
router.get('/getAllInformationOfStateGeneral', allInformationOfStateGeneral);

const errorMessage = "Algo salio mal, intente más tarde."

/* 📌 Obtener información de tipos de marcación(solo activos)*/
async function allTypeMarking(req, res, next) {
    try{
        const user = await controller.allTypeMarking();
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        /* next(err); */
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de tipos de validación(solo activos)*/
async function allTypeValidation(req, res, next) {
    try{
        const user = await controller.allTypeValidation();
        response.success(req, res, user, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de tipos de marcación*/
async function allInformationOfTypesMaking(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfTypesMaking();
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de tipos de validación*/
async function allInformationOfTypesValidation(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfTypesValidation();
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de tipos de solicitudes*/
async function allInformationOfTypesRequest(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfTypesRequest();
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de modalidad de trabajo*/
async function allInformationOfModalityWork(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfModalityWork();
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de estado de solicitudes*/
async function allInformationOfStateOfRequest(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfStateOfRequest();
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de estado de solicitudes*/
async function allInformationOfStateGeneral(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfStateGeneral();
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};
             
        
        

module.exports = router;   