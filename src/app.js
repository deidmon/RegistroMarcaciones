const express = require('express');
const morgan = require('morgan');
const config = require('./config');

const user = require('./modulos/user/routes')
const auth = require('./modulos/auth/routes')
const assistance = require('./modulos/assistance/routes')
const informationTables = require('./modulos/informationTables/routes')
const error = require('./red/errors');
/* const cronjob = require('./modulos/assistance/absences'); */
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
app.use('/api/informationTables', informationTables)
app.use('/api/assistance', assistance)
app.use(error);

module.exports = app; 