const mysql = require('mysql');
const config = require('../config');

const bdconfig = {
    host: config.mysql.host,
    user: config.mysql.user,
    password: config.mysql.password,
    database: config.mysql.database,
}
let conexion;

function conMysql() {
    conexion = mysql.createConnection(bdconfig);
    conexion.connect((err) => {
        if (err) {
            console.log('[db err]', err);
            setTimeout(conMysql, 200);
        } else {
            console.log('Db conectada')
        }
    });
    conexion.on('error', err => {
        console.log('[db err]', err);
        if (err.code == 'PROTOCOLO_CONNECTION_LOST') {
            conMysql();
        } else {
            throw err;
        }
    })
}
conMysql();

function allTypeMarking(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT idTMarcaciones AS "idTypesMarking", descripcion AS "description"  FROM ?? WHERE IdEstado = 1 ORDER BY idTypesMarking';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

/* 📌 Todos los trabajadores */
function queryAllWorkers(users, states, workModality, role, name, state1, state2, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `Select u.IdUsuarios, u.Nombres, u.Apellidos, e.Descripcion as Estado, u.Usuario, r.Nombre as Rol, m.Descripcion as Modalidad, u.IdHorarios 
        from ?? as u 
        inner join ?? as e ON u.Activo = e.IdEstado 
        inner join ?? as m ON u.IdModalidad = m.IdModalidad 
        inner join ?? as r ON u.IdRol = r.IdRol
        WHERE u.Nombres LIKE "%${name}%" AND u.Activo IN (?, ?)
        ORDER BY IdUsuarios ASC 
        LIMIT ? OFFSET ?
        `;
        const values = [users, states, workModality, role, state1, state2, limit, ofset];
        conexion.query(query, values, (error, result) => {
            return  error ? reject(error) : resolve(result);
        });
    });
}/* return db.queryAllWorkers(tableUser, tableStateUser, tableModalityWork, tableRol, body.name, body.IdEstateWorkerA ?? 0, body.IdEstateWorkerI ?? 1, PageSiize, getOffset); */

/* 📌 Todos los trabajadores Cantidad total */
function queryGetWorkersCounter(table1, name,  state1, state2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) AS totalRegistros
        FROM ?? j
        WHERE Nombres LIKE "%${name}%" AND Activo IN (?, ?)`;
        const values = [table1, state1, state2];
        conexion.query(query, values, (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            console.log(result);
            return resolve(result);
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

/* function cronjob(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ?? WHERE IdEstado = 1';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
} */
function queryAllSchedules(tabla) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
                h.IdHorarios,
                MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_ADD(h.HoraInicio, INTERVAL 5 MINUTE) END) AS HoraInicio,
                MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN h.HoraInicio END) AS HoraFin,
                h.IdDescanso,
                GROUP_CONCAT(distinct d.Día ORDER BY LEFT(d.Día, 1) DESC SEPARATOR ', ') AS Descanso
        FROM ?? AS h 
        INNER JOIN descansos AS d ON h.IdDescanso = d.IdDescansos
        GROUP BY h.IdHorarios, h.IdDescanso`;
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function querylistSchedule(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT DISTINCT IdHorarios FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result.map((row) => row.IdHorarios));
        });
    });
}

function cronjob(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ?? WHERE IdEstado = 1 AND idTMarcacion = ?';
        const values = [tabla, consulta];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}


