exports.success = function(req, res, message = '',status_message, status = 200){

    res.status(status).send({
        success: true,
        status_code: status,
        status_message: status_message || 'Con éxito',
        data: message
    });
}
exports.error = function(req, res,errorValue ,status_message, status = 200){

    res.status(status).send({
        success: false || errorValue,
        status_code: status,
        status_message: status_message || 'Con éxito',
        data: {}
    });
}
/* exports.error22 = function(res,errorValue ,status_message, status = 200){

    res.status(status).send({
        success: false || errorValue,
        status_code: status,
        status_message: status_message || 'error',
        data: {}
    });
} */

/* exports.error = function(req, res, message, status){
    const statusCode = status || 500;
    const mensajeError = message || 'Error interno';
    res.status(statusCode).send({ 
        success: false,
        status_code: statusCode,
        status_message: mensajeError,
        data: {}
    });
} */