//Textos
const errorMessageAsistance = "Algo salio mal, intente más tarde."
const messageErrorEmail = "Ocurrio un error al enviar el correo de informe de registro de asistencia."
const linkValtx = "https://asistencia.valtx.pe:8020/asistencia_valtx/#/login"

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
const tableJustifications = "justificaciones";
const tableParameterization = "parametrizacion";
const tableCronJob = "horarionotificaciones";
const tableRefreshment = "refrigerio";
const tableScheduleRefreshment = "horariorefrigerio";
const tableCodeUser = "code_user";
const tableRelationshipAreas = "relacionareas";
const tableCompany = "empresa";
const tableManagement = "gerencias";
const tableHeadquarters = "jefaturas";
const tableUnits = "unidades";
const tablePersonalAssigment= 'asignacionpersonal';  
const tableProfile= 'perfil';
const tableOptions ='opcion';
const tableModule = 'modulo';
const tableProfileOption = 'perfilopcion'; 
const tableStatus = 'estados';  

//Numeros
const radiusMeters = 50; //Radio para que se pueda realizar el registro de marcación
const typeRegisterEntry = 1; // La entrada es tipo marcación 1
const typeRegisterStartBreak = 2; //El inicio de refrigerio es tipo de marcación 2
const typeRegisterEndBreak = 3; //El fin de refrigerio es tipo de marcación 3
const typeRegisterDeparture = 4; // La salida es tipo marcación 4
const isFisrtSession = 0; // La salida es tipo marcación 4
const minimumPasswordCharacters = 6; //Caracteres minimos de una contraseña
const timeExpOfCode = 90; //Tiempo de expiración del código de verificación
const stateInactive = 0; //Caracteres minimos de una contraseña
const stateActive = 1; //Tiempo de expiración del código de verificación

const pageSize = 15; //El numero de registros que devolvera por pagina

//Correos
const gmailHost = 'smtp.gmail.com';
const mailPort = 587; //puerto sin seguridad
const vmailPort = 465; //puerto con seguridad
const vmailHost = 'smtp-mail.outlook.com';

//Otros
const startTimeRefreshment = '12:00';//Tiempo de inicio de refrigerio
const timeLimitToRegisterEndBreak = 965; //Tiempo limite para registrar fin de refrigerio
const expirationTime  = 180; //Tiempo de expiración del código de verificación

module.exports = {
    //Textos
    errorMessageAsistance,
    messageErrorEmail,
    linkValtx,

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
    tableJustifications,
    tableParameterization,
    tableCronJob,
    tableRefreshment,
    tableScheduleRefreshment,
    tableCodeUser,
    tableRelationshipAreas,
    tableCompany,
    tableManagement,
    tableHeadquarters,
    tableUnits,
    tablePersonalAssigment,
    tableProfile,
    tableOptions,
    tableModule,
    tableProfileOption,
    tableStatus,

    //Numeros
    radiusMeters,
    typeRegisterEntry,
    typeRegisterStartBreak,
    typeRegisterEndBreak,
    timeLimitToRegisterEndBreak,
    typeRegisterDeparture,
    pageSize,
    isFisrtSession,
    minimumPasswordCharacters,
    timeExpOfCode,
    stateInactive,
    stateActive, 

    //Correos
    gmailHost,
    mailPort,
    vmailPort,
    vmailHost,
    
    //Otros
    startTimeRefreshment,
    expirationTime
};