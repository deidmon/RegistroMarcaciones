const auth = require("../../auth");
const bcrypt = require("bcrypt");
const tableUser = "usuarios";
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
      const data = await db.query(tableUser, { Usuario: user });
      if (!data || !data.Contraseña) {
        message = "Credenciales inválidas";
        return { messages: message };
        /* throw new Error("Credenciales inválidas"); */
      }
      return bcrypt.compare(password, data.Contraseña).then((result) => {
        if (result) {
          const payload = {
            /* randomData: Math.random(), */
            id: data.IdUsuarios,
            firstnames: data.Nombres,
            lastnames: data.Apellidos,
            rol: data.IdRol,
            email: data.Email,
            isFisrtTime: data.isFisrtLogin,
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
