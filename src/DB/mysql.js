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

/* 📌 Query generico para traer toda la infomación de una tabla */
function allInformationOfOneTable(table) {
    return new Promise((resolve, reject) => {
        const query = `SELECT t.*, e.Descripcion AS descriptionState
        FROM ?? t 
        INNER JOIN estados e ON e.IdEstado = t.IdEstado`;
        const values = [table];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Query para actualizar genérico */
function queryUpdateAnyTable(table, toUpdate, whereUpdate) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ? WHERE ?`;
        const values = [table, toUpdate, whereUpdate];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Obtener los tipos de marcación */
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
function queryAllWorkers(users, states, workModality, role, name, cip, dni, state1, state2, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `Select u.IdUsuarios, u.Nombres, u.Apellidos, u.Usuario, m.Descripcion as Modalidad, u.IdHorarios, 
        e.Descripcion as Estado, r.Nombre as Rol, a.idLider as idLeaderAsigned, l.Nombres as nameLeader, l.Apellidos as lastnameLeader
        from ?? as u 
        left join ?? as e ON u.Activo = e.IdEstado 
        left join ?? as m ON u.IdModalidad = m.IdModalidad 
        left join ?? as r ON u.IdRol = r.IdRol
        left join asignacionpersonal as a ON u.IdUsuarios = a.idUsuario
        left join usuarios AS l ON l.IdUsuarios = a.idLider
        WHERE u.Nombres LIKE "%${name}%" AND u.CIP LIKE "%${cip}%" AND u.DNI LIKE "%${dni}%" AND u.Activo IN (${state1}, ${state2})  
        ORDER BY IdUsuarios ASC 
        LIMIT ? OFFSET ?
        `;
        const values = [users, states, workModality, role, limit, ofset];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los trabajadores asignados a un lider*/
function queryAllWorkersByUser(users, states, workModality, role, name, cip, dni, state1, state2, limit, ofset, idWorkers) {
    return new Promise((resolve, reject) => {
        const query = `Select u.IdUsuarios, u.Nombres, u.Apellidos, e.Descripcion as Estado, u.Usuario, r.Nombre as Rol, m.Descripcion as Modalidad, u.IdHorarios 
        from ?? as u 
        inner join ?? as e ON u.Activo = e.IdEstado 
        inner join ?? as m ON u.IdModalidad = m.IdModalidad 
        inner join ?? as r ON u.IdRol = r.IdRol
        WHERE u.Nombres LIKE "%${name}%" AND u.CIP LIKE "%${cip}%" AND u.DNI LIKE "%${dni}%" 
        AND u.Activo IN (?, ?) 
        AND u.IdUsuarios IN(${idWorkers})  
        ORDER BY IdUsuarios ASC 
        LIMIT ? OFFSET ?
        `;
        const values = [users, states, workModality, role, state1, state2, limit, ofset];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los trabajadores cantidad total */
function queryGetWorkersCounter(table1, name, cip, dni, state1, state2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) AS totalRegistros
        FROM ?? j
        WHERE Nombres LIKE "%${name}%" AND CIP LIKE "%${cip}%" AND DNI LIKE "%${dni}%" AND Activo IN (${state1}, ${state2})`;
        const values = [table1];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Todos los trabajadores cantidad total por líder */
function queryGetWorkersCounterByUser(table1, name, cip, dni, state1, state2, idWorkers) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) AS totalRegistros
        FROM ?? j
        WHERE Nombres LIKE "%${name}%" AND CIP LIKE "%${cip}%" AND DNI LIKE "%${dni}%" AND Activo IN (?, ?)  AND j.IdUsuarios IN(${idWorkers}) `;
        const values = [table1, state1, state2];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Todos los tipos de validación */
function allTypeValidation(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT idValidacion AS "idValidation", descripcion AS "description" FROM ?? ORDER BY idValidation';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Obtener todos los usuarios */
function allUsers(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 ... */
function queryGroupedModules(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            /* return error ? reject(error) : resolve(result); */
            if (error) {
                return reject(error);
            }

            // Agrupar por nombre
            let grouped = {};
            result.forEach(item => {
                if (!grouped[item.nombre]) {
                    grouped[item.nombre] = [];
                }
                grouped[item.nombre].push(item.descripcion);
            });

            // Formatear la respuesta
            let formatted = Object.keys(grouped).map(key => {
                return {
                    IdModulo: grouped[key][0].IdModulo,
                    nombre: key,
                    descripcion: grouped[key]
                };
            });

            return resolve(formatted)
        });
    });
};

/* 📌 Obtener todos los modulos */
function queryAllModules(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Actuivar o desactivar usuarios */
function queryActivateUsers(tabla, status, users) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET Activo = ? WHERE IdUsuarios IN (?)`;
        const values = [tabla, status, users];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Obtener permisos por modulo */
function queryPermissionByModule(tabla, idModule) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ?? WHERE idModulo = ?';
        const values = [tabla, idModule];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Obtener permisos por perfiles */
function queryPermissionByProfile(tabla, tabla2, idProfile, idModule) {
    return new Promise((resolve, reject) => {
        const query = `SELECT pp.idPerfil, pp.idModulo, pp.idPermiso, p.nombre 
        FROM ?? pp INNER JOIN ?? p ON pp.idModulo = p.idModulo 
        AND pp.idPermiso = p.idPermiso 
        WHERE pp.idPerfil = ? AND p.idModulo = ?`;
        const values = [tabla, tabla2, idProfile, idModule];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Obtener todos los perfiles */
function queryAllProfiles(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Activar o desactivar perfil */
function queryActivateProfile(tabla, status, profiles) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET idEstado = ? WHERE idPerfil IN (?)`;
        const values = [tabla, status, profiles];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Eliminar permisos del perfil */
function queryDeletePermissions(tabla, profile, module) {
    return new Promise((resolve, reject) => {
        const query = `DELETE FROM ?? WHERE idPerfil = ? AND idModulo = ?`;
        const values = [tabla, profile, module];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 ... */
function queryLastSchedule(tabla, profile, module) {
    return new Promise((resolve, reject) => {
        const query = `SELECT idHorarios FROM ?? GROUP BY idHorarios ORDER BY idHorarios DESC LIMIT 1`;
        const values = [tabla, profile, module];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0].idHorarios);
        });
    });
};

/* 📌Último id horario excepción */
function queryLastScheduleException(tabla, profile, module) {
    return new Promise((resolve, reject) => {
        const query = `SELECT IdExcepcion FROM ?? GROUP BY IdExcepcion ORDER BY IdExcepcion DESC LIMIT 1`;
        const values = [tabla, profile, module];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0].IdExcepcion);
        });
    });
};

/* 📌 Para actualizar horario */
function queryUpdateSchedule(tabla, consulta, consulta2, consulta3, consulta4) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ? WHERE IdHorarios = ? AND IdTipoMarcacion = ? AND IdValidacion = ?`;
        const values = [tabla, consulta, consulta2, consulta3, consulta4];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Para activar o desactivar horario */
function queryActivateSchedule(tabla, status, schedules) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET IdEstado = ? WHERE IdHorarios IN (?)`;
        const values = [tabla, status, schedules];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 ... */
function queryUsersWithSchedule(tabla, schedules) {
    return new Promise((resolve, reject) => {
        const query = `SELECT EXISTS( SELECT 1 FROM ?? WHERE IdHorarios IN (?) LIMIT 1 ) AS existe_usuario;`;
        const values = [tabla, schedules];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0].existe_usuario);
        });
    });
};

/* 📌 Chequear el tiempo de permiso */
function queryCheckTimePermission(tabla, consult1, consult2, consult3) {
    return new Promise((resolve, reject) => {
        const query = `SELECT IFNULL((SELECT tiempoPermiso FROM ?? WHERE idTipoSolicitud = ? AND idUsuario = ? AND FechaPermiso = ? LIMIT 1), 0) AS tiempoPermiso`;
        const values = [tabla, consult1, consult2, consult3];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0].tiempoPermiso);

        });
    });
};

/* 📌 Chequear si tiene permisos */
function queryCheckPermission(tabla, consult1, consult2, consult3) {
    return new Promise((resolve, reject) => {
        const query = `SELECT EXISTS((SELECT idTipoSolicitud FROM ?? WHERE idTipoSolicitud = ? AND idUsuario = ? AND  ? LIMIT 1)) AS idTipoSolicitud`;
        const values = [tabla, consult1, consult2, consult3];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0].idTipoSolicitud);
        });
    });
};

/* 📌 Obtener la lista de permisos */
function queryListPermissions(tabla, tabla2, consulta, consulta2) {
    return new Promise((resolve, reject) => {
        const query = `SELECT ts.idSolicitud, ts.descripcion, ts.idEstado,e.Descripcion
        FROM ?? AS ts INNER JOIN ?? as e ON ts.idEstado = e.IdEstado
        WHERE  FIND_IN_SET(ts.IdEstado, COALESCE(?, (SELECT GROUP_CONCAT(ts.IdEstado) FROM ??))) > 0
        AND FIND_IN_SET(ts.idSolicitud, COALESCE(?, (SELECT GROUP_CONCAT(ts.idSolicitud) FROM ??))) > 0`;
        const values = [tabla, tabla2, consulta, tabla, consulta2, tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
}

/* 📌 Actualizar permisos*/
function queryUpdatePermission(tabla, consulta, idJustificacion) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ? WHERE id = ?`;
        const values = [tabla, consulta, idJustificacion];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Optener justificación */
function queryGetPermissions(table1, table2, table3, table4, table5, table6, table7, name, state1, state2, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT s.IdUsuario, u.CIP, CONCAT(u.Nombres, ' ', u.Apellidos) AS NombreCompleto, DATE_FORMAT(s.Fecha, '%Y-%m-%d') AS Fecha,s.Motivo, s.idTMarcaciones,t.descripcion, ts.descripcion, s.estadoSolicitudF,ef.descripcion as estado, s.estadoSolicitudS, es.descripcion,us.Nombres as Encargado, ap.idLider, l.idUsuario
        FROM  ?? s
        LEFT JOIN ??  u ON s.idUsuario = u.IdUsuarios
        LEFT JOIN ?? us ON s.Updated_byF = us.IdUsuarios
        LEFT JOIN  ?? t ON s.idTMarcaciones = t.IdTMarcaciones
        INNER JOIN ?? ef ON s.estadoSolicitudF = ef.idEstadoSolicitud
        LEFT JOIN  ?? es on s.estadoSolicitudS = es.idEstadoSolicitud
        INNER JOIN ?? ts ON s.idTipoSolicitud = ts.idSolicitud
        LEFT JOIN ?? ap ON s.idUsuario = ap.idUsuario
        LEFT JOIN ?? l ON ap.idLider = l.idLider
        WHERE u.Nombres LIKE "%${name}%" AND s.estadoSolicitudF IN (1, 2, 3,4,5,6)   
        AND l.idUsuario = ?
        AND FIND_IN_SET(s.estadoSolicitudF, COALESCE(?, (SELECT GROUP_CONCAT(s.estadoSolicitudF) FROM ??))) > 0
        ORDER BY s.id 
        LIMIT ? OFFSET ?`;
        const values = [table1, table2, table2, table3, table4, table4, table5, table6, table7, state1, state2, table4, limit, ofset];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 ... */
function queryMarkDay2(tabla, tabla2, tabla3, tabla4, IdUsuario, Fecha) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT DISTINCT LOWER(TIME_FORMAT(STR_TO_DATE(a.Hora, '%H:%i:%s'), '%h:%i:%s %p')) AS 'time',a.idTMarcacion AS "idTypesMarking",t.descripcion AS 'typesMarking', a.idValidacion AS "idValidation", v.descripcion AS 'validation', j.Motivo AS 'reason'
            FROM ?? a 
            INNER JOIN ?? t ON a.idTMarcacion = t.idTMarcaciones 
            INNER JOIN ?? v ON a.idValidacion = v.idValidacion 
            LEFT JOIN ?? s ON a.idTMarcacion = s.idTMarcaciones AND a.IdUsuarios =s.idUsuario AND a.Fecha = s.Fecha
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
};

/* 📌 Obtener horario por usuario*/
function queryScheduleByUser(table1, table2, consult1) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
                h.IdHorarios,
                MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_FORMAT(DATE_ADD(h.HoraInicio, INTERVAL 15 MINUTE), '%H:%i') END) AS HoraInicio,
                MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN DATE_FORMAT(h.HoraInicio,'%H:%i') END) AS HoraFin,
                h.IdDescanso,
                GROUP_CONCAT(distinct d.Día ORDER BY LEFT(d.Día, 1) DESC SEPARATOR ', ') AS Descanso
        FROM ?? AS h 
        INNER JOIN ?? AS d ON h.IdDescanso = d.IdDescansos
        WHERE h.IdHorarios = ?
        GROUP BY h.IdHorarios, h.IdDescanso`;
        const values = [table1, table2, consult1];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        });
    });
};

/* 📌 Obtener todos los horarios */
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
};

/* 📌 Obtener todos los horarios incluyendo excepciones */
function queryAllSchedulesFilter(tabla, tabla2, tabla3, consult, tabla4,consult2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT 
                h.IdHorarios,
                MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_ADD(h.HoraInicio, INTERVAL 5 MINUTE) END) AS HoraInicio,
                MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN h.HoraInicio END) AS HoraFin,
                h.IdDescanso,
                GROUP_CONCAT(distinct d.Día ORDER BY LEFT(d.Día, 1) DESC SEPARATOR ', ') AS Descanso,
                h.diaExcepcion AS IdDiaExcepcion, de.Día AS DiaExcepcion, h.IdExcepcion, exc.HoraInicio_Excepcion, exc.HoraFin_Excepcion, h.IdEstado
        FROM ?? AS h LEFT JOIN ?? AS de ON h.diaExcepcion = de.IdDescansos
        LEFT JOIN (SELECT 
            ex.IdExcepcion,
            MIN(CASE WHEN ex.IdTipoMarcacion = 1 AND ex.IdValidacion = 1 THEN DATE_ADD(ex.HoraInicio, INTERVAL 15 MINUTE) END) AS HoraInicio_Excepcion,
            MAX(CASE WHEN ex.IdTipoMarcacion = 4 AND ex.IdValidacion = 1 THEN ex.HoraInicio END) AS HoraFin_Excepcion
        FROM ?? AS ex 
        GROUP BY ex.IdExcepcion) AS exc ON h.IdExcepcion = exc.IdExcepcion
        INNER JOIN ?? AS d ON h.IdDescanso = d.IdDescansos
        WHERE  FIND_IN_SET(h.IdEstado, COALESCE(?, (SELECT GROUP_CONCAT(IdEstado) FROM ??))) > 0
        AND  FIND_IN_SET(h.IdHorarios, COALESCE(?, (SELECT GROUP_CONCAT(h.IdHorarios) FROM ??))) > 0
        GROUP BY h.IdHorarios, h.IdDescanso`;
        const values = [tabla, tabla2, tabla3, tabla2, consult,tabla4, consult2, tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
            /* if (error) {
                console.log(error);
                return reject(error);
            }
            console.log(result);
            return resolve(result); */
        });
    });
};

/* 📌 ... */
function querylistSchedule(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT DISTINCT IdHorarios FROM ??';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result.map((row) => row.IdHorarios));
        });
    });
};

/* 📌 ... */
function cronjob(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ?? WHERE IdEstado = 1 AND idTMarcacion = ?';
        const values = [tabla, consulta];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 ... */
function cronjobNotification(tabla) {
    return new Promise((resolve, reject) => {
        const query = 'SELECT * FROM ?? WHERE IdEstado = 1';
        const values = [tabla];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 ... */
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
};

/* 📌 Información del usuario */
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
};

/* 📌 ... */
function add(tabla, data) {
    return new Promise((resolve, reject) => {

        const insertQuery = `INSERT INTO ?? SET ? ON DUPLICATE KEY UPDATE ?`;
        const values = [tabla, data, data];

        conexion.query(insertQuery, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Para añadir solicitud de justificación */
function addJustification(tabla, data) {
    return new Promise((resolve, reject) => {

        const insertQuery = `INSERT INTO ?? SET ?`;
        const values = [tabla, data];

        conexion.query(insertQuery, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Para el reporte diario */
function queryReportAsistance(tabla, tabla2, tabla3, consult1, consult2) {
    return new Promise((resolve, reject) => {
        const query =
            `SELECT  tm.descripcion as Marcación ,CIP,DATE_FORMAT(Fecha, '%Y%m%d') as Fecha, LPAD(HOUR(Hora), 2, '0') AS Hora,
                LPAD( MINUTE(Hora), 2, '0') AS Minutos, 27 AS Código_Local, concat(CIP, DATE_FORMAT(Fecha, '%Y%m%d'),LPAD(HOUR(Hora), 2, '0'), 
                LPAD( MINUTE(Hora), 2, '0'), "27") AS TXT, length(concat(CIP, DATE_FORMAT(Fecha, '%Y%m%d'),LPAD(HOUR(Hora), 2, '0'), 
                LPAD( MINUTE(Hora), 2, '0') , "27")) AS Longitud
        FROM ?? AS a INNER JOIN ?? as u ON a.IdUsuarios = u.IdUsuarios INNER JOIN ?? as tm ON a.idTMarcacion = tm.idTMarcaciones
        WHERE a.Fecha BETWEEN ? AND ?
        AND idTMarcacion IN (1,4)
        ORDER BY Fecha DESC, a.IdUsuarios, tm.descripcion`;
        const values = [tabla, tabla2, tabla3, consult1, consult2];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Actualizar tabla de asistencia, solo el tipo de validación a autorizado o rechazado */
function queryUpdateAssists(tabla, consulta, IdAsistencias) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdAsistencias = ?`, [consulta, IdAsistencias], (error, result) => {
            if (error) {
                console.log(error)
                reject(error);
            } else {
                console.log(result);
                const actualizacionExitosa = result.changedRows > 0;
                console.log("asistencias: ", actualizacionExitosa)
                resolve(actualizacionExitosa);
            }
        })
    });
};

