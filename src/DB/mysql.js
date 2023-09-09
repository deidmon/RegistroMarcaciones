const mysql = require('mysql');
//const mysql = require('mysql2');
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
conMysql(); //usamos la funcion para la conectar
//funcion para optener todos los datos de la tabla
function todos(tabla){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla}`, (error, result) =>{
            return error ? reject(error) : resolve(result);  
        })
    });
}
//funcion para obtener todos un registro de la tabla
function uno(tabla, id){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT * FROM ${tabla} WHERE idUsuarios=${id}`, (error, result) =>{
            return error ? reject(error) : resolve(result);
        })
    });
}

function infoUno(tabla, id){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT IdUsuarios,Nombres,Apellidos, Activo,Usuario,IdRol FROM ${tabla} WHERE idUsuarios=${id}`, (error, result) =>{
            return error ? reject(error) : resolve(result);
        })
    });
}
//Funcion para agregar datos en la tabla
function agregar(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`INSERT INTO ${tabla} SET ? ON DUPLICATE KEY UPDATE ?`,[data, data] , (error, result) =>{
            return error ? reject(error) : resolve(result);
        })
    });
}
//Funcion para actualizar datos en la tabla marcacion
function actualizarMarca(tabla, consulta, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdUsuarios = ? AND Fecha = ? AND idTMarcacion = ?`,[consulta,data.IdUsuarios,data.Fecha,data.idTMarcacion], (error, result) =>{
            //return error ? reject(error) : resolve(result);
            if (error) {
                reject(error);
            } else {
                // Comprueba si se realizaron cambios
                const actualizacionExitosa = result.changedRows > 0;

                resolve(actualizacionExitosa);
            }
        })
    });
}
//Funcion para actualizar datos en la tabla 
function actualizar(tabla, consulta){
    return new Promise((resolve, reject)=>{
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdUsuarios = ?`,[consulta,consulta.IdUsuarios], (error, result) =>{
            return error ? reject(error) : resolve(result);
        })
    });
}
//Funcion para eliminar datos de la tabla 
function eliminar(tabla, data){
    return new Promise((resolve, reject)=>{
        conexion.query(`DELETE FROM ${tabla} WHERE id = ?`, data.id, (error, result) =>{
            return error ? reject(error) : resolve(result);
        })
    });
}
//Funcion para consultar datos de la tabla y comparar
 function query(tabla, consulta){
    return new Promise((resolve, reject)=>{
        //console.log(consulta)
        conexion.query(`SELECT * FROM ${tabla} WHERE ?`, consulta, (error, result) =>{
            return error ? reject(error) : resolve(result[0]);
        })
    });
} 
function queryMarca(tabla, consulta){
    return new Promise((resolve, reject)=>{
        //console.log(consulta)
        conexion.query(`SELECT * FROM ${tabla} WHERE ?`, consulta, (error, result) =>{
            if (error) {
                reject(error);
            } else {
                // Verificar si no hay filas para mostrar
                if (result.length === 0) {
                    resolve('No existen marcaciones para este usuario');
                } else {
                    resolve(result); // Resuelve con un array de resultados
                }
            };
        })
    });
} 

//------------------------------
/* function query(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const sql = `SELECT * FROM ${tabla} WHERE ?`;
        const values = [consulta]; // Coloca el objeto consulta en un arreglo
        
        console.log(values)
        
        conexion.execute(sql, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        });
    });
} */ 

//Funcion para Sacar los id de toda la tabla 
function registrarFaltas(tabla,tabla2, consulta){
    return new Promise((resolve, reject)=>{
        conexion.query(`SELECT U.IdUsuarios FROM ${tabla} U LEFT JOIN ${tabla2} R ON U.IdUsuarios = R.IdUsuarios AND DATE(R.Fecha) = CURDATE() WHERE R.IdUsuarios IS NULL`, consulta, (error, result) =>{
            if (error) {
                reject(error);
              } else {
                // Transforma los resultados en un arreglo
                const usuariosSinRegistro = result.map((row) => row.IdUsuarios);
                resolve(usuariosSinRegistro);
              }       

        })
    });
}

//Tabla de parametrizaciones
async function obtenerTablaParametrizacion(tabla) {
    try {
        const query = `SELECT * FROM ${tabla}`; // Consulta SQL para seleccionar todos los registros
        const [rows] = await db.query(query);
        return rows; // Retorna los datos de la tabla de parametrización
    } catch (error) {
        throw error;
    }
}
async function usuarioYaMarcoHoy(tabla,IdUsuarios, IdTipoMarcacion, fechaHoy) {
    try {
        const query = `SELECT * FROM ${tabla} WHERE IdUsuarios = ? AND IdTipoMarcacion = ? AND Fecha = ?`;
        const [rows] = await db.query(query, [IdUsuarios, IdTipoMarcacion, fechaHoy]);

        if (rows.length > 0) {
            return true; // El usuario ya marcó hoy con el mismo IdTipoMarcacion
        } else {
            return false; // El usuario no ha marcado hoy con el mismo IdTipoMarcacion
        }
    } catch (error) {
        throw error;
    }
}
 


module.exports = {
    todos,
    uno,
    agregar,
    actualizar,
    eliminar,
    query,
    queryMarca,
    registrarFaltas,
    infoUno,
    registrarFaltas,
    obtenerTablaParametrizacion,
    usuarioYaMarcoHoy,
    actualizarMarca
}