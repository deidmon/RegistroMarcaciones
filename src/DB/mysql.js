const mysql = require('mysql');
const config = require('../config');

const bdconfig = {
    host: config.mysql.host,
    user:config.mysql.user,
    password:config.mysql.password,
    database:config.mysql.database,
}
let conexion ;

function conMysql(){
    conexion = mysql.createConnection(bdconfig);
    conexion.connect((err)=>{
        if(err){
            console.log('[db err]', err);
            setTimeout(conMysql, 200);
        }else{
            console.log('Db conectada')
        }
    });
    conexion.on('error', err =>{
        console.log('[db err]', err);
        if(err.code == 'PROTOCOLO_CONNECTION_LOST'){
            conMysql();
        }else{
            throw err;
        }
    })
}
conMysql();

function todos(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}


function infoUno(tabla, tabla2, id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT IdUsuarios, Nombres, Apellidos, Activo, Usuario, IdRol, IdDirec, d1.Direccion AS DireccionPrimaria, IdDirecSecu, d2.Direccion AS DireccionSecundaria 
            FROM ?? u 
            INNER JOIN ?? d1 ON u.IdDirec = d1.IdDireccion 
            INNER JOIN ?? d2 ON u.IdDirecSecu = d2.IdDireccion 
            WHERE idUsuarios = ?`;

        const values = [tabla, tabla2, tabla2, id];
        
        conexion.query(query, values , (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}



function agregar(tabla, data) {
    return new Promise((resolve, reject) => {
        
        const insertQuery = `INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?`;
        const values = [tabla, data, data];

        conexion.query(insertQuery, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}


function actualizarMarca(tabla, consulta, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdUsuarios = ? AND Fecha = ? AND idTMarcacion = ?`,[consulta,data.IdUsuarios,data.Fecha,data.idTMarcacion], (error, result) =>{
           
            if (error) {
                reject(error);
            } else {
                
                const actualizacionExitosa = result.changedRows > 0;

                resolve(actualizacionExitosa);
            }
        })
    });
}

function actualizar(tabla, consulta){
    return new Promise((resolve, reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdUsuarios = ?`,[consulta,consulta.IdUsuarios], (error, result) =>{
            return error ? reject(error) : resolve(result);
        })
    });
}


function query(tabla, consulta){
    return new Promise((resolve, reject)=>{
        const query = `SELECT * FROM ?? WHERE ?`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) =>{
            return error ? reject(error) : resolve(result[0]);
        })
    });
} 


function queryMarca(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.IdUsuarios, a.IdDirec, d.Direccion, DATE_FORMAT(a.Fecha, '%Y-%m-%d') AS Fecha, DAYNAME(a.Fecha) AS Día, a.Hora,
                a.idTMarcacion, a.idValidacion, v.descripcion 
            FROM ?? a
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion
            LEFT JOIN direcciones d ON a.IdDirec = d.IdDireccion
            WHERE YEAR(a.Fecha) = YEAR(CURRENT_DATE())
                AND WEEK(a.Fecha) = WEEK(CURRENT_DATE())
                AND a.idTMarcacion = 1
                AND a.IdUsuarios = ?`;

        const values = [tabla, tabla2, consulta];

        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.length === 0) {
                    resolve('No existen marcaciones para este usuario');
                } else {
                    resolve(result);
                }
            }
        });
    });
}