/* 📌 ... */
function update(tabla, consulta) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE IdUsuarios = ?`, [consulta, consulta.IdUsuarios], (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Actualizar justificación */
function queryUpdateJustifactions(tabla, consulta, idJustificacion) {
    return new Promise((resolve, reject) => {
        conexion.query(`UPDATE ${tabla} SET ? WHERE idJustificacion = ?`, [consulta, idJustificacion], (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 ... */
function query(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE ?`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0] || []);

        })
    });
};

/* 📌 Optener justificación */
function queryGetJustifications(table1, table2, table3, table4, table5, table6, name, state1, state2, state3, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT u.CIP, CONCAT(u.Nombres, ' ', u.Apellidos) AS NombreCompleto, j.IdEstadoJust, j.IdUsuario, DATE_FORMAT(j.Fecha, '%Y-%m-%d') AS Fecha,j.Motivo, j.IdTMarcaciones,t.descripcion, e.Descripcion as estado, a.Hora, us.Nombres as Encargado
        FROM ?? j
        LEFT JOIN ?? u ON j.IdUsuario = u.IdUsuarios
        LEFT JOIN ?? us ON j.Updated_by = us.IdUsuarios
        LEFT JOIN ?? t ON j.IdTMarcaciones = t.IdTMarcaciones
        LEFT JOIN ?? e ON j.IdEstadoJust = e.IdEstadoJust
        LEFT JOIN ?? a ON j.IdUsuario = a.IdUsuarios AND j.Fecha = a.Fecha AND j.IdTMarcaciones = a.idTMarcacion 
        WHERE u.Nombres LIKE "%${name}%" AND j.IdEstadoJust IN (?, ?, ?)   
        ORDER BY j.Fecha DESC, a.Hora desc, u.IdUsuarios
        LIMIT ? OFFSET ?`;
        const values = [table1, table2, table3, table4, table5, table6, state1, state2, state3, limit, ofset];
        conexion.query(query, values, (error, result) => {
            if (error) {
                return reject(error);
            }
            return resolve(result);
        });
    });
};

/* 📌 contador de justificaciónes */
function queryGetJustificationsCounter(table1, table2, name, state1, state2, state3) {
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
};

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
};

/* 📌 ... */
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
};

/* 📌 saber que modalidad tiene el usuario */
function queryModalityValidation(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? WHERE ? AND IdModalidad <> 1`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);

        })
    });
};

