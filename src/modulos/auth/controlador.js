const auth = require('../../auth');
const bcrypt =require ('bcrypt');

const TABLA = 'usuarios';
module.exports = function(dbInyectada){

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    async function login(usuario, password){
        if (!usuario || !password) {
            throw new Error("Datos faltantes");
          }
        try {
            const data = await db.query(TABLA, {Usuario: usuario});
            if (!data || !data.Contraseña) {
                throw new Error("Credenciales inválidas");
              }
              return bcrypt.compare(password, data.Contraseña)
              .then(resultado =>{
                if(resultado){//resultado == true
                      const payload = {
                            /* IdUsuarios:data.IdUsuarios,
                            Nombres: data.Nombres,
                            Apellidos: data.Apellidos,
                            Usuario: data.Usuario, */
                            randomData: Math.random(),
                        // otherRandomValue: 'SomeRandomValue',
                        //exp: Math.floor(Date.now() / 1000) + 3600,
                        exp: Math.floor(Date.now() / 1000) + 3600,
        
                      };
                      // const token = auth.asignarToken(payload, SECRET_KEY, { expiresIn: '1h' });
                      return auth.asignarToken({...payload})
                }else{
                      throw new Error("Credenciales inválidas");
                }
              })
        } catch (error) {
            throw error;
        }
        

        
    }
    return {
        login
    }
  
}