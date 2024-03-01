const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();
const constant = require("../../helpers/constants");

router.post('/addJustifications', addJustifications);
router.post('/addVacations', addVacations);
router.post('/addPermissions', addPermissions);
router.post('/addAuthorization', addAuthorization);
router.post('/listPermissions',listPermissions);
router.post('/update', updatePermissions);
router.post('/getPermissions', getAllPermissions);
router.post('/getTotalPending', getPermissionsCounterPending);
router.post('/getAllRequestOfWorker', allRequestOfWorker);
router.post('/getRequestOfWorkersAsignedToLeader', allRequestOfWorkersAsignedToLeader);
router.post('/getAllRequestOfAllWorkerstoRRHH', allRequestOfAllWorkerstoRRHH);
router.put('/putManagementOfRequests', managementOfRequests);
errorMessagePermissions = "Algo salio mal, intente más tarde."
const pageSize = constant.pageSize;

async function addJustifications(req, res, next){
    try{
        const items = await controller.addJustifications(req.body);
         if(items){
            response.success(req, res,"", items.messages, 200);
        }
       
    }catch(err){
        response.error(req, res, false, errorMessagePermissions, 500);
    }
};

async function addPermissions(req, res, next){
    try{
        const items = await controller.addPermissions(req.body);
         if(items){
            response.success(req, res,"", items.messages, 200);
        }
       
    }catch(err){
        response.error(req, res, false, errorMessagePermissions, 500);
    }
};

async function addVacations(req, res, next){
    try{
        const items = await controller.addVacations(req.body);
         if(items){
            response.success(req, res,"", items.messages, 200);
        }
       
    }catch(err){
        response.error(req, res, false, errorMessagePermissions, 500);
    }
};

async function addAuthorization(req, res, next){
    try{
        const items = await controller.addAuthorization(req.body);
         if(items){
            response.success(req, res,"", items.messages, 200);
        }
       
    }catch(err){
        response.error(req, res, false, errorMessagePermissions, 500);
    }
};

async function updatePermissions(req, res, next){
    try{
        const items = await controller.updatePermissions(req.body);
        console.log(items)
       if(items){
        response.success(req, res,"", items.messages, 200);
       }        
       
    }catch(err){
        response.error(req, res, false, errorMessagePermissions, 500);
    }
};

async function listPermissions(req, res, next) {
    try{
        const permissions = await controller.listPermissions(req.body);
        response.success(req, res, permissions, "Con éxito", 200);
    }catch(err){
        /* next(err); */
        response.error(req, res, false, errorMessage, 500);
    }
};

async function getAllPermissions(req, res, next){
    try{
        const Usersjustifications= await controller.getAllPermissions(req.body);
        const pageIndex = (req.body.page)
        const UsersjustificationsCounter= await controller.getPermissionsCounter(req.body);
        const pageCount = Math.ceil(UsersjustificationsCounter / pageSize);
        response.successPager(req, res, Usersjustifications, 200, UsersjustificationsCounter, pageCount, pageIndex, pageSize);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Contador de justificaciones pendientes */
async function getPermissionsCounterPending(req, res, next) {
    try{
        const counter = await controller.getPermissionsCounterPending(req.body);
        response.successCounter(req, res, counter, "Con éxito", 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Obtener las solicitudes de cada trabajador */
async function allRequestOfWorker(req, res, next){
    try{
        const allRequestOfWorker = await controller.allRequestOfWorker(req.body);
        const pageIndex = (req.body.page)
        const allRequestOfWorkerCounter= await controller.allRequestOfWorkerCounter(req.body);
        const pageCount = Math.ceil(allRequestOfWorkerCounter / pageSize);
        response.successPager(req, res, allRequestOfWorker, 200, allRequestOfWorkerCounter, pageCount, pageIndex, pageSize);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Todos los solicitudes de los trabajadores asignados a un lider*/
async function allRequestOfWorkersAsignedToLeader(req, res, next){
    try{
        const requestOfWorkersAsignedToLeader = await controller.allRequestOfWorkersAsignedToLeader(req.body);
        const pageIndex = (req.body.page)
        const allRequestOfUserAsignedToLeaderCounter = await controller.allRequestOfUserAsignedToLeaderCounter(req.body);
        const pageCount = Math.ceil(allRequestOfUserAsignedToLeaderCounter / pageSize);
        response.successPager(req, res, requestOfWorkersAsignedToLeader, 200, allRequestOfUserAsignedToLeaderCounter, pageCount, pageIndex, pageSize);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Todos los solicitudes de todos los trabajadores para RRHH*/
async function allRequestOfAllWorkerstoRRHH(req, res, next){
    try{
        const requestOfAllWorkersAsignedToLeader = await controller.allRequestOfAllWorkersToRRHH(req.body);
        const pageIndex = (req.body.page);
        const allRequestOfAllUserToRRHHCounter = await controller.allRequestOfAllWorkersCounterToRRHH(req.body);
        const pageCount = Math.ceil(allRequestOfAllUserToRRHHCounter / pageSize);
        response.successPager(req, res, requestOfAllWorkersAsignedToLeader, 200, allRequestOfAllUserToRRHHCounter, pageCount, pageIndex, pageSize);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

/* 📌 Aceptar o rechazar solicitudes */
async function managementOfRequests(req, res, next){
    try{ 
        const managementOfRequest = await controller.managementOfRequests(req.body)
        if(!managementOfRequest.messages){
            response.success(req, res, managementOfRequest, "", 200);
        }else{
            response.error(req, res, false, managementOfRequest.messages, 403);
        }
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

module.exports = router;   