const express = require('express');
const morgan = require('morgan');
const config = require('./config');
const cors = require('cors');

const user = require('./modulos/user/routes')
const auth = require('./modulos/auth/routes')
const report = require('./modulos/report/routes')
const assistance = require('./modulos/assistance/routes')
const informationTables = require('./modulos/informationTables/routes')
const modules = require('./modulos/modules/routes')
const profiles = require('./modulos/profiles/routes')
const permissions = require('./modulos/permissions/routes')
const error = require('./red/errors');
const cronjob = require('./modulos/assistance/absences');
const cronjobNotification = require('./modulos/notification/routes');
const Justifications = require('./modulos/justifications/routes')
const schedules = require('./modulos/schedules/routes')
const addScheduleProgrammed = require('./modulos/cronjob/addSchedule')
const addUsersProgrammed = require('./modulos/cronjob/addDataUsers')
/* const addUprueba = require('./modulos/cronjob/prueba2') */
const app = express();

//Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

//configuracion
app.set('port', config.app.port)

//rutas
app.use('/api/user', user)
app.use('/api/auth', auth)
app.use('/api/informationTables', informationTables)
app.use('/api/modules', modules)
app.use('/api/profiles', profiles)
app.use('/api/permissions', permissions)
app.use('/api/assistance', assistance)
app.use('/api/justifications', Justifications)
app.use('/api/schedules', schedules)
app.use('/api/report', report)
app.use('/api/notifications', cronjobNotification)
app.use(error);

module.exports = app; 