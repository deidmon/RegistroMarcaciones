const express = require('express');
const response = require('../../red/response');

const controller = require('./index');

const router = express.Router();

router.get('/getProfiles', allProfiles);
/* router.get('/getGroupedModules', groupedModules);
 */
router.post('/addPermissions', addPermissions);
router.put('/activateProfile', activateProfile);
router.post('/addProfile', addProfile);
router.post('/getPermissionsByProfile', getPermissionsByProfile);
router.put('/updatePermissionByProfile', updatePermissionByProfile);


errorProfiles = "Algo salio mal, intente más tarde."

async function allProfiles(req, res, next) {
    try{
        const profiles = await controller.allProfiles();
        response.success(req, res, profiles, "Con éxito", 200);
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

async function addProfile(req, res, next) {
    try{
        const profile = await controller.addProfile(req.body);
        if(!profile.messages){
            response.success(req, res, {}, profile, 200);
        }else{
            response.error(req, res,false, profile.messages, 200);
        }        
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

async function activateProfile(req, res, next) {
    try{
        const profile = await controller.activateProfile(req.body);
        if(!profile.messages){
            response.success(req, res, {}, profile, 200);
        }else{
            response.error(req, res,false, profile.messages, 200);
        }        
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

async function addPermissions(req, res, next) {
    try{
        const permission = await controller.addPermissions(req.body);
        if(!permission.messages){
            response.success(req, res, permission, 'Con éxito', 200);
        }else{
            response.error(req, res,false, permission.messages, 200);
        }        
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

/* async function groupedModules(req, res, next) {
    try{
        const user = await controller.groupedModules();
        response.success(req, res, user, 'Con éxito', 200);
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

async function permissionByModule(req, res, next) {
    try{
        const user = await controller.permissionByModule(req.body);
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

async function permissionByProfile(req, res, next) {
    try{
        const user = await controller.permissionByProfile(req.body);
        response.success(req, res, user, "Con éxito", 200);
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
}; */

async function getPermissionsByProfile(req, res, next) {
    try{
        const consult = await controller.getPermissionByProfile(req.body);
        if(!consult.messages){
            response.success(req, res, consult, 'Con éxito', 200);
        }else{
            response.error(req, res,false, consult.messages, 200);
        } 
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

async function updatePermissionByProfile(req, res, next) {
    try{
        const consult = await controller.updatePermissionByProfile(req.body);
        if(!consult.messages){
            response.success(req, res,{}, consult, 200);
        }else{
            response.error(req, res,false, consult.messages, 200);
        } 
    }catch(err){
        response.error(req, res, false, errorProfiles, 500);
    }
};

module.exports = router;   