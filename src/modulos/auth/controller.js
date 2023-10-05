const auth = require('../../auth');
const bcrypt =require ('bcrypt');
const tableUser = 'usuarios';

module.exports = function(dbInjected){

    let db = dbInjected;
    message = ""

    if(!db){
        db = require('../../DB/mysql');
    }
    async function login(user, password){
        if (!user || !password) {
            message ='Datos faltantes'
            return {"messages": message}
            /* throw new Error("Datos faltantes"); */
          }
        try {
            const data = await db.query(tableUser, {Usuario: user});
            if (!data || !data.Contraseña) {
                message ='Credenciales inválidas'
                return {"messages": message}
                /* throw new Error("Credenciales inválidas"); */
              }
              return bcrypt.compare(password, data.Contraseña)
              .then(result =>{
                if(result){
                      const payload = {
                            randomData: Math.random(),
                            exp: Math.floor(Date.now() / 1000) + 18000,
                      };
                     
                      return {"token": auth.assignToken({...payload})}
                }else{
                      /* throw new Error("Credenciales inválidas"); */
                      message ='Credenciales inválidas'
                      return {"messages": message}
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