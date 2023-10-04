const moment = require('moment-timezone');
const TABLA = 'asistencias';
const TABLAUSER = 'usuarios';
const parametrizacion = 'parametrizacion';
const direcciones = 'direcciones';
moment.tz.setDefault('America/Lima');
module.exports = function(dbInyectada){
    let fechaInicial =  moment();
        let dia = fechaInicial.format('DD'); 
        let mes = fechaInicial.format('MM'); 
        let año = fechaInicial.format('YYYY');

        let fecha = `${año}-${mes}-${dia}`; 
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }

    return {

        agregar,
        actualizar,

    }


}