/* 📌 Para obtener el registro de la semana */
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

/* 📌 Para obtener el registro del mes */
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
};

/* 📌 Para obtener el registro del día */
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
};

/* 📌 Para obtener el id del horario */
function queryGetIdSchedule(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT u.IdHorarios FROM ?? AS u WHERE ?`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    });
};

/* 📌 Para saber si ese horario tiene excepción */
function queryGetIdException(tabla, consulta) {
    return new Promise((resolve, reject) => {
        const query = `SELECT h.IdExcepcion FROM ?? AS h WHERE ? GROUP BY IdHorarios`;
        const values = [tabla, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0]);
        })
    });
};

/* 📌 Para saber los días libres */
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
};

/* 📌 Para saber si tiene un horario diferente durante la semana */
function queryGetExceptionDays(tabla, tabla2, tabla3, consulta) {
    return new Promise((resolve, reject) => {
        const query = `     
        SELECT d.IdDescansos, LOWER(d.Día) AS Día FROM ?? AS d WHERE d.IdDescansos =
        (SELECT h.diaExcepcion FROM ?? AS h INNER JOIN ?? AS u ON 
            h.IdHorarios = u.IdHorarios WHERE ? LIMIT 1)`;
        const values = [tabla, tabla2, tabla3, consulta];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result.map((row) => row.Día));
        })
    });
};

/* 📌 Para añadir horario a un usuario */
function queryAddScheduleUser(tabla, consulta, consulta2) {
    return new Promise((resolve, reject) => {
        const query = 'UPDATE ?? SET IdHorarios = ? WHERE IdUsuarios = ?'
        const values = [tabla, consulta, consulta2]
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Obtener dias de cada horario */
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
            return error ? reject(error) : resolve(result.map((row) => row.Día));
        })
    });
};

/* 📌 Guardar en la tabla de asistencias quienes no marcaron ni entrada ni salida */
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
};

/* U.IdRol = 2 */
// DATE_SUB(CURDATE(), INTERVAL 1 DAY)------------------------------------------------------------------------
/* 📌 Guardar en la tabla de asistencias quienes no marcaron ni entrada ni salida*/
function recordFoulsCronjob(tabla, tabla2, consulta, consulta2, consulta3) {
    return new Promise((resolve, reject) => {
        const query = `SELECT DISTINCT U.IdUsuarios
            FROM ?? U
            WHERE U.IdUsuarios NOT IN (
                SELECT DISTINCT IdUsuarios
                FROM ??
                WHERE Fecha = DATE_SUB(CURDATE(), INTERVAL 1 DAY)
                AND ?
                AND ?
                GROUP BY IdUsuarios
            )
            AND U.IdRol = 2 
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
};

