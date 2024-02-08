require('dotenv').config();
module.exports = {
    app:{
        port: process.env.PORT || 4000,
    },
    jwt:{
        secret: process.env.JET_SECRET || 'notasecreta'
    },
    mysql:{
        host: process.env.MYSQL_HOST || 'localhost',
        user: process.env.MYSQL_USER || 'root',
        password: process.env.MYSQL_PASSWORD || '',
        database: process.env.MYSQL_DB || 'ejemplo'
    },
    
    gmail:{
        authusergmail: process.env.GMAIL || 'sdwilmer179@gmail.com',
        authuserpass: process.env.GMAIL_PASSWORD || 'ygxb gfzz qrph wwui',
    }
}