function cronjobNotification(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ?? WHERE IdEstado = 1';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

function queryScheduleNotification(tabla) {
    return new Promise((resolve, reject) => {
        const query = `SELECT DISTINCT HoraInicio AS Hora FROM ?? WHERE IdValidacion = 1
         UNION SELECT DISTINCT ADDTIME(HoraInicio, "00:05:00") AS Hora FROM ?? 
         WHERE IdTipoMarcacion = 1 AND IdValidacion = 1 ORDER BY Hora`;
        const values = [tabla, tabla];

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

        conexion.query(query, values, (error, result) => {
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

function addJustification(tabla, data) {
    return new Promise((resolve, reject) => {

        const insertQuery = `INSERT INTO ?? SET ?`;
        const values = [tabla, data];

        conexion.query(insertQuery, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function queryUpdateAssists(tabla, consulta, IdAsistencias) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdAsistencias = ?`, [consulta, IdAsistencias], (error, result) => {
            if (error) {
                console.log(error)
                reject(error);
            } else {
                console.log(result);
                const actualizacionExitosa = result.changedRows > 0;
                console.log("asistencias: ",actualizacionExitosa)
                resolve(actualizacionExitosa);
            }
        })
    });
}

function update(tabla, consulta) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdUsuarios = ?`, [consulta, consulta.IdUsuarios], (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
}

/* 📌 Actualizar justificación */
function queryUpdateJustifactions(tabla, consulta, idJustificacion) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE idJustificacion = ?`, [consulta, idJustificacion], (error, result) => {
            console.log("error: ",error);
            console.log("resultado: ",result);
            return error ? reject(error) : resolve(result);
        })
    });
}

function query(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE ?`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    });
}

/* 📌 Optener justificación */
function queryGetJustifications(table1, table2, table3, table4, table5, table6, name,  state1, state2, state3, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT u.Nombres, u.Apellidos, j.IdEstadoJust, j.IdUsuario, j.Fecha, j.IdTMarcaciones,t.descripcion, e.Descripcion as estado, a.Hora, us.Nombres as Encargado
        FROM ?? j
        LEFT JOIN ?? u ON j.IdUsuario = u.IdUsuarios
        LEFT JOIN ?? us ON j.Updated_by = us.IdUsuarios
        LEFT JOIN ?? t ON j.IdTMarcaciones = t.IdTMarcaciones
        LEFT JOIN ?? e ON j.IdEstadoJust = e.IdEstadoJust
        LEFT JOIN ?? a ON j.IdUsuario = a.IdUsuarios AND j.Fecha = a.Fecha AND j.IdTMarcaciones = a.idTMarcacion 
        WHERE u.Nombres LIKE "%${name}%" AND j.IdEstadoJust IN (?, ?, ?)   
        ORDER BY j.Fecha DESC
        LIMIT ? OFFSET ?`;
        const values = [table1, table2, table3, table4, table5,table6, state1, state2, state3, limit, ofset];
        conexion.query(query, values, (error, result) => {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        });
    });
}
/* 📌 contador de justificaciónes */
function queryGetJustificationsCounter(table1, table2, name,  state1, state2, state3) {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS totalRegistros
        FROM ?? j
        LEFT JOIN ?? u ON j.IdUsuario = u.IdUsuarios
        WHERE u.Nombres LIKE "%${name}%" AND IdEstadoJust IN (?, ?, ?)`;
        const values = [table1, table2, state1, state2, state3];
        conexion.query(query, values, (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            console.log(result);
            return resolve(result);
        });
    });
}

/* 📌 Contador justificación pendientes*/
function queryGetJustificationsCounterPending(table1, state1) {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS totalRegistrosPendientes
        FROM ?? j
        WHERE IdEstadoJust = ?`;
        const values = [table1, state1];
        conexion.query(query, values, (error, result) => {
            if (error) {
                console.log(error);
                return reject(error);
            }
            console.log(result);
            return resolve(result);
        });
    });
}

function queryConsultTable(tabla, consult1, consult2, consult3) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE  ? AND  ? AND  ?`;
        const values = [tabla, consult1, consult2, consult3];
        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);

            } else {
                resolve(result);
            }
        })
    });
}