/* 📌 Obtener token de usuarios que aun no registran asistencia para notificarlos*/
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
};

/* 📌 Obtener la tabla de horarios */
function getTableParametrization(tabla, tabla2, IdHorario, idTipoMarcaciones) {
    return new Promise((resolve, reject) => {
        const query = `SELECT * FROM ?? AS h INNER JOIN  ?? AS t ON h.
        IdTipoMarcacion = t.idTMarcaciones WHERE ? AND h.IdTipoMarcacion = ? `;

        const values = [tabla, tabla2, IdHorario, idTipoMarcaciones];
        conexion.query(query, values, (error, results) => {
            return error ? reject(error) : resolve(results);
        });
    });
};

/* 📌 Revisa si el usuario ya registro su asistencia previamente */
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
};

/* 📌 Comparar la localizacion y si coincide dejara registrar la asistencia(solo modalidad presencial) */
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

/* 📌 Verificar si tiene permiso */
function queryCheckPermissionAllDay(table, user, date) {
    return new Promise((resolve, reject) => {
        const query = `SELECT id, COUNT(*) as count FROM ?? WHERE IdUsuario = ? AND idTipoSolicitud = 2 AND FechaPermiso = ? AND estadoSolicitudF = 2 `;
        const values = [table, user, date];

        conexion.query(query, values, (error, result) => {
            if (error) {
                reject(error);
            } else {
                const tienePermiso = result[0].count > 0;
                resolve(tienePermiso);
            }
        });
    });
};

