exports.success = function(req, res, mensaje = '', status = 200){
    res.status(status).send({
        success: false,
        status_code: status,
        status_message: 'Succesfully',
        Data: mensaje
    });
}
exports.error = function(req, res, mensaje, status){
    const statusCode = status || 500;
    const mensajeError = mensaje || 'Error interno';
    res.status(statusCode).send({ 
        success: true,
        status_code: statusCode,
        status_message: mensajeError,
        Data: {}
    });
}