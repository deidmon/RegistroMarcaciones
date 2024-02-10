const tabletypeValidation = 'validacion';
const tableTypeMarking= 'tipomarcaciones'; 
const tableTypeRequest = 'tiposolicitudes'
const tableStateOfRequest = 'estadosolicitudes';
const tableState= 'estados'; 
const tableModalityWork= 'modalidadtrabajo';
const tableWorkers= 'usuarios'; 
const tableRole= 'rol';


module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    /* 📌 Obtener información de tipos de marcación(solo activos)*/
    async function allTypeMarking(){
        return db.allTypeMarking(tableTypeMarking);
    };

    /* 📌 Obtener información de tipos de validación(solo activos)*/
    async function allTypeValidation(){
        return db.allInformationOfOneTable(tabletypeValidation);
    };

    /* 📌 Obtener información de tipos de marcación*/
    async function allInformationOfTypesMaking(){
        return db.allInformationOfOneTable(tableTypeMarking);
    };

    /* 📌 Obtener información de tipos de validación*/
    async function allInformationOfTypesValidation(){
        return db.allInformationOfOneTable(tabletypeValidation);
    };

    /* 📌 Obtener información de tipos de solicitudes*/
    async function allInformationOfTypesRequest(){
        return db.allInformationOfOneTable(tableTypeRequest);
    };

    /* 📌 Obtener información de modalidad de trabajo*/
    async function allInformationOfModalityWork(){
        return db.allInformationOfOneTable(tableModalityWork);
    };

    /* 📌 Obtener información de estado de solicitudes*/
    async function allInformationOfStateOfRequest(){
        return db.allInformationOfOneTable(tableStateOfRequest);
    };

    /* 📌 Obtener información de estados general*/
    async function allInformationOfStateGeneral(){
        return db.allInformationOfOneTable(tableState);
    };
    
    /* 📌 Actualizar informacion de tipo de solicitudes */
    async function udateTableTypesRequest(){
        return db.queryUpdateAnyTable();
    };

    /* 📌 Actualizar informacion de tipos de validaciones */
    async function udateTableValidation(){
        return db.queryUpdateAnyTable();
    };

    /* 📌 Actualizar informacion de tipos de marcaciones */
    async function udateTableTypeMark(){
        return db.queryUpdateAnyTable();
    };

    /* 📌 Actualizar informacion de modalidad de trabajo */
    async function udateTableWorkModality(){
        return db.queryUpdateAnyTable();
    };
    
    /* 📌 Actualizar informacion de estado de solicitudes */
    async function udateTablStateRequest(){
        return db.queryUpdateAnyTable();
    };

    return {
        allTypeMarking,
        allTypeValidation,
        allInformationOfTypesMaking,
        allInformationOfTypesValidation,
        allInformationOfTypesRequest,
        allInformationOfModalityWork,
        allInformationOfStateOfRequest,
        allInformationOfStateGeneral,
        udateTableTypesRequest,
        udateTableValidation,
        udateTableTypeMark,
        udateTableWorkModality,
        udateTablStateRequest,
    }
}