/* 📌 Verificar vacaciones */
function queryCheckVacation(table, consult) {
    return new Promise((resolve, reject) => {
        const query = `SELECT FechaDesde, FechaHasta, COUNT(*) as count FROM ?? WHERE IdUsuario = ? AND idTipoSolicitud = 3 AND estadoSolicitudF = 2`;
        const values = [table, consult];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Todos los requerimientos de un trabajador*/
function queryAllRequestOfUser(idUser, typeRequest, stateInProgress, stateApprovedByLeader, stateRejectedByLeader, stateInProgressRRHH, stateAprovedByRRHH, stateRejectedByRRHH, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT s.id, s.idTipoSolicitud, s.idUsuario, s.Fecha, s.FechaPermiso, s.FechaDesde, s.FechaHasta, s.idTMarcaciones, s.Motivo, s.estadoSolicitudF, s.estadoSolicitudS, s.Updated_byF, s.Updated_byS, s.tiempoPermiso, t.descripcion AS descripcionTipoSolicitud, e.descripcion AS descripcionEstadoSolicitud, tipo.descripcion AS descripcionTipoMarcacion
        from solicitudes as s 
        INNER JOIN tiposolicitudes AS t ON t.idSolicitud = s.idTipoSolicitud
        INNER JOIN estadosolicitudes AS e ON e.idEstadoSolicitud = s.estadoSolicitudF
        LEFT JOIN tipomarcaciones AS tipo ON tipo.idTMarcaciones = s.idTMarcaciones
        WHERE idUsuario = ${idUser}  AND idTipoSolicitud IN(${typeRequest}) AND estadoSolicitudF IN (${stateInProgress}, ${stateApprovedByLeader}, ${stateRejectedByLeader}, ${stateInProgressRRHH}, ${stateAprovedByRRHH}, ${stateRejectedByRRHH})
        ORDER BY idTipoSolicitud ASC 
        LIMIT ? OFFSET ?`;
        const values = [limit, ofset];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los requerimientos de un trabajador - contador*/
function queryAllRequestOfUserCounter(idUser, typeRequest, stateInProgress, stateApprovedByLeader, stateRejectedByLeader, stateInProgressRRHH, stateAprovedByRRHH, stateRejectedByRRHH) {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS totalRecords
        from solicitudes as s 
        WHERE idUsuario = ${idUser}  AND idTipoSolicitud IN(${typeRequest}) AND estadoSolicitudF IN (${stateInProgress}, ${stateApprovedByLeader}, ${stateRejectedByLeader}, ${stateInProgressRRHH}, ${stateAprovedByRRHH}, ${stateRejectedByRRHH})`
        const values = [];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Obtener los id de trabajadores que tiene asignado un lider*/
function queryGetIdAsignedToLeader(idLeader) {
    return new Promise((resolve, reject) => {
        const query = `SELECT idUsuario FROM asignacionpersonal
        WHERE idLider = ${idLeader} `
        const values = [];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los requerimientos de los trabajadores asignados al un lider*/
function queryAllRequestOfUserAsignedToLeader(idWorkers, filterName, filterCIP, filterDNI, typeRequest, stateInProgress,
    stateApprovedByLeader, stateRejectedByLeader, stateInProgressRRHH, stateAprovedByRRHH, stateRejectedByRRHH, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT s.id, s.idTipoSolicitud, s.idUsuario, s.Fecha, s.FechaPermiso, s.FechaDesde, s.FechaHasta,
        s.idTMarcaciones, s.Motivo, s.estadoSolicitudF, s.estadoSolicitudS, s.Updated_byF, s.Updated_byS, s.tiempoPermiso,
        t.descripcion AS descripcionTipoSolicitud, e.descripcion AS descripcionEstadoSolicitud, tipo.descripcion AS descripcionTipoMarcacion,
        u.Nombres AS NombreActualizadoPorF, u.Apellidos AS ApellidosActualizadoPorF,  userf.Nombres AS NombreActualizadoPorS,
        userf.Apellidos AS ApellidosActualizadoPorS, users.Nombres AS nombreTrabajador,
        users.Apellidos AS ApellidosTrabajador, users.DNI, asist.Hora
        FROM solicitudes as s 
        LEFT JOIN tiposolicitudes AS t ON t.idSolicitud = s.idTipoSolicitud
        LEFT JOIN estadosolicitudes AS e ON e.idEstadoSolicitud = s.estadoSolicitudF
        LEFT JOIN tipomarcaciones AS tipo ON tipo.idTMarcaciones = s.idTMarcaciones
        LEFT JOIN usuarios AS u ON u.IdUsuarios = s.Updated_byF
        LEFT JOIN usuarios AS userf ON userf.IdUsuarios = s.Updated_byS
        LEFT JOIN usuarios AS users ON users.IdUsuarios = s.idUsuario
        LEFT JOIN asistencias AS asist ON asist.IdUsuarios = s.idUsuario AND asist.Fecha = s.Fecha AND asist.idTMarcacion = s.idTMarcaciones	
        WHERE idUsuario IN(${idWorkers}) 
        AND users.Nombres LIKE "%${filterName}%" AND users.CIP LIKE "%${filterCIP}%" AND users.DNI LIKE "%${filterDNI}%" 
        AND idTipoSolicitud IN(${typeRequest}) 
        AND estadoSolicitudF IN (${stateInProgress}, ${stateApprovedByLeader}, ${stateRejectedByLeader}, ${stateInProgressRRHH}, ${stateAprovedByRRHH}, ${stateRejectedByRRHH})
        ORDER BY idTipoSolicitud ASC 
        LIMIT ? OFFSET ?`
        const values = [limit, ofset];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los requerimientos de los trabajadores asignados al un lider - contador*/
function queryAllRequestOfUserAsignedToLeaderCounter(idWorkers, filterName, filterCIP, filterDNI, typeRequest, stateInProgress, stateApprovedByLeader, stateRejectedByLeader, stateInProgressRRHH, stateAprovedByRRHH, stateRejectedByRRHH) {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS totalRecords
        from solicitudes as s 
        LEFT JOIN usuarios AS users ON users.IdUsuarios = s.idUsuario
        WHERE idUsuario IN (${idWorkers})  
        AND users.Nombres LIKE "%${filterName}%" AND users.CIP LIKE "%${filterCIP}%" AND users.DNI LIKE "%${filterDNI}%"
        AND idTipoSolicitud IN(${typeRequest}) AND estadoSolicitudF IN (${stateInProgress}, ${stateApprovedByLeader}, ${stateRejectedByLeader}, ${stateInProgressRRHH}, ${stateAprovedByRRHH}, ${stateRejectedByRRHH})`
        const values = [];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los requerimientos de los trabajadores para vista de RRHH*/
function queryAllRequestOfUserToRRHH(typeRequest, filterName, filterCIP, filterDNI, stateInProgress, stateApprovedByLeader, stateRejectedByLeader, stateInProgressRRHH, stateAprovedByRRHH, stateRejectedByRRHH, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT s.id, s.idTipoSolicitud, s.idUsuario, s.Fecha, s.FechaPermiso, s.FechaDesde, s.FechaHasta,
        s.idTMarcaciones, s.Motivo, s.estadoSolicitudF, s.estadoSolicitudS, s.Updated_byF, s.Updated_byS, s.tiempoPermiso,
        t.descripcion AS descripcionTipoSolicitud, e.descripcion AS descripcionEstadoSolicitud,
        tipo.descripcion AS descripcionTipoMarcacion,  u.Nombres AS NombreActualizadoPorF, 
        u.Apellidos AS ApellidosActualizadoPorF,  userf.Nombres AS NombreActualizadoPorS, userf.Apellidos AS ApellidosActualizadoPorS,
        users.Nombres AS nombreTrabajador, users.Apellidos AS ApellidosTrabajador,
        users.DNI, asist.Hora
        FROM solicitudes as s 
        LEFT JOIN tiposolicitudes AS t ON t.idSolicitud = s.idTipoSolicitud
        LEFT JOIN estadosolicitudes AS e ON e.idEstadoSolicitud = s.estadoSolicitudF
        LEFT JOIN tipomarcaciones AS tipo ON tipo.idTMarcaciones = s.idTMarcaciones
        LEFT JOIN usuarios AS u ON u.IdUsuarios = s.Updated_byF
        LEFT JOIN usuarios AS userf ON userf.IdUsuarios = s.Updated_byS
        LEFT JOIN usuarios AS users ON users.IdUsuarios = s.idUsuario
        LEFT JOIN asistencias AS asist ON asist.IdUsuarios = s.idUsuario AND asist.Fecha = s.Fecha AND asist.idTMarcacion = s.idTMarcaciones	
        WHERE idTipoSolicitud IN(${typeRequest}) 
        AND users.Nombres LIKE "%${filterName}%" AND users.CIP LIKE "%${filterCIP}%" AND users.DNI LIKE "%${filterDNI}%"
        AND estadoSolicitudF IN (${stateInProgress}, ${stateApprovedByLeader}, ${stateRejectedByLeader}, ${stateInProgressRRHH}, ${stateAprovedByRRHH}, ${stateRejectedByRRHH})
        ORDER BY idTipoSolicitud ASC 
        LIMIT ? OFFSET ?`
        const values = [limit, ofset];
        conexion.query(query, values, (error, result) => {
            console.log(error);
            console.log(result);
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los requerimientos de los trabajadores para vista de RRHH - contador*/
function queryAllRequestOfUserToRRHHCounter(typeRequest, filterName, filterCIP, filterDNI, stateInProgress, stateApprovedByLeader, stateRejectedByLeader, stateInProgressRRHH, stateAprovedByRRHH, stateRejectedByRRHH) {
    return new Promise((resolve, reject) => {
        const query = `SELECT COUNT(*) AS totalRecords
        FROM solicitudes as s 
        LEFT JOIN usuarios AS users ON users.IdUsuarios = s.idUsuario
        WHERE idTipoSolicitud IN(${typeRequest}) 
        AND users.Nombres LIKE "%${filterName}%" AND users.CIP LIKE "%${filterCIP}%" AND users.DNI LIKE "%${filterDNI}%"
        AND estadoSolicitudF IN (${stateInProgress}, ${stateApprovedByLeader}, ${stateRejectedByLeader}, ${stateInProgressRRHH}, ${stateAprovedByRRHH}, ${stateRejectedByRRHH})`
        const values = [];
        conexion.query(query, values, (error, result) => {
            console.log(error);
            console.log(result);
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Aceptar o rechazar solicitudes */
function queryManagementOfRequests(tabla, consult, whereConsult) {
    return new Promise((resolve, reject) => {
        const query = `UPDATE ?? SET ? WHERE id IN(?)`;
        const values = [tabla, consult, whereConsult];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Para saber que rol tiene el trabajador */
function queryToKnowWhatRolIs(consult) {
    return new Promise((resolve, reject) => {
        const query = `SELECT IdRol FROM usuarios WHERE IdUsuarios = ?`;
        const values = [consult];
        conexion.query(query, values, (error, result) => {
            return error ?
                reject(error)
                : resolve(result);

        });
    });
};

/* 📌 Para el reporte horas extras*/
function queryReportOvertime(tabla, tabla2, tabla3, tabla4, tabla5,consult1, consult2) {
    return new Promise((resolve, reject) => {
        const query =
         `SELECT  tm.descripcion as Marcación, tm.idTMarcaciones, a.idValidacion, a.idValidacionSecond, u.IdUsuarios, u.IdHorarios,CIP,DATE_FORMAT(Fecha, '%Y%m%d') as Fecha, DATE_FORMAT(Hora,'%H:%i') AS Hora,
                  subQuery.HoraInicio AS HoraEntrada, subQuery.HoraFin AS HoraSalida
        FROM ?? AS a INNER JOIN ?? as u ON a.IdUsuarios = u.IdUsuarios
        INNER JOIN
                (
                    SELECT
                        h.IdHorarios,
                        MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_FORMAT(DATE_ADD(h.HoraInicio, INTERVAL 15 MINUTE), '%H:%i') END) AS HoraInicio,
                        MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN DATE_FORMAT(h.HoraInicio,'%H:%i') END) AS HoraFin,
                        h.IdDescanso,
                        GROUP_CONCAT(distinct d.Día ORDER BY LEFT(d.Día, 1) DESC SEPARATOR ', ') AS Descanso
                    FROM ?? AS h
                    INNER JOIN ?? AS d ON h.IdDescanso = d.IdDescansos
                    GROUP BY h.IdHorarios, h.IdDescanso
                ) AS subQuery ON u.IdHorarios = subQuery.IdHorarios
        INNER JOIN ?? AS tm ON a.idTMarcacion = tm.idTMarcaciones
        WHERE a.Fecha BETWEEN ? AND ?
        AND a.idValidacion = 4
        AND a.idValidacionSecond = 6
        AND idTMarcacion IN (1,4)
        ORDER BY Fecha DESC, a.IdUsuarios, tm.descripcion`;
        const values = [tabla, tabla2, tabla3, tabla4, tabla5, consult1, consult2];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
           /*  if (error) {
                return reject(error);
            }
            return resolve(result); */
        })
    });
};
 
/* 📌 Para el reporte solicitudes*/
function queryReportRequest(tabla, tabla2, tabla3, tabla4, tabla5,consult1, consult2,consult3, idWorkers) {
    return new Promise((resolve, reject) => {
        const query =
         `SELECT    s.idTipoSolicitud, ts.descripcion AS TipoSolicitud,tm.idTMarcaciones,tm.descripcion as Marcación,s.Motivo, u.IdUsuarios, u.CIP,DATE_FORMAT(Fecha, '%Y%m%d') as Fecha,
                    s.estadoSolicitudF AS idEstadoSolicitud, es.descripcion AS EstadoSolicitud, s.Updated_byF, CONCAT_WS(' ', uest.Nombres, uest.apellidos) AS Modificador
        FROM ?? AS s INNER JOIN ?? as u ON s.idUsuario = u.IdUsuarios
        LEFT JOIN ?? as tm ON s.idTMarcaciones = tm.idTMarcaciones
        INNER JOIN ?? as ts ON s.idTipoSolicitud = ts.idSolicitud
        INNER JOIN ?? as es ON s.estadoSolicitudF = es.idEstadoSolicitud
        LEFT JOIN ?? as uest ON s.Updated_byF = uest.IdUsuarios
        WHERE s.estadoSolicitudF = 2
        AND FIND_IN_SET(s.idTipoSolicitud, COALESCE(?, (SELECT GROUP_CONCAT(idSolicitud) FROM ??))) > 0
        AND s.Fecha BETWEEN ? AND ?
        AND idUsuario IN(${idWorkers}) 
        ORDER BY Fecha DESC, tm.descripcion`;
        const values = [tabla, tabla2, tabla3, tabla4, tabla5, tabla2, consult1, tabla4, consult2, consult3];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Para el reporte solicitudes RRHH*/
function queryReportRequestRRHH(tabla, tabla2, tabla3, tabla4, tabla5,consult1, consult2,consult3) {
    return new Promise((resolve, reject) => {
        const query =
         `SELECT    s.idTipoSolicitud, ts.descripcion AS TipoSolicitud,tm.idTMarcaciones,tm.descripcion as Marcación,s.Motivo, u.IdUsuarios, u.CIP,DATE_FORMAT(Fecha, '%Y%m%d') as Fecha,
                    s.estadoSolicitudF AS idEstadoSolicitud, es.descripcion AS EstadoSolicitud, s.Updated_byF,  CONCAT_WS(' ', uest.Nombres, uest.apellidos) AS Modificador
        FROM ?? AS s INNER JOIN ?? as u ON s.idUsuario = u.IdUsuarios
        LEFT JOIN ?? as tm ON s.idTMarcaciones = tm.idTMarcaciones
        INNER JOIN ?? as ts ON s.idTipoSolicitud = ts.idSolicitud
        INNER JOIN ?? as es ON s.estadoSolicitudF = es.idEstadoSolicitud
        LEFT JOIN ?? as uest ON s.Updated_byF = uest.IdUsuarios
        WHERE s.estadoSolicitudF = 2
        AND FIND_IN_SET(s.idTipoSolicitud, COALESCE(?, (SELECT GROUP_CONCAT(idSolicitud) FROM ??))) > 0
        AND s.Fecha BETWEEN ? AND ?
        ORDER BY Fecha DESC, tm.descripcion`;
        const values = [tabla, tabla2, tabla3, tabla4, tabla5, tabla2, consult1, tabla4, consult2, consult3];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Obtener nombres, apellidos y correo*/
function queryGetInformationToEmail(idUserWork) {
    return new Promise((resolve, reject) => {
        const query =
         `SELECT a.idLider,u.Email, u.Nombres as NameLeader, u.Apellidos as LastnameLeader, worker.Nombres AS NameOfWorker, worker.Apellidos AS LastNamesWorker
         FROM asignacionpersonal a
         LEFT JOIN usuarios u ON u.IdUsuarios = a.idLider
         LEFT JOIN usuarios worker ON worker.IdUsuarios = a.idUsuario
         WHERE a.idUsuario = ?`;
        const values = [idUserWork];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Obtener horarios para cronjob*/
function queryScheduleByCronjob(tabla, tabla2, tabla3,consult1) {
    return new Promise((resolve, reject) => {
        const query =
         `SELECT 
         h.IdHorarios,
         CASE
             WHEN  de.Día LIKE '%${consult1}%' THEN 
              exc.HoraInicio_Excepcion 
             ELSE MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_ADD(h.HoraInicio, INTERVAL 15 MINUTE)          END)
         END AS HoraInicio,
          CASE
             WHEN de.Día LIKE '%${consult1}%' THEN exc.HoraFin_Excepcion 
             ELSE MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN h.HoraInicio END)
         END AS HoraFin
          FROM ?? AS h LEFT JOIN ?? AS de ON h.diaExcepcion = de.IdDescansos
          LEFT JOIN (SELECT 
              ex.IdExcepcion,
              MIN(CASE WHEN ex.IdTipoMarcacion = 1 AND ex.IdValidacion = 1 THEN DATE_ADD(ex.HoraInicio, INTERVAL 15 MINUTE)           END) AS HoraInicio_Excepcion,
              MAX(CASE WHEN ex.IdTipoMarcacion = 4 AND ex.IdValidacion = 1 THEN ex.HoraInicio END) AS HoraFin_Excepcion
          FROM ?? AS ex 
          GROUP BY ex.IdExcepcion) AS exc ON h.IdExcepcion = exc.IdExcepcion
          INNER JOIN descansos AS d ON h.IdDescanso = d.IdDescansos
          WHERE H.IdEstado = 1
          GROUP BY h.IdHorarios, h.IdDescanso
          HAVING GROUP_CONCAT(distinct d.Día ORDER BY LEFT(d.Día,  1) DESC SEPARATOR ', ')NOT LIKE '%${consult1}%' 
           `
        const values = [tabla, tabla2, tabla3];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Obtener horarios según hora*/
function queryScheduleByHour(tabla, tabla2, tabla3,consult1, consult2) {
    return new Promise((resolve, reject) => {
        const query =
         `
        SELECT IdHorarios, HoraInicio, HoraFin
        FROM 
        (
            SELECT 
            h.IdHorarios,
            CASE
                WHEN  de.Día LIKE '%${consult1}%' THEN 
                 exc.HoraInicio_Excepcion 
                ELSE MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_ADD(h.HoraInicio, INTERVAL 15 MINUTE)          END)
            END AS HoraInicio,
             CASE
                WHEN de.Día LIKE '%${consult1}%' THEN exc.HoraFin_Excepcion 
                ELSE MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN h.HoraInicio END)
            END AS HoraFin
             FROM ?? AS h LEFT JOIN ?? AS de ON h.diaExcepcion = de.IdDescansos
             LEFT JOIN (SELECT 
                 ex.IdExcepcion,
                 MIN(CASE WHEN ex.IdTipoMarcacion = 1 AND ex.IdValidacion = 1 THEN DATE_ADD(ex.HoraInicio, INTERVAL 15 MINUTE)           END) AS HoraInicio_Excepcion,
                 MAX(CASE WHEN ex.IdTipoMarcacion = 4 AND ex.IdValidacion = 1 THEN ex.HoraInicio END) AS HoraFin_Excepcion
             FROM ?? AS ex 
             GROUP BY ex.IdExcepcion) AS exc ON h.IdExcepcion = exc.IdExcepcion
             INNER JOIN descansos AS d ON h.IdDescanso = d.IdDescansos
             WHERE H.IdEstado = 1
             GROUP BY h.IdHorarios, h.IdDescanso
             HAVING GROUP_CONCAT(distinct d.Día ORDER BY LEFT(d.Día,  1) DESC SEPARATOR ', ')NOT LIKE '%${consult1}%' 

        ) AS Tabla_Horario
        WHERE ?
           `
        const values = [tabla, tabla2, tabla3,consult2];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        })
    });
};

/* 📌 Filtrar permisos aceptados por fecha */
function queryPermissionByDate(tabla, tabla2, consult, consult2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT s.idUsuario AS id 
        FROM ?? AS s INNER JOIN ?? AS u ON s.idUsuario = u.IdUsuarios
        WHERE idTipoSolicitud = 2
        AND estadoSolicitudF = 2
        AND FechaPermiso = ?
        AND u.IdHorarios IN (?)
        `;
        const values = [tabla, tabla2, consult, consult2];

        conexion.query(query, values, (error, result) => {
           /*  return error ? reject(error) : resolve(result.map((row) => row.id)); */
            return error ? reject(error) : resolve(result.length >  0 ? result.map((row) => row.id) : [0]);

        });
    });
};

