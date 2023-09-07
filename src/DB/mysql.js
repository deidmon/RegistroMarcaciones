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
        conexion.query(`SELECT * FROM ${tabla} WHERE idUsuarios=${id}`, (error, result) =>{
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
        console.log(consulta)
        conexion.query(`SELECT * FROM ${tabla} WHERE ?`, consulta, (error, result) =>{
            return error ? reject(error) : resolve(result[0]);
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
       
        conexion.query(`SELECT U.IdUsuario FROM ${tabla} U LEFT JOIN ${tabla2} R ON U.IdUsuario = R.IdUsuario AND
        DATE(R.Fecha) = CURDATE() WHERE R.IdUsuario IS NULL;)`, consulta, (error, result) =>{
            return error ? reject(error) : resolve(result[0]);
        })
    });
}

module.exports = {
    todos,
    uno,
    agregar,
    eliminar,
    query,
    registrarFaltas,
    infoUno
}