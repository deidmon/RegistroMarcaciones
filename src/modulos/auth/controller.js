const auth = require("../../auth");
const bcrypt = require("bcrypt");
const tableUser = "usuarios";
const tableRole = "rol";
const helpers = require("../../helpers/helpers");

module.exports = function (dbInjected) {
  let db = dbInjected;
  message = "";

  if (!db) {
    db = require("../../DB/mysql");
  }
  async function login(user, password) {
    if (!user || !password) {
      message = "Datos faltantes";
      return { messages: message };
      /* throw new Error("Datos faltantes"); */
    }
    try {
      const data = await db.queryUserWithRol(tableUser, tableRole,  { Usuario: user });
      if(data.Activo === 0){
        message = "Usuario desactivado";
        return { messages: message };
      };
      if (!data || !data.Contraseña) {
        message = "Credenciales inválidas";
        return { messages: message };
        /* throw new Error("Credenciales inválidas"); */
      }

      /* const user_view = ;
      const user_update= ;

      const perfil_view = ;
      const perfil_update = ;
      const perfil_create = ;
      const perfil_delete = ;

      const changePass_view = ;
      const changePass_update = ;

      const schedule_view = ;
      const schedule_update = ;
      const schedule_create = ;
      const schedule_delete= ;

      const typeregister_view = ;
      const typeregister_update = ;

      const modalitywork_view = ;
      const modalitywork_update = ;

      const typerequest_view = ;
      const typerequest_update = ;

      const typevalidation_view = ;
      const typevalidation_update = ;

      const scheduleassignment_view = ;
      const scheduleassignment_update = ;

      const staterequest_view = ;
      const staterequest_update = ;

      const rol_view = ;
      const rol_update = ;
      const rol_create = ;
      const rol_delete = ;

      const registerasiss_view = ;
      const registerasiss_create = ;
      
      const historyassis_view = ;

      const myhistoryassis_view = ;

      const registerrequest_view = ;
      const registerrequest_create = ;

      const registerrequest_create = ; */
      return bcrypt.compare(password, data.Contraseña).then((result) => {
        if (result) {
          const payload = {
            /* randomData: Math.random(), */
            id: data.IdUsuarios,
            firstnames: data.Nombres,
            lastnames: data.Apellidos,
            rol: data.IdRol,
            nameRol: data.nameRol,
            email: data.Email,
            isFisrtTime: data.isFisrtLogin,
            CIP: data.CIP,
            exp: Math.floor(Date.now() / 1000) + 18000,
          };
          /* if (data.isFisrtLogin == 0)  {
            let code = '';
            for(let i = 0; i <=5; i++){
                let character = Math.ceil(Math.random() * 9)
                code += character;
            }
            //Enviar correo con código de verificación
            const a = helpers.sendCodeVerificationOutlook(data.Email, code);
            console.log(a, 'Espero si se envie porque no me deja porner como await');
          }
 */
          return { token: auth.assignToken({ ...payload }) };
        } else {
          /* throw new Error("Credenciales inválidas"); */
          message = "Credenciales inválidas";
          return { messages: message };
        }
      });
    } catch (error) {
      throw error;
    }
  }

  return {
    login,
  };
};