/* 📌 Filtrar vacaciones aceptados por fecha */
function queryVacationsByDate(tabla, tabla2, consult, consult2) {
    return new Promise((resolve, reject) => {
        const query = `
            SELECT s.idUsuario AS id 
            FROM ?? AS s INNER JOIN ?? AS u ON s.idUsuario = u.IdUsuarios
            WHERE idTipoSolicitud = 3
            AND estadoSolicitudF = 2
            AND FechaDesde <= ?
            AND FechaHasta >= ?
            AND u.IdHorarios IN (?) `;
        const values = [tabla, tabla2, consult, consult, consult2];

        conexion.query(query, values, (error, result) => {
           /*  return error ? reject(error) : resolve(result.map((row) => row.id)); */
            return error ? reject(error) : resolve(result.length >  0 ? result.map((row) => row.id) : [0]);

        });
    });
};

// añadir u.IdRol = 2 para solo por ahora RRHH
/* 📌 Revisa si el usuario no registro su asistencia previamente por horarios */
function queryUserAlreadyMarkedToday(table, table2, consult, consult2, consult3, consult4) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT u.IdUsuarios AS id 
        FROM ?? AS u
        WHERE u.IdUsuarios NOT IN (
            SELECT a.IdUsuarios AS id
            FROM ?? AS a INNER JOIN ?? AS us ON a.IdUsuarios = us.IdUsuarios
            WHERE Fecha = ?
            AND idTMarcacion = ?
            AND us.IdHorarios IN (?)
        )
        AND u.IdUsuarios NOT IN (?)
        AND u.IdHorarios IN (?)
        AND u.Activo = 1
        `;
        const values = [table, table2, table, consult, consult2, consult3, consult4, consult3];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result.map((row) => row.id));
            /* if (error) {
                reject(error);
            } else {
                resolve(result);
            } */
        });
    });
};

/* 📌 Reporte horas extras nuevo */
function queryReportOvertimeNew(table, table2, tabla3, tabla4, tabla5, table6, consult, consult2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT  a.idTMarcacion,CIP,DATE_FORMAT(Fecha, '%d-%m-%Y') as Fecha, DATE_FORMAT(Hora,'%H:%i') AS Hora,
                'HES' AS Cód_Horas, 'TGS' AS Cód_Empresa, 
                u.IdHorarios,DATE_FORMAT(h_n.HoraInicio,'%H:%i') AS HoraInicio,DATE_FORMAT(h_n.HoraFin,'%H:%i') AS HoraFin, h_n.diaExcepcion, DATE_FORMAT(h_n.HoraInicio_Excepcion,'%H:%i') AS HoraInicio_Excepcion,DATE_FORMAT(h_n.HoraFin_Excepcion,'%H:%i') AS HoraFin_Excepcion ,
                TIMEDIFF(Hora, h_n.HoraFin) AS DiferenciaTiempo
        FROM ?? AS a INNER JOIN ?? as u ON a.IdUsuarios = u.IdUsuarios INNER JOIN ?? as tm ON a.idTMarcacion = tm.idTMarcaciones INNER JOIN 
        (
        SELECT 
         h.IdHorarios, h.diaExcepcion,
            MIN(CASE WHEN h.IdTipoMarcacion = 1 AND h.IdValidacion = 1 THEN DATE_ADD(h.HoraInicio, INTERVAL 15 MINUTE)          END) AS HoraInicio, MAX(CASE WHEN h.IdTipoMarcacion = 4 AND h.IdValidacion = 1 THEN h.HoraInicio END) AS HoraFin,  exc.HoraInicio_Excepcion , exc.HoraFin_Excepcion 
        FROM ?? AS h 
        LEFT JOIN (SELECT ex.IdExcepcion,
              MIN(CASE WHEN ex.IdTipoMarcacion = 1 AND ex.IdValidacion = 1 THEN DATE_ADD(ex.HoraInicio, INTERVAL 15 MINUTE)           END) AS HoraInicio_Excepcion,
              MAX(CASE WHEN ex.IdTipoMarcacion = 4 AND ex.IdValidacion = 1 THEN ex.HoraInicio END) AS HoraFin_Excepcion
          FROM ?? AS ex 
          GROUP BY ex.IdExcepcion) AS exc ON h.IdExcepcion = exc.IdExcepcion
          INNER JOIN ?? AS d ON h.IdDescanso = d.IdDescansos
          WHERE H.IdEstado = 1
          GROUP BY h.IdHorarios, h.IdDescanso
        ) AS h_n ON u.idhorarios = h_n.IdHorarios
        WHERE a.Fecha BETWEEN ? AND ?
        AND idTMarcacion IN (1,4)
        AND a.idValidacion = 4
        AND a.idValidacionSecond = 6
        ORDER BY Fecha DESC, a.IdUsuarios, tm.descripcion
        `;
        const values = [table, table2, tabla3, tabla4, tabla5, table6,consult, consult2];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
            /* if (error) {
                reject(error);
            } else {
                resolve(result);
            } */
        });
    });
};

