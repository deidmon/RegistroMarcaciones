const express = require('express');
const security = require('./security');
const response = require('../../red/response');
const controller = require('./index');

const router = express.Router();



router.post('/addJustifications', addJustifications);

errorMessageUser = "Algo salio mal, intente más tarde"


async function addJustifications(req, res, next){
    try{
        const userToken = await controller.addTokensUser(req.body);
        if(!userToken.messages){
            console.log("hola ", userToken.message);
            response.success(req, res, userToken, "", 200);
        }else{
            response.error(req, res, false, userToken.messages, 200);
        }
    }catch(err){
        response.error(req, res, false, errorMessageUser, 500);
    }
};

module.exports = router;   