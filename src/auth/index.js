const jwt = require('jsonwebtoken');
config = require('../config')
const secret = config.jwt.secret;

function assignToken(data){
    return jwt.sign(data,secret);
}

function verifyToken(token){
    return jwt.verify(token, secret);
}

const checkToken={
    confirmToken: function(req){
        const decoded = decodeHeader(req);
    }
}

function getToken(authorization){
    if(!authorization){
        throw new Error('No viene token');
    }
    if(authorization.indexOf('Bearer') === -1){
        throw new Error('Formato invalido');
    }
    let token = authorization.replace('Bearer ','')
    return token;
}

function decodeHeader(req){
    console.log(req.headers)
    const authorization = req.headers.authorization || '';
    const token = getToken(authorization);
    const decoded = verifyToken(token);

    req.user = decoded;
    return decoded; 
}

module.exports = {
    assignToken,
    checkToken,
}