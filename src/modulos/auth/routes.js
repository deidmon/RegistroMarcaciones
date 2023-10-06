const express = require('express');
const response = require('../../red/response');
const controller = require('./index');
const router = express.Router();

router.post('/login', login);

errorMessage = "Algo salio mal, intente más tarde."
async function login(req, res, next) {
    try{
        const token = await controller.login(req.body.username, req.body.password);
        /* response.success(req, res, token.mensajes,"sss", 200); */
        if(!token.messages){
            /* response.success(req, res,true,token,"Con exito", 200); */
            response.success(req, res, token,"",200)
        }else{
            /* response.success(req, res,true,token,"Con exito", 200); */
            response.error(req, res,false,token.messages, 200)
        }
    }catch(err){
        /* next(err); */
        /* response.error(req, res,false,"Error del sistema21", 500) */
        response.error(req, res,false,errorMessage, 500) 
        
    }
}
module.exports = router;