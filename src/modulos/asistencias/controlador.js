const TABLA = 'asistencias';
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
    async function obtenerTablaParametrizacion() {
        //obtener la tabla de parametrización
        return db.obtenerTablaParametrizacion(parametrizacion); // Debes implementar esta función en tu base de datos
    }

    async function usuarioYaMarcoHoy(IdUsuarios, IdTipoMarcacion) {
        //verificar si el usuario ya marcó hoy con el mismo IdTipoMarcacion
        const fechaHoy = new Date();
        return db.usuarioYaMarcoHoy(TABLA, IdUsuarios, IdTipoMarcacion, fechaHoy);
    }
    async function agregar(body){

        let fecha = new Date() || '';
        const hora = fecha.getHours();
        const minutos = fecha.getMinutes();
        const segundos = fecha.getSeconds();
 
    // Obtiene la tabla de parametrización desde la base de datos
    const tablaParametrizacion = await obtenerTablaParametrizacion();
    // Compara la hora enviada con la tabla de parametrización
    //const horaFormateada = `${hora}:${minutos}`;
    const horaFormateada = '12:00'//`${hora}:${minutos}`;
    
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
                            return 0; // Manejo de otros casos
                        }
                    }
                }
            return 3;
    }
    const resultadoValidacion = validarHora(horaFormateada);
    const yaMarcoHoy = await usuarioYaMarcoHoy(body.IdUsuarios, body.IdTipoMarcacion);
    if (yaMarcoHoy) {
        return 'El usuario ya marcó hoy con el mismo IdTipoMarcacion';
    }

        const asistencias = {
            IdAsistencias:body.id,
            IdUsuarios: body.IdUsuarios,
            Fecha: fecha,
            Hora: horaFormateada,
            idTMarcacion: body.IdTipoMarcacion ,
            idValidacion: resultadoValidacion,
            Created_at: fecha,
            Created_by: body.IdUsuarios,
            Updated_at: fecha,
            Updated_by: 0,
        } 
        const respuesta = await db.agregar(TABLA, asistencias);
         return resultadoValidacion;
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
