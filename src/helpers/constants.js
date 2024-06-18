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
const timeBreakInMinutes = 60;//Tiempo de refrigerio para los que tienen horario felxible
const toleranceTime = 5; //Tiempo de tolerancia para ingreso

//Tipos de validación de registro de asistencia
const cconformable = 1; //Registro conforme
const cdelay = 2; //Registro como tardanza
const cabsence = 3; //Registrado como falta 
const cjustified = 4; //Registrado como justificado
const coutoftime = 5; //Registro como fuera de horario
const covertime = 6; //Registro como sobretiempo

//Tipos de validación de registro de asistencia(descripcion)
const cconformabled = "Conforme"; //Registro conforme
const cdelayd = "Tardanza"; //Registro como tardanza
const cabsenced = "Falta"; //Registrado como falta 
const cjustifiedd = "Justificado"; //Registrado como justificado
const coutoftimed = "Fuera de horario"; //Restro como fuera de horario
const covertimed = "Sobretiempo"; //Registro como sobretiempo

//Correos
const gmailHost = 'smtp.gmail.com';
const mailPort = 587; //puerto sin seguridad
const vmailPort = 465; //puerto con seguridad
const vmailHost = 'smtp-mail.outlook.com';

//Otros
const startTimeRefreshment = '12:00';//Tiempo de inicio de refrigerio
const timeLimitToRegisterEndBreak = 965; //Tiempo limite para registrar fin de refrigerio
const expirationTime  = 180; //Tiempo de expiración del código de verificación
const showFormTrue = 1; //Muestra el formulario en front para que envien una justificación por tardanza o fuera de horario
const showFormFalse = 0; //No muestra el formulario 
const flexibleSchedule = 0;//Horario flexible es decir no valida hora de ingreso ni de inicio break
const dailyWorkingHours = 480; //Horas laboradas diarias
const extraTime = 30; //Pasado los 30 minutos es considerado tiempo extra
const extraTimeDeparture = 15; //Tiempo de tolerancia para salida

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

    //Validaciones
    cconformable,
    cdelay,
    cabsence,
    cjustified,
    coutoftime,
    covertime,

    //Validaciones descripción
    cconformabled,
    cdelayd,
    cabsenced,
    cjustifiedd,
    coutoftimed,
    covertimed,

    //Correos
    gmailHost,
    mailPort,
    vmailPort,
    vmailHost,
    
    //Otros
    startTimeRefreshment,
    expirationTime,
    timeBreakInMinutes,
    toleranceTime,
    showFormTrue,
    showFormFalse,
    flexibleSchedule,
    dailyWorkingHours,
    extraTime,
    extraTimeDeparture
};