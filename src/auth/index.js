const jwt = require('jsonwebtoken');
config = require('../config')

const secret = config.jwt.secret;

function asignarToken(data){
    return jwt.sign(data,secret);
}
function verificarToken(token){
    return jwt.verify(token, secret);
}
const chequearToken={
    confirmarToken: function(req){
        const decoficado = decodificarCabecera(req);
        // if (decoficado.id !== id){ esto es para controlar quien puede editar mi usuario
        //     throw new Error("No puedes hacer esto")
        // }
    }
}
function obtenerToken(autorizacion){
    if(!autorizacion){
        throw new Error('No viene token');
    }
    if(autorizacion.indexOf('Bearer') === -1){
        throw new Error('Formato invalido');
    }
    let token = autorizacion.replace('Bearer ','')
    return token;
}

function decodificarCabecera(req){
    console.log(req.headers)
    const autorizacion = req.headers.authorization || '';
    const token = obtenerToken(autorizacion);
    const decodificado = verificarToken(token);

    req.user = decodificado;
    return decodificado; 
}

/* function validarToken(req, res, next) {
    
    const token = req.headers.authorization;  
    if (!token) {
      return res.status(401).json({ mensaje: 'Token no proporcionado' });
    }
  
    jwt.verify(token.replace('Bearer ', ''), secretKey, (err, decoded) => {
      if (err) {
        return res.status(401).json({ mensaje: 'Token inválido' });
      }
  
      req.user = decoded;
      next(); 
    });
  } */

module.exports = {
    asignarToken,
    chequearToken,
   // validarToken
    
}