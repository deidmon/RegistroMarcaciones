const tableModules = 'modulos';
const tablePermission = 'permisos'; 
const tablePermissionByProfile = 'perfilpermisos'; 
const tableProfiles = 'perfiles';


module.exports = function(dbInyectada){
    let db = dbInyectada;
    message = ""

    if(!db){
        db = require('../../DB/mysql');
    }
    async function allProfiles(){
        return db.queryAllProfiles(tableProfiles);
        
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

    async function addProfile(body) {
        if(body.idProfile != 1){
            message = 'Este perfil no puede añadir nuevos perfiles'
            return { "messages": message }
        }
        const profile = {
            nombre: body.name,
            descripcion: body.description,
            idEstado: 1,
        }
        
        const respuesta = await db.add(tableProfiles, profile);
        if (respuesta && respuesta.affectedRows > 0) {
            return 'Perfil añadido con éxito';
        } else {
            return 'No se añadió el perfil';
        }

        
    }
    
    async function activateProfile(body) {
        if (body.idProfile != 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }

        const respuesta = await db.queryActivateProfile(tableProfiles, body.status, body.idProfiles);
        if (respuesta && respuesta.changedRows > 0) {
            return 'Modificación de estado con éxito';
        } else {
            return 'No se realizó ninguna modificación';
        }
    }

    async function addPermissions(body) { 
        const deletePermission = db.queryDeletePermissions(tablePermissionByProfile, body.idProfile, body.idModule)  
        for (let idPermission of body.idPermissions) {
            const updatePermission = {
                idPerfil: body.idProfile,
                idModulo: body.idModule,
                idPermiso: idPermission
            }
            
            const respuesta = await db.add(tablePermissionByProfile, updatePermission);
            if (!respuesta || !respuesta.affectedRows > 0) {
                return 'No se modificaron los permisos';
            }
        
        }

        return 'Permisos modificados con éxito';
    }

    return {
        activateProfile,
        addPermissions,
        allProfiles,
        addProfile,
        groupedModules,
        permissionByModule,
        permissionByProfile
    }
}
