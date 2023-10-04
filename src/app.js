const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const user = require('./modulos/user/rutas')
const auth = require('./modulos/auth/rutas')
const assistance = require('./modulos/assistance/rutas')
const error = require('./red/errors');
const cronjob = require('./modulos/assistance/inasistencias');
const app = express();

//Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//configuracion
app.set('port', config.app.port)

//rutas
app.use('/api/user', user)
app.use('/api/auth', auth)
app.use('/api/assistance', assistance)
app.use(error);

module.exports = app; 