const config = require('../config');
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: config.gmail.authusergmail,
        pass: config.gmail.authuserpass,
    }
})

const mensaje = {
    from: `sdwilmer179@gmail.com`,
    to: "sdwilmer179@gmail.com",
    subject: "Correo de pruebas", //asunto
    text: 'Envio de correo desde node'

}


module.exports = transporter;