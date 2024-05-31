const tableModules = 'modulos';
const tablePermission = 'permisos'; 
const tablePermissionByProfile = 'perfilpermisos'; 
const tableProfiles = 'perfiles';
const constant = require("../../helpers/constants");


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

    /* async function addProfile(body) {
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
    } */

    async function addProfile(body) {
        const profileUser = await db.queryProfileUser(constant.tableUser,body.idUser)
        if (profileUser != 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }
        let addNewProfile = false;       
        try {
            const existProfile = await db.queryConsultNameProfile(constant.tableProfile, body.nameProfile);
            if (existProfile === 1) {
                message = 'Ya existe un perfil con ese nombre';
                return { "messages": message }
            }
            const profile = {
                nombre: body.nameProfile,
                descripcion: body.descriptionProfile,
                idEstado: body.idStatus,
            }
            const opciones = body.opciones
            const respuesta = await db.add(constant.tableProfile, profile);
            if (respuesta && respuesta.affectedRows > 0) {
                const idProfile = await db.queryConsultIdProfile(constant.tableProfile, body.nameProfile);
                for (let [key, value] of Object.entries(opciones)) {
                    const newItem = {
                        idPerfil: idProfile, 
                        idOpcion: parseInt(key),
                        acceso_vizualizar: opciones[key][0],
                        acceso_crear:opciones[key][1],
                        acceso_actualizar: opciones[key][2],
                        acceso_eliminar: opciones[key][3]
                    }
                    if(JSON.stringify(value) !== JSON.stringify([0,0,0,0])) {
                        insertItem = await db.add(constant.tableProfileOption, newItem) 
                        if(insertItem.affectedRows>0){
                            addNewProfile = true;
                        }
                    }
                }
            }
            
        } catch(error) {
            return "Error al añadir nuevo perfil";
        }

        if (addNewProfile) {
            return "Se añadió un nuevo perfil";;
        }
        
    }
    /* async function activateProfile(body) {
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
    } */
    
    async function activateProfile(body) {
        const profileUser = await db.queryProfileUser(constant.tableUser,body.idUser)
        if (profileUser != 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }
        //Comprobar que no exista un usuario con ese perfil
        usersWithProfile = await db.queryUsersWithProfile(constant.tableUser,body.idProfile)
        if(usersWithProfile === 1){
            message = 'No se puede desactivar este perfil porque existen usuarios con este perfil';
            return { "messages": message }
        }
        const respuesta = await db.queryActivateProfile(constant.tableProfile, body.status, body.idProfile);
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

    async function getPermissionByProfile(body){
        /* return db.getPermissionByProfile(constant.tableProfileOption, constant.tableOptions, constant.tableModule,  body.idProfile); */
        return db.getPermissionByProfile2(constant.tableOptions, constant.tableModule, constant.tableProfileOption, body.idProfile);
    }

    async function updatePermissionByProfile(body) {
        const profileUser = await db.queryProfileUser(constant.tableUser,body.idUser)
        if (profileUser !== 1) {
            message = 'No tienes permiso para actualizar';
            return { "messages": message }
        }
        const idProfile = body.idProfile
        const opciones = body.opciones
        let cambiosRealizados = false;
        try {
            for (let [key, value] of Object.entries(opciones)) {
                const updateItem = {
                    idPerfil: idProfile, 
                    idOpcion: parseInt(key),
                    acceso_vizualizar: opciones[key][0],
                    acceso_crear:opciones[key][1],
                    acceso_actualizar: opciones[key][2],
                    acceso_eliminar: opciones[key][3]
                    }
                const verifyItem = {
                        idPerfil: idProfile, 
                        idOpcion: parseInt(key),
                } 
                consultVerifyItem =  await db.queryConsultProfileOpcion(constant.tableProfileOption, idProfile,parseInt(key))
    
                if (consultVerifyItem === 1) {
                    resultUpdate = await db.queryUpdateProfileOpcion(constant.tableProfileOption, updateItem, verifyItem);
                    if(resultUpdate.changedRows>0){
                        cambiosRealizados = true;
                    }
                } else if(consultVerifyItem === 0 && JSON.stringify(value) !== JSON.stringify([0,0,0,0])) {
                   insertItem = await db.add(constant.tableProfileOption, updateItem) 
                   if(insertItem.affectedRows>0){
                    cambiosRealizados = true;
                }
                }
            }
        } catch(error) {
            return "Error al modificar las opciones del perfil";
        }

        if (cambiosRealizados) {
            return "Se modificaron las opciones del perfil";;
        }

        message = "No se realizaron cambios";
        return { "messages": message }
        
    }
    return {
        activateProfile,
        addPermissions,
        allProfiles,
        addProfile,
        groupedModules,
        permissionByModule,
        permissionByProfile,
        getPermissionByProfile,
        updatePermissionByProfile
    }
}
