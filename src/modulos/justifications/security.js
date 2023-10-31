const auth = require('../../auth');
const response = require('../../red/response');

module.exports = function chequearAuth(){

    function middleware(req,res, next){
        /* auth.checkToken.confirmToken(req)
        next(); */
        tokenValid = auth.checkToken.confirmToken(req);

        if (!tokenValid.message) {
            next();
        } else {
            response.error(req, res, false, tokenValid.message, 401); // 
        }
    }
    return middleware
}