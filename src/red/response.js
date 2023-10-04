exports.success = function(req, res, message = '', status = 200){
    res.status(status).send({
        success: true,
        status_code: status,
        status_message: 'Con éxito',
        data: message
    });
}
exports.error = function(req, res, message, status){
    const statusCode = status || 500;
    const mensajeError = message || 'Error interno';
    res.status(statusCode).send({ 
        success: false,
        status_code: statusCode,
        status_message: mensajeError,
        data: {}
    });
}