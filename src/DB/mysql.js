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

function allTypeMarking(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT idTMarcaciones AS "idTypesMarking", descripcion AS "description"  FROM ?? ORDER BY idTypesMarking';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function allTypeValidation(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT idValidacion AS "idValidation", descripcion AS "description" FROM ?? ORDER BY idValidation';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function allUsers(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function userInformation(tabla, tabla2, id) {
    return new Promise((resolve, reject) => {
        const query = `SELECT IdUsuarios AS "idUser", Nombres AS "names", Apellidos AS "lastNames", Activo AS "status", Usuario AS "user", IdRol AS 'idRole', IdDirec AS "idPrimaryAddress", d1.Direccion AS "primaryAddress", IdDirecSecu AS "idSecondaryAddress", d2.Direccion AS "secondaryAddress"
            FROM ?? u 
            INNER JOIN ?? d1 ON u.IdDirec = d1.IdDireccion 
            INNER JOIN ?? d2 ON u.IdDirecSecu = d2.IdDireccion 
            WHERE idUsuarios = ?`;

        const values = [tabla, tabla2, tabla2, id];
        
        conexion.query(query, values , (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        });
    });
}

function add(tabla, data) {
    return new Promise((resolve, reject) => {
        
        const insertQuery = `INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?`;
        const values = [tabla, data, data];

        conexion.query(insertQuery, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function queryUpdateAssists(tabla, consulta, data){
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

function update(tabla, consulta){
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

function queryMarkWeek(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.IdUsuarios AS "idUser", a.IdDirec AS "idAddress", d.Direccion AS "address", DATE_FORMAT(a.Fecha, '%Y-%m-%d') AS "date", 
            CASE DAYNAME(a.Fecha)
                WHEN 'Monday' THEN 'Lunes'
                WHEN 'Tuesday' THEN 'Martes'
                WHEN 'Wednesday' THEN 'Miércoles'
                WHEN 'Thursday' THEN 'Jueves'
                WHEN 'Friday' THEN 'Viernes'
                WHEN 'Saturday' THEN 'Sábado'
                WHEN 'Sunday' THEN 'Domingo'
                ELSE DAYNAME(a.Fecha)
            END AS "day", a.Hora AS "time",
            a.idTMarcacion AS "idTypesMarking", a.idValidacion AS "idValidation", v.descripcion AS "validation"
            FROM ?? a
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion
            LEFT JOIN direcciones d ON a.IdDirec = d.IdDireccion
            WHERE YEAR(a.Fecha) = YEAR(CURRENT_DATE())
                AND WEEK(a.Fecha) = WEEK(CURRENT_DATE())
                AND a.idTMarcacion = 1
                AND a.IdUsuarios = ?
            ORDER BY date`;

        const values = [tabla, tabla2, consulta];

        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.length === 0) {
                    resolve()
                    /* resolve('No existen marcaciones para este usuario90'); */
                } else {
                    resolve(result);
                }
            }
        });
    });
}

function queryMarkMonth(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.IdUsuarios AS "idUser", a.idValidacion AS "idValidation", v.descripcion AS "description", COUNT(*) AS "quantity"
            FROM ?? a
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion
            LEFT JOIN direcciones d ON a.IdDirec = d.IdDireccion
            WHERE YEAR(a.Fecha) = YEAR(CURRENT_DATE()) 
                AND MONTH(a.Fecha) = MONTH(CURRENT_DATE())
                AND a.idTMarcacion = 1
                AND a.IdUsuarios = ?
            GROUP BY v.idValidacion
            ORDER BY idValidation`;

        const values = [tabla, tabla2, consulta]; 
        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.length === 0) {
                    resolve()
                    /* resolve('No existen marcaciones para este usuario90'); */
                } else {
                    resolve(result);
                }
            }
        });
    });
}

function queryMarkDay (tabla, tabla2, tabla3, IdUsuario, Fecha) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT LOWER(TIME_FORMAT(STR_TO_DATE(a.Hora, '%H:%i:%s'), '%h:%i:%s %p')) AS 'time',a.idTMarcacion AS "idTypesMarking",t.descripcion AS 'typesMarking', a.idValidacion AS "idValidation", v.descripcion AS 'validation'
            FROM ?? a 
            INNER JOIN ?? t ON a.idTMarcacion = t.idTMarcaciones 
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion 
            WHERE a.IdUsuarios = ? AND a.Fecha = ?
            ORDER BY idTypesMarking`;
        const values = [tabla, tabla2, tabla3, IdUsuario, Fecha];

        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.length === 0) {
                    resolve()
                    /* resolve('No existen marcaciones para este usuario90'); */
                } else {
                    resolve(result);
                }
            }
            /* return error ? reject(error) : resolve(result); */
        });
    });
}

function recordFouls(tabla,tabla2, consulta){
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

function getTableParametrization(tabla,idTipoMarcaciones) {
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
function getTableParametrizationTypeMarking(tabla) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT idTipoMarcaciones, MIN(HoraInicio) AS "HoraInicio", MAX(HoraFin) AS "HoraFin"
            FROM ??
            GROUP BY idTipoMarcaciones;`;
        const values = [tabla];

        conexion.query(query, values, (error, results) => {
        if (error) {
                console.error("Error al obtener la tabla de parametrización:", error);
                return reject(error);
            }
            resolve(results);
        });
    });
}

function userAlreadyMarkedToday(tabla, IdUsuarios,fechaHoy,idTMarcacion) { 
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

function compareLocation(tabla,tabla2,IdUsuarios,latitudUsuario,latitudUsuario,longitudUsuario,radioMetros,IdUsuarios,latitudUsuario,latitudUsuario,longitudUsuario,radioMetros) {
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
            
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}
 
module.exports = {

    add,
    allUsers,
    allTypeMarking,
    allTypeValidation,
    update,
    query,
    queryMarkWeek,
    queryMarkDay,
    queryMarkMonth,
    recordFouls,
    userInformation,
    getTableParametrization,
    getTableParametrizationTypeMarking,
    userAlreadyMarkedToday,
    queryUpdateAssists,
    compareLocation,
    
    
}