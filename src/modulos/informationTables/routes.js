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
router.put('/putUpdateTableTypesRequest', updateTableTypesRequest);
router.put('/putUpdateTableValidation', updateTableValidation);
router.put('/putUpdateTableTypeMark', updateTableTypeMark);
router.put('/putUpdateTableWorkModality', updateTableWorkModality);
router.put('/putUpdateTableStateRequest', updateTableStateRequest);
router.put('/putUpdateLiderAsignedToWork', updateLiderAsignedToWork);
router.post('/getTypesMarkingFilter', typesMarkingFilter);
router.post('/getTypesValidationFilter', typesValidationFilter);
router.post('/getTypesRequestFilter', typesRequestFilter);
router.post('/getModailityOfWorkFilter', getModailityOfWorkFilter);
router.post('/getStateRequestFilter', getStateRequestFilter);
router.get('/getRolesActives', getRolesActives);
router.get('/getAllRoles', getAllRoles);
router.post('/getRolesFilter', getRolesFilter);
router.put('/putUpdateTableRol', updateTableRol);
router.put('/addScheduleToAsignmentSchedules', addScheduleToAsignmentSchedules);



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
        /* console.log(responseInfo); */
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener información de estado de solicitudes*/
async function allInformationOfStateGeneral(req, res, next) {
    try{
        const responseInfo = await controller.allInformationOfStateGeneral();
        /* console.log(responseInfo); */
        response.success(req, res, responseInfo, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar informacion de tipo de solicitudes */
async function updateTableTypesRequest(req, res, next) {
    try{
        const responseInfo = await controller.updateTableTypesRequest(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            /* console.log("aqui"); */
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar información de tipos de validación */
async function updateTableValidation(req, res, next) {
    try{
        const responseInfo = await controller.updateTableValidation(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            /* console.log("aqui"); */
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};
        
/* 📌 Actualizar información de tipos de marcaciones */
async function updateTableTypeMark(req, res, next) {
    try{
        const responseInfo = await controller.updateTableTypeMark(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar informacion de modalidad de trabajo */
async function updateTableWorkModality(req, res, next) {
    try{
        const responseInfo = await controller.updateTableWorkModality(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar informacion de estado de solicitudes */
async function updateTableStateRequest(req, res, next) {
    try{
        const responseInfo = await controller.updateTableStateRequest(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar el lider que tiene asignado */
async function updateLiderAsignedToWork(req, res, next) {
    try{
        const responseInfo = await controller.updateLiderAsignedToWork(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

async function typesMarkingFilter(req, res, next){
    try{
        const responseInfo = await controller.typesMarkingFilter(req.body);
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch(e){
        response.error(req, res, false, errorMessage, 500);
    }
    
};

async function typesValidationFilter(req, res, next){
    try{
        const responseInfo = await controller.typesValidationFilter(req.body);
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch(e){
        response.error(req, res, false, errorMessage, 500);
    } 
};

async function typesRequestFilter(req, res, next){
    try{
        const responseInfo = await controller.typesRequestFilter(req.body);
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch(e){
        response.error(req, res, false, errorMessage, 500);
    } 
};

async function getModailityOfWorkFilter(req, res, next){
    try{
        const responseInfo = await controller.getModailityOfWorkFilter(req.body);
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch(e){
        response.error(req, res, false, errorMessage, 500);
    } 
};

/* 📌 Obtener estado solicitudes filtro */
async function getStateRequestFilter(req, res, next){
    try{
        const responseInfo = await controller.getStateRequestFilter(req.body);
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch(e){
        response.error(req, res, false, errorMessage, 500);
    } 
};

/* 📌 Obtener rol solo activos */
async function getRolesActives(req, res) {
    try{
        const responseInfo = await controller.getRolesActives();
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch{
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener rol solo activos */
async function getAllRoles(req, res) {
    try{
        const responseInfo = await controller.getAllRoles();
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch{
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener rol solo activos */
async function getRolesFilter(req, res) {
    try{
        const responseInfo = await controller.getRolesFilter(req.body);
        response.success(req, res, responseInfo, "Con éxito", 200);
    }catch{
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Actualizar rol*/
async function updateTableRol(req, res, next) {
    try{
        const responseInfo = await controller.updateTableRol(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Asignación de horario para otra fecha */
async function addScheduleToAsignmentSchedules(req, res, next) {
    try{
        const responseInfo = await controller.addScheduleToAsignmentSchedules(req.body);
        if(!responseInfo.messages){
            response.success(req, res, responseInfo, "", 200);
        }else{
            response.error(req, res, false, responseInfo.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};



module.exports = router;   