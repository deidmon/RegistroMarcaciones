const express = require('express');
const response = require('../../red/response');

const controller = require('./index');

const router = express.Router();

router.get('/getModules', allModules);
router.get('/getGroupedModules', groupedModules);
router.post('/permissionByModule', permissionByModule);
router.post('/permissionByProfile', permissionByProfile);


errorModule = "Algo salio mal, intente más tarde."

async function allModules(req, res, next) {
    try{
        const user = await controller.allModules();
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        /* next(err); */
        response.error(req, res, false, errorModule, 500);
    }
};

async function groupedModules(req, res, next) {
    try{
        const user = await controller.groupedModules();
        response.success(req, res, user, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorModule, 500);
    }
};

async function permissionByModule(req, res, next) {
    try{
        const user = await controller.permissionByModule(req.body);
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        /* next(err); */
        response.error(req, res, false, errorModule, 500);
    }
};

async function permissionByProfile(req, res, next) {
    try{
        const user = await controller.permissionByProfile(req.body);
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        /* next(err); */
        response.error(req, res, false, errorModule, 500);
    }
};

module.exports = router;   