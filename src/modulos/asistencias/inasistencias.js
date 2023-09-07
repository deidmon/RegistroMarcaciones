const cron = require('node-cron');
const express = require('express');
const db = require('../../DB/mysql'); 
const TABLA = 'asistencias';
const tabla2 = 'usuarios'

async function registrarFaltasController() {

  let fecha = new Date() || '';
  try {
    const usuariosSinRegistro = await db.registrarFaltas(tabla2,TABLA);
    console.log('Resultado de la consulta:', usuariosSinRegistro);

    if (usuariosSinRegistro && usuariosSinRegistro.length > 0) {
      for (const idUsuario  of usuariosSinRegistro) {
        const registro = {
          IdUsuarios: idUsuario,
          Fecha: fecha,
          Validacion: 'Falta',
        };

        console.log('Registrando falta para el usuario Id:', idUsuario );

        const respuesta = await db.agregar(TABLA, registro);
        console.log('Falta registrada en la tabla asistencias:', respuesta);
      }

      return 'Faltas registradas correctamente01';

    } else {
      console.log('Todos los usuarios han registrado asistencia para hoy.');
    }
    return 'Faltas registradas correctamente.';

  } catch (error) {
    console.error('Error al registrar faltas:', error);
    throw error; 
  }
}

cron.schedule('25 19 * * *', async () => {
  try {
    const mensaje = await registrarFaltasController();
    console.log(`Ejecución programada a las 3 AM: ${mensaje}`);
  } catch (error) {
    console.error('Error en la ejecución programada:', error);
  }
});