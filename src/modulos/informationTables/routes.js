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
router.put('/putUdateTableTypesRequest', udateTableTypesRequest);
router.put('/putUdateTableValidation', udateTableValidation);
router.put('/udateTableTypeMark', udateTableTypeMark);
router.put('/udateTableWorkModality', udateTableWorkModality);
router.put('/udateTablStateRequest', udateTablStateRequest);

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
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de estado de solicitudes*/
async function allInformationOfStateGeneral(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfStateGeneral();
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar informacion de tipo de solicitudes */
async function udateTableTypesRequest(req, res, next) {
    try{
        const responseInfo = await controller.udateTableTypesRequest();
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar información de tipos de validación */
async function udateTableValidation(req, res, next) {
    try{
        const responseInfo = await controller.udateTableValidation();
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};
        
/* 📌 Actualizar información de tipos de marcaciones */
async function udateTableTypeMark(req, res, next) {
    try{
        const responseInfo = await controller.udateTableTypeMark();
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar informacion de modalidad de trabajo */
async function udateTableWorkModality(req, res, next) {
    try{
        const responseInfo = await controller.udateTableWorkModality();
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar informacion de estado de solicitudes */
async function udateTablStateRequest(req, res, next) {
    try{
        const responseInfo = await controller.udateTablStateRequest();
        console.log(responseInfo);
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

module.exports = router;   