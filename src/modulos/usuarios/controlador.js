const TABLA = 'usuarios';
const bcrypt =require ('bcrypt');

module.exports = function(dbInyectada){

    let db = dbInyectada;

    if(!db){
        db = require('../../DB/mysql');
    }
    async function login(usuario, password){
        if (!usuario) {
            throw new Error("Datos faltantes");
        }
        const data = await db.query(TABLA, {Usuario: usuario});
        if (!data) {
            throw new Error("Usuario incorrecto");
        }
        const id = data.IdUsuarios;

        return bcrypt.compare(password, data.Contraseña)
        .then(resultado =>{
            if(resultado == true){
                
                return infoUno(id)
            }else{
                throw new Error("Credenciales inválidas");
            }
        })
    }

    function todos(){
        return db.todos(TABLA);
    }
    function uno(id){
        return db.uno(TABLA, id);
    }
    function infoUno(id){
        return db.infoUno(TABLA, id);
    }
    async function agregar(body){
        let user = body.usuario || '';
        let password = body.contraseña || '';

        if(body.contraseña){
            password = await bcrypt.hash(body.contraseña.toString(), 5) 
       }
        const usuario = {
            IdUsuarios:body.id,
            Nombres: body.nombre,
            Apellidos: body.apellidos,
            Activo: body.activo,
            Usuario:user ,
            Contraseña:password,
        } 
        const respuesta = await db.agregar(TABLA, usuario);

         return respuesta;

    }
    
    function eliminar(body){
        return db.eliminar(TABLA, body);
    }
    return {
        todos,
        uno,
        agregar,
        eliminar,
        infoUno,
        login
    }
}
