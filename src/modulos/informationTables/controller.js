const tabletypeValidation = 'validacion';
const tableTypeMarking= 'tipomarcaciones'; 
const tableWorkers= 'usuarios'; 
const tableState= 'estados'; 
const tableModalityWork= 'modalidadtrabajo';
const tableRole= 'rol';


module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    async function allTypeMarking(){
        return db.allTypeMarking(tableTypeMarking);
    }

    async function allTypeValidation(){
        return db.allTypeValidation(tabletypeValidation);
    }

    return {
        allTypeMarking,
        allTypeValidation,
    }
}
