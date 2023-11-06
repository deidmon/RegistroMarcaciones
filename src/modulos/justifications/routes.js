const express = require('express');
const security = require('./security');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();

router.post('/add', addJustifications);
router.post('/update', updateJustifications);
router.get('/getJustifications', getAllJustifications);
errorMessageJustifications = "Algo salio mal, intente más tarde";


async function addJustifications(req, res, next){
    try{
        const items = await controller.addJustifications(req.body);
         if(items){
            response.success(req, res,"", items.messages, 200);
        }
       
    }catch(err){
        response.error(req, res, false, errorMessageJustifications, 500);
    }
};

async function updateJustifications(req, res, next){
    try{
        const items = await controller.updateJustifications(req.body);
        console.log(items)
       if(items){
        response.success(req, res,"", items.messages, 200);

       }        
       
    }catch(err){
        response.error(req, res, false, errorMessageJustifications, 500);
    }
};

async function getAllJustifications(req, res, next){
    try{
        const Usersjustifications= await controller.getAllJustifications(req.body);
        response.success(req, res, Usersjustifications, "", 200);
    }catch(err){
        response.error(req, res, false, errorMessage, 500);
    }
};

module.exports = router;   