function queryModalityValidation(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE ? AND IdModalidad <> 1`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);

        })
    });
}

function queryMarkWeek(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT a.IdUsuarios AS "idUser",  a.Direccion AS "address", DATE_FORMAT(a.Fecha, '%Y-%m-%d') AS "date", 
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
                } else {
                    resolve(result);
                }
            }
        });
    });
}

function queryMarkMonth(tabla, tabla2, IdUsuario, Fecha, Fecha) {
    return new Promise((resolve, reject) => {
        const query = `            
            SELECT 
                v.idValidacion AS "idValidation",
                v.descripcion AS "description",
                COALESCE(COUNT(a.idValidacion), 0) AS "quantity"
            FROM ?? AS v
            LEFT JOIN (SELECT idValidacion
                    FROM ??
                    WHERE IdUsuarios = ?
                    AND idTMarcacion = 1
                    AND  YEAR(Fecha) = YEAR(?)
                    AND MONTH(Fecha) = MONTH(?)
                ) AS a ON v.idValidacion = a.idValidacion
            GROUP BY v.idValidacion, v.descripcion
            ORDER BY v.idValidacion
            `;

        const values = [tabla, tabla2, IdUsuario, Fecha, Fecha];
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

function queryMarkDay(tabla, tabla2, tabla3, tabla4, IdUsuario, Fecha) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT LOWER(TIME_FORMAT(STR_TO_DATE(a.Hora, '%H:%i:%s'), '%h:%i:%s %p')) AS 'time',a.idTMarcacion AS "idTypesMarking",t.descripcion AS 'typesMarking', a.idValidacion AS "idValidation", v.descripcion AS 'validation', j.Motivo AS 'reason'
            FROM ?? a 
            INNER JOIN ?? t ON a.idTMarcacion = t.idTMarcaciones 
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion 
            LEFT JOIN ?? j ON a.idTMarcacion = j.IdTMarcaciones AND a.IdUsuarios =j.IdUsuario AND a.Fecha = j.Fecha
            WHERE a.IdUsuarios = ? AND a.Fecha = ?
            ORDER BY idTypesMarking`;
        const values = [tabla, tabla2, tabla3, tabla4, IdUsuario, Fecha];

        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                if (result.length === 0) {
                    resolve()
                } else {
                    resolve(result);
                }
            }
        });
    });
}

