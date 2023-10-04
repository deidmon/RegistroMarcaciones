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


    async function agregar(body){
        const radioMetros = 50;

        const ubicaciones =await db.CompararUbicacion(TABLAUSER,direcciones,body.idUser,body.latitude,body.latitude,body.longitude,radioMetros,body.idUser,body.latitude,body.latitude,body.longitude,radioMetros)
        console.log("ubicaciones",ubicaciones)
        if (ubicaciones.length > 0) {

            const primerResultado = ubicaciones[0];
            const IdDireccion = primerResultado.IdDireccion;
            const NDireccion =primerResultado.Direccion
            console.log("IdDireccion:", IdDireccion);

        const data = await db.query(TABLAUSER, {IdUsuarios: body.idUser});
        if (!data) {
            throw new Error("Usuario incorrecto");
        }
        const id = data.IdUsuarios;

        let fechaInicial =  moment();
        let dia = fechaInicial.format('DD'); 
        let mes = fechaInicial.format('MM'); 
        let año = fechaInicial.format('YYYY');

        let fecha = `${año}-${mes}-${dia}`; 

        const hora = fechaInicial.format('HH');
        const minutos = fechaInicial.format('mm');
        const segundos = fechaInicial.format('ss'); 
 
    const tablaParametrizacion = await db.obtenerTablaParametrizacion(parametrizacion, body.idTypesMarking);
    const horaFormateada =   `${hora}:${minutos}`;
 
    function validarHora(horaFormateada) {
        const [hora, minutos] = horaFormateada.split(':'); 
        for (const fila of tablaParametrizacion) {
            const [horaInicio, minutosInicio] = fila.HoraInicio.split(':'); 
            const [horaFin, minutosFin] = fila.HoraFin.split(':'); 
            
            const horaEnMinutos = parseInt(hora) * 60 + parseInt(minutos);
            const horaInicioEnMinutos = parseInt(horaInicio) * 60 + parseInt(minutosInicio);
            const horaFinEnMinutos = parseInt(horaFin) * 60 + parseInt(minutosFin);

            if (horaEnMinutos >= horaInicioEnMinutos && horaEnMinutos <= horaFinEnMinutos) {
           
                const idValidacion = fila.idValidacion;
                        switch (idValidacion) {
                        case 1:
                            return 1;
                        case 2:
                            return 2;
                        default:
                            return 3; // Manejo de otros casos
                        }
                    }
                }
            return 0;
    }
    const resultadoValidacion = validarHora(horaFormateada);
    let b = '';
    if (resultadoValidacion === 0) {
        b = 'Estás marcando en un horario no permitido';
        return b
      } else if (resultadoValidacion === 1) {
        b = 'Conforme';
      } else if (resultadoValidacion === 2) {
        b = 'Tardanza';
      } else if (resultadoValidacion === 3) {
        b = 'Falta';
      } 

  const yaMarcoHoy = await db.usuarioYaMarcoHoy(TABLA, body.idUser,fecha, body.idTypesMarking);

    var a = false;
    if (yaMarcoHoy.length>0){
        a=true    
    }else{
        a=false
    }
    if (a) {
        return `El usuario ya marcó hoy en este tipo de marcación ${body.idTypesMarking}`;
    }

        const asistencias = {
            IdAsistencias:body.id,
            IdUsuarios: body.idUser,
            IdDirec: IdDireccion,
            Fecha: fecha,
            Hora: horaFormateada,
            idTMarcacion: body.idTypesMarking ,
            idValidacion: resultadoValidacion,
            Created_at: fecha,
            Created_by: body.idUser,
            Updated_at: '0000-00-00',
            Updated_by: 0,
        } 
        
        const respuesta = await db.agregar(TABLA, asistencias);
        return [`Registrado como: ${b}`,`Ubicacion: ${NDireccion}`]
        }else{
            return  mensajeUbicacion = 'Estas fuera del rango de la ubicacion';
        }
        
    }


    async function actualizar(body){

        let user = body.usuario || '';
        let password = body.contraseña || '';
        const Marcacion = {
            IdUsuarios:body.idUser,
            Fecha: body.Fecha,
            Hora: body.Hora,
            idTMarcacion:body.idTypesMarking ,
            idValidacion:body.idValidacion,
            
        } 
        const Modificacion ={
            Hora: body.Hora,
            idTMarcacion:body.idTypesMarking ,
            idValidacion:body.idValidacion,
            Updated_by: body.IdUsuariosM,
            Updated_at: fecha,           
        }
        if(body.IdRol == 1){
            const respuesta = await db.actualizarMarca(TABLA,Modificacion,Marcacion); 
            return respuesta;
        }else{
            throw new Error("No tienes permiso para modificar");
        }
       
        

    }
    return {

        agregar,
        actualizar,

    }


}
