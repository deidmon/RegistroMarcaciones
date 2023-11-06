const moment = require('moment-timezone');
moment.tz.setDefault('America/Lima');
const tableJustifications = 'justificaciones';
const tableAssist = 'asistencias';
const tableTypesMarking='tipomarcaciones';
const tableUser = 'usuarios';
const tableStateNotifications = 'estadojustificaciones';
const tableTypesValidation = 'validacion';

module.exports = function(dbInjected){

    let db = dbInjected;
    message = ""
    if(!db){
        db = require('../../DB/mysql');
    }
    async function addJustifications(body){
        let initialDate =  moment();
            let day = initialDate.format('DD'); 
            let month = initialDate.format('MM'); 
            let age = initialDate.format('YYYY');
            let hour = initialDate.format('HH');
            let minutes = initialDate.format('mm');
            let date = `${age}-${month}-${day}`;
        const data = await db.queryConsultTable(tableAssist,  {IdUsuarios:body.idUser},{Fecha:date},{IdTMarcacion:body.idTypeMark});
        /* console.log(data) */
        if (!data || data.length === 0) {
            message ='No existe marcación a justificar';
            return {"messages": message};
        }
        const Justifications = {

            IdUsuario: body.idUser,
            Fecha: date,
            IdTMarcaciones: body.idTypeMark,
            Motivo: body.reason ,
            IdEstadoJust: 1,
        }  

        const respuesta = await db.addJustification(tableJustifications, Justifications);
            
        if (respuesta) {
            message = 'Justificación añadida con éxito';
            return {"messages": message};
        } 
            message ='No se pudo añadir la justificación';
            return {"messages": message};
        
    }

    async function updateJustifications(body){

        let initialDate =  moment();
            let day = initialDate.format('DD'); 
            let month = initialDate.format('MM'); 
            let age = initialDate.format('YYYY');
            let hour = initialDate.format('HH');
            let minutes = initialDate.format('mm');
            let date = `${age}-${month}-${day}`;
        const data = await db. queryConsultTable(tableJustifications, {IdUsuario:body.idUser},{Fecha:date},{IdTMarcaciones:body.idTypeMark} );
        if (!data || data.length===0) {
            message ='No existe la justificación a actualizar';
            return {"messages": message};
        }
        const idJustification = data[0].idJustificacion;
        if (body.idStatusJustification != 1) {
            
            const respuesta = await db.queryUpdateJustifactions(tableJustifications, {IdEstadoJust:body.idStatusJustification},idJustification);
            if (body.idStatusJustification == 2){
                const verifyAssistance = {
                    IdUsuarios: body.idUser,
                    Fecha: date,
                    idTMarcación: body.idTypeMark,
                } 
                const data = await db.queryConsultTable(tableAssist,  {IdUsuarios:body.idUser},{Fecha:date},{IdTMarcacion:body.idTypeMark});
                if (!data || data.length===0 ) {
                    message ='No existe marcación a actualizar';
                    return {"messages": message};
                }
                const idMark = data[0].IdAsistencias;
                const Mark = {};

                if (body.hour) {
                    Mark.Hora = body.hour;
                }
                Mark.idValidacion = 4;
                Mark.Updated_at = date;
                Mark.Updated_by = body.idUserModifier;
                const respuesta = await db.queryUpdateAssists(tableAssist, Mark,idMark);
                message ='Justificación actualizada con éxito';
                return {"messages": message};
            }
            
            
            message ='Justificación ha sido actualizada a rechazada';
            return {"messages": message};
        
        } 
            message ='No se puede actualizar la justificación';
            return {"messages": message};
    }

    async function getAllJustifications(body){
        return db.queryGetJustifications(tableJustifications, tableUser, tableTypesMarking, tableStateNotifications, tableAssist, tableTypesValidation, body.IdEstadoJust);
    };

    return {
        addJustifications,
        getAllJustifications,
        updateJustifications,
        
    }
    
}