function queryMarcaMes(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.IdUsuarios, a.idValidacion, v.descripcion, COUNT(*) AS Cantidad
            FROM ?? a
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion
            LEFT JOIN direcciones d ON a.IdDirec = d.IdDireccion
            WHERE YEAR(a.Fecha) = YEAR(CURRENT_DATE()) 
                AND MONTH(a.Fecha) = MONTH(CURRENT_DATE())
                AND a.idTMarcacion = 1
                AND a.IdUsuarios = ?
            GROUP BY v.idValidacion`;

        const values = [tabla, tabla2, consulta]; 
        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.length === 0) {
                    resolve('No existen marcaciones para este usuario');
                } else {
                    resolve(result);
                }
            }
        });
    });
}



function consultarMarcasDia(tabla, tabla2, tabla3, IdUsuario, Fecha) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.idTMarcacion,LOWER(TIME_FORMAT(STR_TO_DATE(a.Hora, '%H:%i:%s'), '%h:%i:%s %p')) AS 'Hora',t.descripcion AS 'Tipo marcación', a.idValidacion, v.descripcion AS 'Tipo Validación'
            FROM ?? a 
            INNER JOIN ?? t ON a.idTMarcacion = t.idTMarcaciones 
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion 
            WHERE a.IdUsuarios = ? AND a.Fecha = ?`;
        const values = [tabla, tabla2, tabla3, IdUsuario, Fecha];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function registrarFaltas(tabla,tabla2, consulta){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT DISTINCT U.IdUsuarios FROM ${tabla} U LEFT JOIN ${tabla2} R ON U.IdUsuarios = R.IdUsuarios AND DATE(R.Fecha) = CURDATE() WHERE (R.IdUsuarios IS NULL OR R.idTMarcacion <> ?) AND U.IdRol != 2;`, consulta, (error, result) =>{
            if (error) {
                reject(error);
              } else {
                
                const usuariosSinRegistro = result.map((row) => row.IdUsuarios);
                resolve(usuariosSinRegistro);
              }       
        })
    });
}

function obtenerTablaParametrizacion(tabla,idTipoMarcaciones) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${tabla} WHERE idTipoMarcaciones = ? `;
        conexion.query(query,idTipoMarcaciones, (error, results) => {
            if (error) {
                console.error("Error al obtener la tabla de parametrización:", error);
                return reject(error);
            }
            resolve(results);
        });
    });
}


function usuarioYaMarcoHoy(tabla, IdUsuarios,fechaHoy,idTMarcacion) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ${tabla} WHERE IdUsuarios = ? AND Fecha = ? AND idTMarcacion = ?`;
        conexion.query(query, [IdUsuarios, fechaHoy, idTMarcacion], (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
 

function CompararUbicacion(tabla,tabla2,IdUsuarios,latitudUsuario,latitudUsuario,longitudUsuario,radioMetros,IdUsuarios,latitudUsuario,latitudUsuario,longitudUsuario,radioMetros) {
    return new Promise((resolve, reject) => {
        const query = `SELECT IdUsuarios, IdDireccion,Direccion FROM ${tabla} u INNER JOIN ${tabla2} d ON u.IdDirec = d.IdDireccion 
        WHERE
        u.IdUsuarios = ? AND
        6371 * 2 * ASIN(SQRT(
            POWER(SIN(RADIANS(? - d.Latitud) / 2), 2) +
            COS(RADIANS(?)) * COS(RADIANS(d.Latitud)) *
            POWER(SIN(RADIANS(? - d.Longitud) / 2), 2)
        )) * 1000 <= ?
    
        UNION ALL
 
        SELECT IdUsuarios, IdDirecSecu,Direccion FROM ${tabla} u INNER JOIN ${tabla2} d ON u.IdDirecSecu = d.IdDireccion
        WHERE
        u.IdUsuarios = ? AND
            6371 * 2 * ASIN(SQRT(
                POWER(SIN(RADIANS(? - d.Latitud) / 2), 2) +
                COS(RADIANS(?)) * COS(RADIANS(d.Latitud)) *
                POWER(SIN(RADIANS(? - d.Longitud) / 2), 2)
            )) * 1000 <= ?;`;

        conexion.query(query, [IdUsuarios,latitudUsuario,latitudUsuario,longitudUsuario,radioMetros,IdUsuarios,latitudUsuario,latitudUsuario,longitudUsuario,radioMetros], (error, result) => {
            console.log(query)
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
 

module.exports = {

    agregar,
    todos,
    actualizar,
    query,
    queryMarca,
    queryMarcaMes,
    registrarFaltas,
    infoUno,
    registrarFaltas,
    obtenerTablaParametrizacion,
    usuarioYaMarcoHoy,
    actualizarMarca,
    CompararUbicacion,
    consultarMarcasDia
    
}