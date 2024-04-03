const tabletypeValidation = 'validacion';
const tableTypeMarking= 'tipomarcaciones'; 
const tableTypeRequest = 'tiposolicitudes'
const tableStateOfRequest = 'estadosolicitudes';
const tableState= 'estados'; 
const tableModalityWork= 'modalidadtrabajo';
const tableWorkers= 'usuarios'; 
const tablePersonalAssigment= 'asignacionpersonal';  
const tableRole= 'rol';
const scheduleAssignment = 'asignacionhorarios';


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
        return db.querygenericToGetAll(tableState);
    };
    
    /* 📌 Actualizar informacion de tipo de solicitudes */
    async function updateTableTypesRequest(body){
        const descriptionTypeRequest = {
            descripcion: body.description
        }
        
        const idStateRequest = {
           idSolicitud: body.id
        }

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }

        const response = await db.queryUpdateAnyTable(tableTypeRequest, descriptionTypeRequest, idStateRequest);
        /* console.log(response); */
        if (response && response.changedRows > 0) {
            return 'Modificado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };

    /* 📌 Actualizar informacion de tipos de validaciones */
    async function updateTableValidation(body){
        const toUpdate = {
            descripcion: body.description
        };

        const idWhere = {
            idValidacion: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };
        const response = await db.queryUpdateAnyTable(tabletypeValidation ,toUpdate,idWhere);

        if (response && response.changedRows > 0) {
            return 'Modificado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };

    /* 📌 Actualizar informacion de tipos de marcaciones */
    async function updateTableTypeMark(body){
        const toUpdate = {
            descripcion: body.description
        };

        const idWhere = {
            idTMarcaciones: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };

        const response = await db.queryUpdateAnyTable(tableTypeMarking, toUpdate, idWhere);
        if (response && response.changedRows > 0) {
            return 'Modificado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };

    /* 📌 Actualizar informacion de modalidad de trabajo */
    async function updateTableWorkModality(body){
        
        const toUpdate = {
            Descripcion: body.description
        };

        const idWhere = {
            IdModalidad: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };
        const response = await db.queryUpdateAnyTable(tableModalityWork, toUpdate, idWhere);
        if (response && response.changedRows > 0) {
            return 'Modificado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
        
    };
    
    /* 📌 Actualizar informacion de estado de solicitudes */
    async function updateTableStateRequest(body){
        const toUpdate = {
            descripcion: body.description
        };

        const idWhere = {
            idEstadoSolicitud: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };

         const response = await db.queryUpdateAnyTable(tableStateOfRequest, toUpdate, idWhere);

         if (response && response.changedRows > 0) {
            return 'Modificado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };
    
    /* 📌 Actualizar el lider que tiene asignado */
    async function updateLiderAsignedToWork(body){
        const toUpdate = {
            idLider: body.idLeader
        };

        const idWhere = {
            idUsuario: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };

        //Modificar en la tabla asignación personal
         const response = await db.queryUpdateAnyTable(tablePersonalAssigment, toUpdate, idWhere);
         if (response && response.affectedRows > 0) {
            return 'Modificado con éxito';
        } else {
            const newWorkerAsignedToLeader = {
                idLider: body.idLeader,
                idUsuario: body.id
            };
            const responsoInsert = await db.addNewRegister(tablePersonalAssigment, newWorkerAsignedToLeader );
            return 'Asignado con éxito';
        }
    };

    /* 📌 Obtener los tipos de marcación filtro*/
    async function typesMarkingFilter(body){
        const idStates = 
        [body.idStateEnabled, body.idStateDisabled];
        const  response = await db.queryGeneralFilter(tableTypeMarking, idStates, body.name);
        return response;
    };

    /* 📌 Obtener los tipos de validaciones filtro*/
    async function typesValidationFilter(body){
        const idStates = 
        [body.idStateEnabled, body.idStateDisabled];
        const  response = await db.queryGeneralFilter(tabletypeValidation, idStates, body.name);
        return response;
    };

    /* 📌 Obtener los tipos de solicitudes filtro*/
    async function typesRequestFilter(body){
        const idStates = 
        [body.idStateEnabled, body.idStateDisabled];
        const  response = await db.queryGeneralFilter(tableTypeRequest, idStates, body.name);
        return response;
    };

    /* 📌 Obtener las modalidades de trabajo filtro*/
    async function getModailityOfWorkFilter(body){
        const idStates = 
        [body.idStateEnabled, body.idStateDisabled];
        const  response = await db.queryGeneralFilter(tableModalityWork, idStates, body.name);
        return response;
    };

    /* 📌 Obtener estado solicitudes filtro */
    async function getStateRequestFilter(body){
        const idStates = 
        [body.idStateEnabled, body.idStateDisabled];
        const  response = await db.queryGeneralFilter(tableStateOfRequest, idStates, body.name);
        return response;
    };

    /* 📌 Obtener roles activos */
    async function getRolesActives() {
        const roles = await db.getRolesActives(tableRole)
        return roles;
    };

    /* 📌 Obtener todos los roles */
    async function getAllRoles() {
        const roles = await db.allInformationOfOneTable(tableRole);
        return roles;
    };

    /* 📌 Roles filtro*/
    async function getRolesFilter(body){
        const idStates = 
        [body.idStateEnabled, body.idStateDisabled];
        /* console.log("279"); */
        const  response = await db.queryRolFilter(tableRole, idStates, body.name);
        /* console.log(response); */
        return response;
    };

    /* 📌 Actualizar rol*/
    async function updateTableRol(body){
        const toUpdate = {
            Nombre: body.description
        };

        const idWhere = {
            idRol: body.id
        };

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idUser);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };

        const response = await db.queryUpdateAnyTable(tableRole, toUpdate, idWhere);

        if (response && response.changedRows > 0) {
            return 'Modificado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    };

    /* 📌 Asignación de horario para otra fecha */
    async function addScheduleToAsignmentSchedules(body){

        //1.Primero verificar el rol si es lider o rrhh
        const whatRolHaveWorker = await db.queryToKnowWhatRolIs(body.idAsignador);
        const idRoles = whatRolHaveWorker.map(row => row.IdRol);
        if (idRoles.includes(1)) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        };
        /* console.log("hola2"); */
        const searchUser = {
            idUsuario: body.idWorker
        }
        
        const response = await db.queryGetWhere(scheduleAssignment, searchUser);
        /* console.log("hola"); */
        if(response.length >= 1){
            //Actualizar
            const toUpdate = {
                fecha: body.fecha,
                idUsuario: body.idWorker,
                idHorarios: body.idHorarios,
                idAsignador: body.idAsignador
            }
            const idWhere = {
                id: response[0].id
            }
            /* console.log("aqui actualizando") */
            const responseOfUpdate = await db.queryUpdateAnyTable(scheduleAssignment, toUpdate, idWhere);
            return "Asignado con éxito";
        }
        //Insertar
        insertValues = {
            fecha: body.fecha,
            idUsuario: body.idWorker,
            idHorarios: body.idHorarios,
            idAsignador: body.idAsignador
        }
        /* console.log("aqui agregando") */
        const responseInfo = await  db.addNewRegister(scheduleAssignment, insertValues);
        return "Asignado con éxito";
    }
    
    
    return {
        allTypeMarking,
        allTypeValidation,
        allInformationOfTypesMaking,
        allInformationOfTypesValidation,
        allInformationOfTypesRequest,
        allInformationOfModalityWork,
        allInformationOfStateOfRequest,
        allInformationOfStateGeneral,
        updateTableTypesRequest,
        updateTableValidation,
        updateTableTypeMark,
        updateTableWorkModality,
        updateTableStateRequest,
        updateLiderAsignedToWork,
        typesMarkingFilter,
        typesValidationFilter,
        typesRequestFilter,
        getModailityOfWorkFilter,
        getStateRequestFilter,
        getRolesActives,
        getAllRoles,
        getRolesFilter,
        updateTableRol,
        addScheduleToAsignmentSchedules
    }
}
