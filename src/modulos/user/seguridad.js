const auth = require('../../auth');

module.exports = function chequearAuth(){

    function middleware(req,res, next){
        auth.checkToken.confirmToken(req)
        next();
    }
    return middleware
}