const express = require('express');
const respuesta = require('../../red/respuesta');

const controlador = require('./index');
const seguridad = require('./seguridad');

const router = express.Router();

router.get('/',todos);
router.get('/:id',uno);
router.post('/',seguridad(), agregar);
router.put('/', eliminar);

async function todos(req, res, next){
    try{
        const items = await controlador.todos();
        respuesta.success(req, res, items, 200);
    }catch(err){
        next(err);
    };  
} 

async function uno(req, res){
    try{
        const items = await controlador.uno(req.params.id);
        respuesta.success(req, res, items, 200); 
    }catch(err){
        respuesta.error(req, res, err, 500);
    }
}; 
async function agregar(req, res, next){
    try{
        const resultadoValidacion  = await controlador.agregar(req.body);
       if(req.body.IdAsistencias == 0){ 
            mensaje = "Guardado con exito";
       }else{
            mensaje = 'Item actualizado con exito';
       }
       respuesta.success(req, res, resultadoValidacion,201);
    }catch(err){
        next(err);
    }
}; 

async function eliminar(req, res, next){
    try{
        const items = await controlador.eliminar(req.body);
        respuesta.success(req, res, 'item elimnado satisfactoriamente', 200); 
    }catch(err){
        next(err);
    }
}; 

module.exports = router;   