/* 📌 Chequear si el día es feriado */
function queryCheckHoliday(tabla, consult1) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT EXISTS(
            SELECT feriado  
            FROM ??  
            WHERE feriado = STR_TO_DATE(?, '%d-%m-%Y')
            LIMIT  1
          ) AS is_holiday
        `;
        const values = [tabla, consult1, ];

        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result[0].is_holiday);

        });
    });
};


/* 📌 Todos los lideres - Contador*/
function queryGetLeaders(users, role, name, cip, dni, state1, state2, limit, ofset) {
    return new Promise((resolve, reject) => {
        const query = `SELECT u.IdUsuarios, u.Nombres, u.Apellidos, u.Usuario, u.idRol, r.Nombre AS roll
        FROM ?? u
        LEFT JOIN ?? as r ON u.IdRol = r.IdRol
        WHERE u.IdRol IN (2,3) AND u.Nombres LIKE "%${name}%" AND u.CIP LIKE "%${cip}%" AND u.DNI LIKE "%${dni}%" AND u.Activo IN (${state1}, ${state2})        
        ORDER BY IdUsuarios ASC 
        LIMIT ? OFFSET ?
        `;
        const values = [users, role, limit, ofset];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);
        });
    });
};

/* 📌 Todos los lideres - Contador*/
function queryGetLeadersCounter(table1, name, cip, dni, state1, state2) {
    return new Promise((resolve, reject) => {
        const query = `
        SELECT COUNT(*) AS totalRegistros
        FROM ?? j
        WHERE IdRol IN (2,3) AND Nombres LIKE "%${name}%" AND CIP LIKE "%${cip}%" AND DNI LIKE "%${dni}%" AND Activo IN (${state1}, ${state2})`;
        const values = [table1];
        conexion.query(query, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Para añadir un trabajador asociado a un lider */
function addNewRegister(table, data) {
    return new Promise((resolve, reject) => {

        const insertQuery = `INSERT INTO ?? SET ?`;
        const values = [table, data];

        conexion.query(insertQuery, values, (error, result) => {
            return error ? reject(error) : resolve(result);

        });
    });
};

/* 📌 Filtro de tipos*/
function queryGeneralFilter(table, idStates, name) {
    return new Promise((resolve, reject) => {
        const query = `SELECT t.*, e.Descripcion AS descriptionState
        FROM ?? t
        INNER JOIN estados e ON e.IdEstado = t.IdEstado
        WHERE t.IdEstado IN(?) AND t.descripcion LIKE "%${name}%"`;
        const values = [table, idStates];
        conexion.query(query, values, (error, result) => {
            console.log(error);
            console.log(result);
            return error ? reject(error) : resolve(result);
        });
    });
};

module.exports = {
    allInformationOfOneTable,
    add,
    addJustification,
    allUsers,
    allTypeMarking,
    allTypeValidation,
    cronjobNotification,
    update,
    query,
    queryAllModules,
    queryGroupedModules,
    queryPermissionByModule,
    queryPermissionByProfile,
    queryAllProfiles,
    queryActivateUsers,
    queryActivateProfile,
    queryActivateSchedule,
    queryDeletePermissions,
    queryLastSchedule,
    queryListPermissions,
    queryUpdateSchedule,
    queryUsersWithSchedule,
    queryUpdatePermission,
    queryGetPermissions,
    queryMarkDay2,
    queryScheduleByUser,
    queryCheckTimePermission,
    queryCheckPermission,
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
    queryGetExceptionDays,
    queryGetIdException,
    queryScheduleNotification,
    queryReportAsistance,
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
    queryGetJustificationsCounterPending,
    queryCheckPermissionAllDay,
    queryCheckVacation,
    queryAllRequestOfUser,
    queryAllRequestOfUserCounter,
    queryGetIdAsignedToLeader,
    queryAllRequestOfUserAsignedToLeader,
    queryAllRequestOfUserAsignedToLeaderCounter,
    queryAllRequestOfUserToRRHH,
    queryAllRequestOfUserToRRHHCounter,
    queryManagementOfRequests,
    queryToKnowWhatRolIs,
    queryReportOvertime,
    queryReportRequest,
    queryReportRequestRRHH,
    queryAllWorkersByUser,
    queryGetWorkersCounterByUser,
    queryLastScheduleException,
    queryAllSchedulesFilter,
    queryGetInformationToEmail,
    queryUpdateAnyTable,
    queryScheduleByCronjob,
    queryScheduleByHour,
    queryPermissionByDate,
    queryVacationsByDate,
    queryUserAlreadyMarkedToday,
    queryReportOvertimeNew,
    queryCheckHoliday,
    queryGetLeaders,
    queryGetLeadersCounter,
    addNewRegister,
    queryGeneralFilter

}