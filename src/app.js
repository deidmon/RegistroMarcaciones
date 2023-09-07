const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const usuarios = require('./modulos/usuarios/rutas')
const auth = require('./modulos/auth/rutas')
const asistencias = require('./modulos/asistencias/rutas')
const error = require('./red/errors');
const cronjob = require('./modulos/asistencias/inasistencias');
const app = express();

//Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//configuracion
app.set('port', config.app.port)

//rutas
app.use('/api/usuarios', usuarios)
app.use('/api/auth', auth)
app.use('/api/asistencias', asistencias)
app.use(error);

module.exports = app; 