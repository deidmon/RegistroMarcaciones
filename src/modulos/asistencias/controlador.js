const moment = require('moment-timezone');
const TABLA = 'asistencias';
const TABLAUSER = 'usuarios';
const parametrizacion = 'parametrizacion';
const direcciones = 'direcciones';
moment.tz.setDefault('America/Lima');
module.exports = function(dbInyectada){
    let fechaInicial =  moment();
        let dia = fechaInicial.format('DD'); // Agrega ceros a la izquierda si es necesario
        let mes = fechaInicial.format('MM'); // Agrega ceros a la izquierda si es necesario
        let año = fechaInicial.format('YYYY');

        let fecha = `${año}-${mes}-${dia}`; 
    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    function todos(){
        return db.todos(TABLA);
    }
    function uno(id){
        return db.uno(TABLA, id);
    }

    async function agregar(body){
        const radioMetros = 50;
        // const params = [ 
        //     idUsuario,
        //     data.latitudUsuario, data.latitudUsuario,
        //     data.longitudUsuario, data.radioMetros,
        //     idUsuario,
        //     data.latitudUsuario, data.latitudUsuario,
        //     data.longitudUsuario, data.radioMetros
        // ];
        const ubicaciones =await db.CompararUbicacion(TABLAUSER,direcciones,body.IdUsuarios,body.Latitud,body.Latitud,body.Longitud,radioMetros,body.IdUsuarios,body.Latitud,body.Latitud,body.Longitud,radioMetros)
        console.log("ubicaciones",ubicaciones)
        if (ubicaciones.length > 0) {
            // Acceder al valor de IdDireccion del primer resultado
            const primerResultado = ubicaciones[0];
            const IdDireccion = primerResultado.IdDireccion;
            const NDireccion =primerResultado.Direccion
            console.log("IdDireccion:", IdDireccion);

        const data = await db.query(TABLAUSER, {IdUsuarios: body.IdUsuarios});
        if (!data) {
            throw new Error("Usuario incorrecto");
        }
        const id = data.IdUsuarios;

        let fechaInicial =  moment();
        let dia = fechaInicial.format('DD'); // Agrega ceros a la izquierda si es necesario
        let mes = fechaInicial.format('MM'); // Agrega ceros a la izquierda si es necesario
        let año = fechaInicial.format('YYYY');

        let fecha = `${año}-${mes}-${dia}`; 
       // console.log(fecha)
        const hora = fechaInicial.format('HH');
        const minutos = fechaInicial.format('mm');
        const segundos = fechaInicial.format('ss'); 
        //const hora = horalocal - 1;
        //const hora = horalocal;
 
    // Obtiene la tabla de parametrización desde la base de datos
    const tablaParametrizacion = await db.obtenerTablaParametrizacion(parametrizacion, body.idTMarcacion);
    // Compara la hora enviada con la tabla de parametrización
    const horaFormateada =  /* '09:00' */ `${hora}:${minutos}`;
 
    function validarHora(horaFormateada) {
        const [hora, minutos] = horaFormateada.split(':'); // Convierte la cadena en dos números

        for (const fila of tablaParametrizacion) {
            const [horaInicio, minutosInicio] = fila.HoraInicio.split(':'); // Convierte las cadenas en dos números
            const [horaFin, minutosFin] = fila.HoraFin.split(':'); // Convierte las cadenas en dos números
            
            const horaEnMinutos = parseInt(hora) * 60 + parseInt(minutos);
            const horaInicioEnMinutos = parseInt(horaInicio) * 60 + parseInt(minutosInicio);
            const horaFinEnMinutos = parseInt(horaFin) * 60 + parseInt(minutosFin);

            if (horaEnMinutos >= horaInicioEnMinutos && horaEnMinutos <= horaFinEnMinutos) {
            // La hora enviada está dentro del rango de la tabla de parametrización
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
            //return 3;
            return 0;
    }
    //const fecha2 = '2023-09-08'; 
    //------------------opcion 2
    const resultadoValidacion = validarHora(horaFormateada);
    //console.log(resultadoValidacion);
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

  const yaMarcoHoy = await db.usuarioYaMarcoHoy(TABLA, body.IdUsuarios,fecha, body.idTMarcacion);
  
 // console.log(yaMarcoHoy)
    var a = false;
    if (yaMarcoHoy.length>0){
        a=true    
    }else{
        a=false
    }
    if (a) {
        return `El usuario ya marcó hoy en este tipo de marcación ${body.idTMarcacion}`;
    }

        const asistencias = {
            IdAsistencias:body.id,
            IdUsuarios: body.IdUsuarios,
            IdDirec: IdDireccion,
            Fecha: fecha,
            Hora: horaFormateada,
            idTMarcacion: body.idTMarcacion ,
            idValidacion: resultadoValidacion,
            Created_at: fecha,
            Created_by: body.IdUsuarios,
            Updated_at: '0000-00-00',
            Updated_by: 0,
        } 
        
        const respuesta = await db.agregar(TABLA, asistencias);
        return [`Registrado como: ${b}`,`Ubicacion: ${NDireccion}`]
        }else{
            return  mensajeUbicacion = 'Estas fuera del rango de la ubicacion';
        }
        
    }

        
    function eliminar(body){
        return db.eliminar(TABLA, body);
    }

    async function actualizar(body){
        /* if(body.TConsulta == 0){
            
       }else{
            
       } */
        let user = body.usuario || '';
        let password = body.contraseña || '';
        const Marcacion = {
            IdUsuarios:body.IdUsuarios,
            Fecha: body.Fecha,
            Hora: body.Hora,
            idTMarcacion:body.idTMarcacion ,
            idValidacion:body.idValidacion,
            
        } 
        const Modificacion ={
            //Fecha: body.Fecha,
            Hora: body.Hora,
            idTMarcacion:body.idTMarcacion ,
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
        /* if(body.contraseña){
            password = await bcrypt.hash(body.contraseña.toString(), 5) 
       } */
        
        
        /*  */
        
        

    }
    return {
        todos,
        uno,
        agregar,
        actualizar,
        eliminar,
    }


}
