const TABLA = 'asistencias';
const TABLAUSER = 'usuarios';
const parametrizacion = 'parametrizacion';
module.exports = function(dbInyectada){

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
        const data = await db.query(TABLAUSER, {IdUsuarios: body.IdUsuarios});
        if (!data) {
            throw new Error("Usuario incorrecto");
        }
        const id = data.IdUsuarios;

        let fechaInicial = new Date() || '';
        let dia = fechaInicial.getDate().toString().padStart(2, '0'); // Agrega ceros a la izquierda si es necesario
        let mes = (fechaInicial.getMonth() + 1).toString().padStart(2, '0'); // Agrega ceros a la izquierda si es necesario
        let año = fechaInicial.getFullYear().toString();

        let fecha = `${año}-${mes}-${dia}`; 
       // console.log(fecha)
        const horalocal = fechaInicial.getHours();
        const minutos = fechaInicial.getMinutes();
        const segundos = fechaInicial.getSeconds(); 
        const hora = horalocal - 1;
 
    // Obtiene la tabla de parametrización desde la base de datos
    const tablaParametrizacion = await db.obtenerTablaParametrizacion(parametrizacion, body.idTMarcacion);
    // Compara la hora enviada con la tabla de parametrización
    //const horaFormateada = `${hora}:${minutos}`;
    const horaFormateada = `${hora}:${minutos}`;
    
    // Función para validar la hora
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
                const idValidacion = fila.IdValidacion;
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
            return 3;
    }
    //const fecha2 = '2023-09-08'; 

    const resultadoValidacion = validarHora(horaFormateada);
    let b = '';

  if (resultadoValidacion === 1) {
    b = 'conforme';
  } else if (resultadoValidacion === 2) {
    b = 'tardanza';
  } else if (resultadoValidacion === 3) {
    b = 'falta';
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
         return b;
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
