const auth = require('../auth');
const response = require('../red/response');
module.exports = function chequearAuth() {
    return async function middleware(req, res, next) {
        try {
            const tokenValid = auth.checkToken.confirmToken(req); 
            let userId;
            
            if (req.body.userId) {
                userId = req.body.userId;
            }
            else if (req.body.idUser) {
                userId = req.body.idUser;
            } /* else if (req.body.idUsers) {
                userId = req.body.idUsers;
            } else if (req.body.idUsuario) {
                userId = req.body.idUsuario;
            }else if (req.body.id) {
                userId = req.body.id;
            }else if (req.body.userId) {
                userId = req.body.userId;
            }  */

            if (userId != tokenValid.id) {
                const errorMessage  = 'Token inválido'; 
                response.error(req, res, false, errorMessage, 401);
                return;
            } 

            next();
        } catch (error) {
            const errorMessage = 'Ocurrió un error';
            response.error(req, res, false, errorMessage, 401);
            return;
        }
    };
};