function queryGetIdSchedule(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT u.IdHorarios FROM ?? AS u WHERE ?`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    });
}

function queryGetDaysOff(tabla, tabla2, tabla3, consulta) {
    return new Promise((resolve, reject) => {
        const query = `     
        SELECT d.IdDescansos, LOWER(d.Día) AS Día FROM ?? AS d WHERE d.IdDescansos =
        (SELECT h.IdDescanso FROM ?? AS h INNER JOIN ?? AS u ON 
            h.IdHorarios = u.IdHorarios WHERE ? LIMIT 1)`;
        const values = [tabla, tabla2, tabla3, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result.map((row) => row.Día));
        })
    });
}

function queryAddScheduleUser(tabla, consulta, consulta2) {
    return new Promise((resolve, reject) => {
        const query ='UPDATE ?? SET IdHorarios = ? WHERE IdUsuarios = ?'
        const values = [tabla, consulta, consulta2]
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);          
        })
    });
}
function queryGetDaysOffBySchedule(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        const query = `     
        SELECT d.IdDescansos, LOWER(d.Día) AS Día 
        FROM ?? AS d 
        WHERE d.IdDescansos = (SELECT  IdDescanso
						FROM ??
						Where ?
						group by IdHorarios);`;
        const values = [tabla, tabla2, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result.map((row) => row.Día)) ;
        })
    });
}


function recordFouls(tabla, tabla2, consulta) {
    return new Promise((resolve, reject) => {
        conexion.query(`SELECT DISTINCT U.IdUsuarios
                    FROM ${tabla} U
                    WHERE U.IdUsuarios NOT IN (
                        SELECT IdUsuarios
                        FROM ${tabla2}
                        WHERE DATE(Fecha) = CURDATE()
                        AND idTMarcacion = ?
                    ) AND U.IdRol = 2;`, consulta, (error, result) => {
            if (error) {
                reject(error);
            } else {
                const usuariosSinRegistro = result.map((row) => row.IdUsuarios);
                resolve(usuariosSinRegistro);
            }
        })
    });
}

/* U.IdRol = 2 */
// DATE_SUB(CURDATE(), INTERVAL 1 DAY)------------------------------------------------------------------------
function recordFoulsCronjob(tabla, tabla2, consulta, consulta2, consulta3) {
    return new Promise((resolve, reject) => {
        const query = `SELECT DISTINCT U.IdUsuarios
            FROM ?? U
            WHERE U.IdUsuarios NOT IN (
                SELECT DISTINCT IdUsuarios
                FROM ??
                WHERE Fecha = CURDATE()
                AND ?
                AND ?
                GROUP BY IdUsuarios
            ) 
            AND ?;`
        const values = [tabla, tabla2, consulta, consulta2, consulta3];
        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                const usuariosSinRegistro = result.map((row) => row.IdUsuarios);
                resolve(usuariosSinRegistro);
            }
        })
    });
}

function tokenUsersUnmarked(tabla, IdUsuarios) {
    return new Promise((resolve, reject) => {
        const query = `SELECT Token FROM ??  WHERE IdUsuarios IN (?)`;
        const values = [tabla, IdUsuarios];
        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {

                const tokenUsersUnmarked = result.map((row) => row.Token);
                /* console.log(tokenUsersUnmarked) */
                resolve(tokenUsersUnmarked);
            }
        });
    });
}

function getTableParametrization(tabla, tabla2, IdHorario, idTipoMarcaciones) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? AS h INNER JOIN  ?? AS t ON h.
        IdTipoMarcacion = t.idTMarcaciones WHERE h.IdHorarios = ? AND h.IdTipoMarcacion = ? `;

        const values = [tabla, tabla2, IdHorario, idTipoMarcaciones];
        conexion.query(query, values, (error, results) => {
            if (error) {
                return reject(error);
            }
            resolve(results);
        });
    });
}

function userAlreadyMarkedToday(tabla, IdUsuarios, fechaHoy, idTMarcacion) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ??  WHERE IdUsuarios = ? AND Fecha = ? AND idTMarcacion = ?`;
        const values = [tabla, IdUsuarios, fechaHoy, idTMarcacion];
        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result);
            }
        });
    });
}

function compareLocation(tabla, tabla2, IdUsuarios, latitudUsuario, latitudUsuario, longitudUsuario, radioMetros, IdUsuarios, latitudUsuario, latitudUsuario, longitudUsuario, radioMetros) {
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

        conexion.query(query, [IdUsuarios, latitudUsuario, latitudUsuario, longitudUsuario, radioMetros, IdUsuarios, latitudUsuario, latitudUsuario, longitudUsuario, radioMetros], (error, result) => {

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
    addJustification,
    allUsers,
    allTypeMarking,
    allTypeValidation,
    cronjobNotification,
    update,
    query,
    queryConsultTable,
    queryMarkWeek,
    queryMarkDay,
    queryMarkMonth,
    queryUpdateJustifactions,
    queryUpdateAssists,
    queryGetJustifications,
    queryGetJustificationsCounter,
    queryGetIdSchedule,
    queryGetDaysOff,
    queryAddScheduleUser,
    queryAllSchedules,
    querylistSchedule,
    queryGetDaysOffBySchedule,
    queryScheduleNotification,
    recordFouls,
    recordFoulsCronjob,
    tokenUsersUnmarked,
    cronjob,
    userInformation,
    getTableParametrization,
    userAlreadyMarkedToday,
    compareLocation,
    queryModalityValidation,
    queryAllWorkers,
    queryGetWorkersCounter,
    queryGetJustificationsCounterPending
}