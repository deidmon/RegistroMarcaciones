const TABLA = 'asistencias';

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

        let fecha = new Date() || '';
        const hora = fecha.getHours();
        const minutos = fecha.getMinutes();
        const segundos = fecha.getSeconds();
 
    // Tabla de parametrización
    const tablaParametrizacion = [
        { IdTipoMarcacion: 1, IdValidacion: 1, HoraInicio: '6:00', HoraFin: '09:05' },
        { IdTipoMarcacion: 1, IdValidacion: 2, HoraInicio: '9:06', HoraFin: '09:15' },
        //{ IdTipoMarcacion: 1, IdValidacion: 3, HoraInicio: '9:16', HoraFin: '23:59' },
        { IdTipoMarcacion: 2, IdValidacion: 1, HoraInicio: '12:00', HoraFin: '13:05' },
        { IdTipoMarcacion: 2, IdValidacion: 2, HoraInicio: '13:06', HoraFin: '13:15' },
        //{ IdTipoMarcacion: 2, IdValidacion: 3, HoraInicio: '13:16', HoraFin: '23:59' },
        { IdTipoMarcacion: 3, IdValidacion: 1, HoraInicio: '13:55', HoraFin: '14:05' },
        { IdTipoMarcacion: 3, IdValidacion: 2, HoraInicio: '14:06', HoraFin: '15:00' },
        //{ IdTipoMarcacion: 3, IdValidacion: 3, HoraInicio: '15:01', HoraFin: '23:59' },
        { IdTipoMarcacion: 4, IdValidacion: 1, HoraInicio: '18:00', HoraFin: '19:05' },
        { IdTipoMarcacion: 4, IdValidacion: 2, HoraInicio: '19:06', HoraFin: '20:00' },
        //{ IdTipoMarcacion: 4, IdValidacion: 3, HoraInicio: '20:01', HoraFin: '23:59' },
    ];    
    // Compara la hora enviada con la tabla de parametrización
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
                            return 'Conforme';
                        case 2:
                            return 'Tardanza';
                        default:
                            return 'Desconocido'; // Manejo de otros casos
                        }
                    }
                }
            return 'Falta';
    }
    const resultadoValidacion = validarHora(horaFormateada);

        const asistencias = {
            IdAsistencias:body.id,
            IdUsuarios: body.IdUsuarios,
            Fecha: fecha,
            Hora: horaFormateada,
            TMarcacion: body.TMarcacion ,
            Validacion: resultadoValidacion,
            Created_at: fecha,
            Created_by: body.IdUsuarios,
            Updated_at: fecha,
            Update_by: 0,
        } 
        const respuesta = await db.agregar(TABLA, asistencias);
         return resultadoValidacion;
    }
        
    function eliminar(body){
        return db.eliminar(TABLA, body);
    }
    return {
        todos,
        uno,
        agregar,
        eliminar,
    }
}
