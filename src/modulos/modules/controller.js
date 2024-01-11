const tableModules = 'modulos';
const tablePermission = 'permisos'; 
const tablePermissionByProfile = 'perfilpermisos'; 


module.exports = function(dbInyectada){
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    async function allModules(){
        return db.queryAllModules(tableModules);
        
    }

    async function groupedModules(){
       return db.queryGroupedModules(tableModules);
    }

    async function permissionByModule(body){
        return db.queryPermissionByModule(tablePermission, body.idModule);
    }

    async function permissionByProfile(body){
        return db.queryPermissionByProfile(tablePermissionByProfile, tablePermission, body.idProfile, body.idModule);
    }
    return {
        allModules,
        groupedModules,
        permissionByModule,
        permissionByProfile
    }
}
