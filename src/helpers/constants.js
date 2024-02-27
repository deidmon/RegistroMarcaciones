//Textos
const errorMessageAsistance = "Algo salio mal, intente más tarde."

//Nombres de tablas
const tableAssist = "asistencias";
const tableUser = "usuarios";
const tableSchedule = "horarios";
const tableTypeMarking = "tipomarcaciones";
const tableAddress = "direcciones";
const tableDaysOff = "descansos";
const tablePermissions = "solicitudes";
const tableExceptions = "excepciones";
const tabletypeValidation = "validacion";

//Numeros
const radiusMeters = 50; //Radio para que se pueda realizar el registro de marcación
const typeRegisterEntry = 1; // La entrada es tipo marcación 1
const typeRegisterStartBreak = 2; //El inicio de refrigerio es tipo de marcación 2
const typeRegisterEndBreak = 3; //El fin de refrigerio es tipo de marcación 3
const typeRegisterDeparture = 4; // La salida es tipo marcación 4
const timeLimitToRegisterEndBreak = 905; //Tiempo limite para registrar fin de refrigerio

module.exports = {
    //Textos
    errorMessageAsistance,

    //Nombres de tablas
    tableAssist,
    tableUser,
    tableSchedule,
    tableTypeMarking,
    tableAddress,
    tableDaysOff,
    tablePermissions,
    tableExceptions,
    tabletypeValidation,

    //Numeros
    radiusMeters,
    typeRegisterEntry,
    typeRegisterStartBreak,
    typeRegisterEndBreak,
    timeLimitToRegisterEndBreak,
    typeRegisterDeparture
};