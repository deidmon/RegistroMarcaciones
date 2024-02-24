const moment = require("moment-timezone");
const tableAssist = "asistencias";
const tableUser = "usuarios";
const tableSchedule = "horarios";
const tableTypeMarking = "tipomarcaciones";
const tableAddress = "direcciones";
const tableDaysOff = "descansos";
const tablePermissions = "solicitudes";
const tableExceptions = "excepciones";
const tabletypeValidation = "validacion";
const radiusMeters = 50;
const typeRegisterStartBreak = 2; //El inicio de refrigerio es tipo de marcación 2
const typeRegisterEndBreak = 3; //El fin de refrigerio es tipo de marcación 3
moment.tz.setDefault("America/Lima");
moment.locale("es");
const helpers = require("../../helpers/helpers");
module.exports = function (dbInyectada) {
  let message = "";

  let db = dbInyectada;

  if (!db) {
    db = require("../../DB/mysql");
  }

  /* 📌 Añadir registro de asistencia */
  async function addMarking(body) {
    let initialDate = moment();
    let day = initialDate.format("DD");
    let month = initialDate.format("MM");
    let age = initialDate.format("YYYY");
    let hour = initialDate.format("HH");
    let minutes = initialDate.format("mm");
    let date = `${age}-${month}-${day}`;
    const formattedTime = /* "07:02" */ `${hour}:${minutes}`;
    /* const radiusMeters = 50; */
    var dateToMark = new Date(date);

    const dayOfWeekName = initialDate.format("dddd");

    /* 📌 Verificar si es día libre */
    const daysOff = await db.queryGetDaysOff(
      tableDaysOff,
      tableSchedule,
      tableUser,
      { IdUsuarios: body.idUser }
    );
    if (daysOff.includes(dayOfWeekName)) {
      message = `Hoy ${dayOfWeekName.toUpperCase()} es su día no laborable.`;
      return { messages: message };
    }

    /* 📌 Verificar si esta de vacaciones */
    var haveVacation = await db.queryCheckVacation(
      tablePermissions,
      body.idUser
    );
    if (haveVacation.length > 0) {
      if (
        dateToMark >= haveVacation[0].FechaDesde &&
        dateToMark <= haveVacation[0].FechaHasta
      ) {
        message = `Está de vacaciones, disfrútelas al máximo`;
        return { messages: message };
      }
    }

    /* 📌 Verificar si trabajador tiene permiso todo el día */
    const havePermissionAllDay = await db.queryCheckPermissionAllDay(
      tablePermissions,
      body.idUser,
      date
    );
    if (havePermissionAllDay) {
      message = `Día libre, aprovéchalo`;
      return { messages: message };
    }

    const idSchedule = await db.queryGetIdSchedule(tableUser, {
      IdUsuarios: body.idUser,
    }); //Obtener horario
    const exceptionDay = await db.queryGetExceptionDays(
      tableDaysOff,
      tableSchedule,
      tableUser,
      { IdUsuarios: body.idUser }
    ); //Obtener horario del dia diferente
    const IdExcepcion = await db.queryGetIdException(tableSchedule, {
      IdHorarios: idSchedule.IdHorarios,
    });
    let parametrization;
    if (exceptionDay.includes(dayOfWeekName)) {
      parametrization = await db.getTableParametrization(
        tableExceptions,
        tableTypeMarking,
        { IdExcepcion: IdExcepcion.IdExcepcion },
        body.idTypesMarking
      );
    } else {
      parametrization = await db.getTableParametrization(
        tableSchedule,
        tableTypeMarking,
        { IdHorarios: idSchedule.IdHorarios },
        body.idTypesMarking
      );
    }

    const timePermission = await db.queryCheckTimePermission(
      tablePermissions,
      4,
      body.idUser,
      date
    );
    const startTimeAllowed = parametrization[0].HoraInicio;
    const [hourStartTimeAllowed, minutesHourStartTimeAllowed] =
      startTimeAllowed.split(":");
    const startTimeAllowedInMinutes =
      parseInt(hourStartTimeAllowed) * 60 +
      parseInt(minutesHourStartTimeAllowed);
    const entryOneHourAfter =
      parseInt(hourStartTimeAllowed) * 60 +
      parseInt(minutesHourStartTimeAllowed) +
      75;
    const entryThirtyMinutesBefore =
      parseInt(hourStartTimeAllowed) * 60 +
      parseInt(minutesHourStartTimeAllowed) -
      15;
    const entryMinutesBefore =
      parseInt(hourStartTimeAllowed) * 60 +
      parseInt(minutesHourStartTimeAllowed) +
      15 -
      timePermission * 60;
    const hourInMinutesNow = parseInt(hour) * 60 + parseInt(minutes);
    const endTimeAllowed =
      /* parametrization[parametrization.length - 1].HoraFin;  */ parametrization[0]
        .HoraFin;
    const descrptionTypeMarking = parametrization[0].descripcion;

    /* 📌 Validar (Conforme, tardanza, fuera de horario, sobretiempo) */
    function validateTime(formattedTime) {
      const [hour, minutes] = formattedTime.split(":");
      const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
      for (const fila of parametrization) {
        const [startTime, minutesHome] = fila.HoraInicio.split(":");
        const [endTime, minutesEnd] = fila.HoraFin.split(":");
        const startTimeInMinutes =
          parseInt(startTime) * 60 + parseInt(minutesHome);
        const hourEndInMinutes = parseInt(endTime) * 60 + parseInt(minutesEnd);

        if (
          hourInMinutes >= startTimeInMinutes &&
          hourInMinutes <= hourEndInMinutes
        ) {
          /* const idValidacion = fila.IdValidacion; */
          return fila.IdValidacion;
        }
      }
      if (
        hourInMinutes < startTimeAllowedInMinutes &&
        body.idTypesMarking === 4
      ) {
        return 5;
      }
      return 0;
    }

    /* 📌 Verificar usuario es correcto */
    const data = await db.query(tableUser, { IdUsuarios: body.idUser });
    if (!data) {
      message = "Usuario incorrecto";
      return { messages: message };
    }

    /* 📌 Descripción de resultados */
    const resultDescriptions = {
      0: `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}`,
      1: "Conforme",
      2: "Tardanza",
      3: "Salida",
      5: "Fuera de horario",
      6: "Sobretiempo",
    };

    /* 📌 Verificar si es presencial o virtual */
    const workModality = await db.queryModalityValidation(tableUser, {
      IdUsuarios: body.idUser,
    });
    if (!workModality) {
      //Aqui es presencial
      const locations = await db.compareLocation(
        tableUser,
        tableAddress,
        body.idUser,
        body.latitude,
        body.latitude,
        body.longitude,
        radiusMeters,
        body.idUser,
        body.latitude,
        body.latitude,
        body.longitude,
        radiusMeters
      );

      if (locations.length > 0) {
        const firstLocationResult = locations[0];
        const nameAddress = firstLocationResult.Direccion;
        let alreadyMarkedEntry = false;

        /* 📌 Verificar que primero ingrese la entrada antes de poder registrar salida */
        if (body.idTypesMarking === 4) {
          const userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(
            tableAssist,
            body.idUser,
            date,
            1
          );
          if (userAlreadyMarkedEntry.length === 0) {
            alreadyMarkedEntry = true;
          }
          if (alreadyMarkedEntry) {
            message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ENTRADA primero.`;
            return { messages: message };
          }
        }
        /* 📌 Verificar si ya registro su entrada o salida del día */
        const userAlreadyMarked = await db.userAlreadyMarkedToday(
          tableAssist,
          body.idUser,
          date,
          body.idTypesMarking
        );
        let alreadyMarked = false;
        if (userAlreadyMarked.length > 0) {
          alreadyMarked = true;
        }
        if (alreadyMarked) {
          message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`;
          return { messages: message };
        }

        /* 📌 Verificar si tiene permiso por parte del lider */
        if (timePermission > 0 && body.idTypesMarking === 1) {
          if (
            entryMinutesBefore <= hourInMinutesNow &&
            hourInMinutesNow < entryThirtyMinutesBefore
          ) {
            const assists = {
              /* IdAsistencias: body.id, */
              IdUsuarios: body.idUser,
              Direccion: nameAddress,
              Fecha: date,
              Hora: formattedTime,
              idTMarcacion: body.idTypesMarking,
              idValidacion: 4,
              idValidacionSecond: 6,
              Created_by: body.idUser,
              Updated_at: "0000-00-00",
              Updated_by: 0,
              idHorario: idSchedule.IdHorarios,
            };
            const respuesta = await db.add(tableAssist, assists);
            /* const update = await db.update(tableUser, {tiempoPermiso : 0},body.idUser); */
            return {
              idTipoValidacion: 4,
              idMostrarForm: 0,
              "Registrado como":
                "La asistencia ha sido registrada como: SOBRETIEMPO",
              Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
            };
          }
        }
        const resultValidation = validateTime(formattedTime);

        let descriptionValidation = "";

        if (resultValidation === 0) {
          return { messages: resultDescriptions[resultValidation] };
        } else {
          descriptionValidation = resultDescriptions[resultValidation];
        }

        const assists = {
          /* IdAsistencias: body.id, */
          IdUsuarios: body.idUser,
          Direccion: nameAddress,
          Fecha: date,
          Hora: formattedTime,
          idTMarcacion: body.idTypesMarking,
          idValidacion: resultValidation,
          idValidacionSecond: resultValidation,
          Created_by: body.idUser,
          Updated_at: "0000-00-00",
          Updated_by: 0,
          idHorario: idSchedule.IdHorarios,
        };
        let showForm = 0;
        if (resultValidation !== 1 && body.idTypesMarking === 4) {
          showForm = 1;
        }
        if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1) {
          showForm = 1;
        }
        const respuesta = await db.add(tableAssist, assists);

        if (resultValidation !== 1) {
          return {
            idTipoValidacion: resultValidation,
            idMostrarForm: showForm,
            "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
            Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
          };
        }
        return {
          idTipoValidacion: resultValidation,
          idMostrarForm: showForm,
          "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
          Detalle: `Hora de registro: ${formattedTime}. ¡gracias por su puntualidad!`,
        };
      }
      message = `El rango para registrar su asistencia es de ${radiusMeters} metros. Por favor, verifique que se encuentra dentro de ese rango.`;
      return { messages: message };
    }

    /* 📌 Verificar que primero ingrese la entrada antes de poder registrar salida */
    let alreadyMarkedEntry = false;
    if (body.idTypesMarking === 4) {
      const userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(
        tableAssist,
        body.idUser,
        date,
        1
      );
      if (userAlreadyMarkedEntry.length === 0) {
        alreadyMarkedEntry = true;
      }
      if (alreadyMarkedEntry) {
        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ENTRADA primero.`;
        return { messages: message };
      }
    }

    /* 📌 Verificar si ya registro su entrada o salida del día */
    const userAlreadyMarked = await db.userAlreadyMarkedToday(
      tableAssist,
      body.idUser,
      date,
      body.idTypesMarking
    );
    let alreadyMarked = false;
    if (userAlreadyMarked.length > 0) {
      alreadyMarked = true;
    }
    if (alreadyMarked) {
      message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`;
      return { messages: message };
    }

    /* 📌 Verificar si tiene permiso por parte del lider */
    if (timePermission > 0 && body.idTypesMarking === 1) {
      if (
        entryMinutesBefore <= hourInMinutesNow &&
        hourInMinutesNow < entryThirtyMinutesBefore
      ) {
        const assists = {
          /* IdAsistencias: body.id, */
          IdUsuarios: body.idUser,
          Direccion: body.address,
          Fecha: date,
          Hora: formattedTime,
          idTMarcacion: body.idTypesMarking,
          idValidacion: 4,
          idValidacionSecond: 6,
          Created_by: body.idUser,
          Updated_at: "0000-00-00",
          Updated_by: 0,
          idHorario: idSchedule.IdHorarios,
        };
        const respuesta = await db.add(tableAssist, assists);
        return {
          idTipoValidacion: 4,
          idMostrarForm: 0,
          "Registrado como":
            "La asistencia ha sido registrada como: SOBRETIEMPO.",
          Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
        };
      }
    }
    const resultValidation = validateTime(formattedTime);
    let descriptionValidation = "";

    if (resultValidation === 0) {
      return { messages: resultDescriptions[resultValidation] };
    } else {
      descriptionValidation = resultDescriptions[resultValidation];
    }

    const assists = {
      /* IdAsistencias: body.id, */
      IdUsuarios: body.idUser,
      Direccion: body.address,
      Fecha: date,
      Hora: formattedTime,
      idTMarcacion: body.idTypesMarking,
      idValidacion: resultValidation,
      idValidacionSecond: resultValidation,
      Created_by: body.idUser,
      Updated_at: "0000-00-00",
      Updated_by: 0,
      idHorario: idSchedule.IdHorarios,
    };
    const respuesta = await db.add(tableAssist, assists);

    let showForm = 0;
    if (resultValidation !== 1 && body.idTypesMarking === 4) {
      showForm = 1;
    }

    if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1) {
      showForm = 1;
    }

    if (resultValidation !== 1) {
      return {
        idTipoValidacion: resultValidation,
        idMostrarForm: showForm,
        "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
        Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
      };
    }
    return {
      idTipoValidacion: resultValidation,
      idMostrarForm: showForm,
      "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
      Detalle: `Hora de registro: ${formattedTime}.¡gracias por su puntualidad!`,
    };
  }

  //////////////////////////////////////////////////////////////

  /* 📌 Para registrar asistencia desde la web ya que, la ubicación falla mucho  */
  async function addMarkingVirtual(body) {
    /* 📌 Verificar usuario es correcto */
    const data = await db.query(tableUser, { IdUsuarios: body.idUser });
    if (!data) {
      message = "Usuario incorrecto";
      return { messages: message };
    }

    let initialDate = moment();
    let date = await helpers.getDateToday(initialDate);
    const formattedTime = await helpers.getTimeNow(initialDate);
    console.log(formattedTime, "probando helper");
    var dateToMark = new Date(date);
    const dayOfWeekName = await helpers.getJustDay(initialDate);
    const hourInMinutesNow = await helpers.parseHourToMinutes(formattedTime); //Obtener la hora en minutos

    let showForm = 0; //Movi showform aqui
    let getTypesValidation = await db.queryGetTypesValidation();
    console.log(getTypesValidation, 'getTypesValidation holaaaaaaaaaaaaaaaaaaaaaaaaaa');
    /* let typesMarkings = await db.allInformationOfOneTable(tableTypeMarking); */
    let idvalidation = 1;
    let descriptionValidation = ""; //movi descriptionValidation

    /* 📌 Verificar si es día libre */
    const daysOff = await db.queryGetDaysOff(
      tableDaysOff,
      tableSchedule,
      tableUser,
      { IdUsuarios: body.idUser }
    );
    if (daysOff.includes(dayOfWeekName)) {
      message = `Hoy ${dayOfWeekName.toUpperCase()} es su día no laborable.`;
      return { messages: message };
    }

    /* 📌 Verificar si esta de vacaciones */
    var haveVacation = await db.queryCheckVacation(
      tablePermissions,
      body.idUser
    );
    if (haveVacation.length > 0) {
      if (
        dateToMark >= haveVacation[0].FechaDesde &&
        dateToMark <= haveVacation[0].FechaHasta
      ) {
        message = `Está de vacaciones, disfrútelas al máximo`;
        return { messages: message };
      }
    }

    /* 📌 Verificar si trabajador tiene permiso todo el día */
    const havePermissionAllDay = await db.queryCheckPermissionAllDay(
      tablePermissions,
      body.idUser,
      date
    );
    if (havePermissionAllDay) {
      message = `Día libre, aprovéchalo`;
      return { messages: message };
    }

    const idSchedule = await db.queryGetIdSchedule(tableUser, {
      IdUsuarios: body.idUser,
    }); //Obtener Id del horario

    const exceptionDay = await db.queryGetExceptionDays(
      tableDaysOff,
      tableSchedule,
      tableUser,
      { IdUsuarios: body.idUser }
    ); //Obtener día con horario del día diferente

    const IdExcepcion = await db.queryGetIdException(tableSchedule, {
      IdHorarios: idSchedule.IdHorarios,
    }); //obtener id del horario diferente

    let parametrization;
    if (exceptionDay.includes(dayOfWeekName)) {
      //Si coincide el dia de hoy con el día de excepción entonces obtenemos el horario de la tabla excepci´n
      parametrization = await db.getTableParametrization(
        tableExceptions,
        tableTypeMarking,
        { IdExcepcion: IdExcepcion.IdExcepcion },
        body.idTypesMarking
      );
    } else {
      //Sino del horario normal
      parametrization = await db.getTableParametrization(
        tableSchedule,
        tableTypeMarking,
        { IdHorarios: idSchedule.IdHorarios },
        body.idTypesMarking
      );
    }
    /* 📌 Comprueba si inicio o fin de refrigerio - 2 o 3 */
    if (
      body.idTypesMarking == typeRegisterStartBreak ||
      body.idTypesMarking == typeRegisterEndBreak
    ) {
      const timeBreak = await db.queryGetTimeBreak(idSchedule.IdHorarios); //Obtener tiempo de break
      const timeInHoursFormat = await helpers.parseHourToMinutes(formattedTime); //Convertir el tiempo en minutos
      const typeMarkDescription = await db.queryGetNameTypeMark(
        body.idTypesMarking
      ); //Obtenemos el nombre de tipo de marcación

      if (timeBreak && timeBreak.length > 0) {
        //Si es mayor a cero significa que tiene habilitado break y va a poder registrarlo

        const timeInHoursStartBreak = await helpers.parseHourToMinutes(
          timeBreak[0].horainicio
        ); //Convertir el tiempo de inicio de refrigerio en minutos
        const timeInHoursEndBreak = await helpers.parseHourToMinutes(
          timeBreak[0].horafin
        ); //Convertir el tiempo de fin de regrigerio en minutos

        //SOLO PARA INICIO DE REFRIGERIO
        if (body.idTypesMarking == typeRegisterStartBreak) {
          //Ver si ya registro asistencia
          const userAlreadyMarkedEntryFirst = await db.userAlreadyMarkedToday(
            tableAssist,
            body.idUser,
            date,
            1
          );
          if (userAlreadyMarkedEntryFirst.length === 0) {
            message = `Para marcar su ${typeMarkDescription.toUpperCase()} usted debe registrar su ${
              typesMarkings[0].descripcion
            } primero.`;
            return { messages: message };
          }

          if (timeInHoursFormat < timeInHoursStartBreak) {
            //Para cuando intente registrar antes de la hora asignado
            message = `El horario asignado para registrar ${typeMarkDescription.descripcion} es de ${timeBreak[0].horainicio} hasta ${timeBreak[0].horafin}`;
            return { messages: message };
          }
          if (timeInHoursFormat > timeInHoursEndBreak) {
            //Si se paso de las horas establecidas para el break, entonces mostrara alerta de justificación
            idvalidation = 2; //2 es tardanza
            showForm = 1; //Entonces debe mostrar formulario
            descriptionValidation = getTypesValidation[1].descripcion;
          } else {
            descriptionValidation = getTypesValidation[0].descripcion;
          }

          const assists = {
            /* IdAsistencias: body.id, */
            IdUsuarios: body.idUser,
            Direccion: body.address,
            Fecha: date,
            Hora: formattedTime,
            idTMarcacion: body.idTypesMarking,
            idValidacion: idvalidation,
            idValidacionSecond: idvalidation,
            Created_by: body.idUser,
            Updated_at: "0000-00-00",
            Updated_by: 0,
            idHorario: idSchedule.IdHorarios,
          };
          await db.add(tableAssist, assists);
          if (idvalidation == 2) {
            return {
              idTipoValidacion: idvalidation,
              idMostrarForm: showForm,
              "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
              Detalle: `Ya que el horario para ${typeMarkDescription.descripcion.toUpperCase()} es de '${
                timeBreak[0].horainicio
              } a ${
                timeBreak[0].horafin
              }'. De tener algún inconveniente comuníquese con el área de RRHH.`,
            };
          }
          return {
            idTipoValidacion: idvalidation,
            idMostrarForm: showForm,
            "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
            Detalle: `Hora de registro: ${formattedTime}.¡gracias por su puntualidad!`,
          };
        }

        //SOLO PARA FIN DE REFRIGERIO
        if (body.idTypesMarking == typeRegisterEndBreak) {
          if (timeInHoursFormat < timeInHoursStartBreak) {
            //Para cuando intente registrar antes de la hora asignado
            message = `El horario asignado para registrar ${typeMarkDescription.descripcion} es de ${timeBreak[0].horainicio} hasta ${timeBreak[0].horafin}`;
            return { messages: message };
          }
          if (timeInHoursFormat > timeInHoursEndBreak) {
            //Si se paso de las horas establecidas para el break, entonces mostrara alerta de justificación
            idvalidation = 2;
            showForm = 1;
            descriptionValidation = getTypesValidation[1].descripcion;
          } else {
            descriptionValidation = getTypesValidation[0].descripcion;
          }

          const assists = {
            /* IdAsistencias: body.id, */
            IdUsuarios: body.idUser,
            Direccion: body.address,
            Fecha: date,
            Hora: formattedTime,
            idTMarcacion: body.idTypesMarking,
            idValidacion: idvalidation,
            idValidacionSecond: idvalidation,
            Created_by: body.idUser,
            Updated_at: "0000-00-00",
            Updated_by: 0,
            idHorario: idSchedule.IdHorarios,
          };
          await db.add(tableAssist, assists);
          if (idvalidation == 2) {
            return {
              idTipoValidacion: idvalidation,
              idMostrarForm: showForm,
              "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
              Detalle: `Ya que el horario para ${typeMarkDescription.descripcion.toUpperCase()} es de '${
                timeBreak[0].horainicio
              } a ${
                timeBreak[0].horafin
              }'. De tener algún inconveniente comuníquese con el área de RRHH.`,
            };
          }
          return {
            idTipoValidacion: idvalidation,
            idMostrarForm: showForm,
            "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
            Detalle: `Hora de registro: ${formattedTime}.¡gracias por su puntualidad!`,
          };
        }
      }
      message = `No dispones de tiempo para descanso.`;
      return { messages: message };
    }
    console.log("aqui estoy2");

    const timePermission = await db.queryCheckTimePermission(
      tablePermissions,
      4,
      body.idUser,
      date
    ); //Cuanto tiempo de permiso tiene en su entrada

    const startTimeAllowed = parametrization[0].HoraInicio; //Hora de inicio de jornada
    const startTimeAllowedInMinutes = await helpers.parseHourToMinutes(
      startTimeAllowed
    ); /* parseInt(hourStartTimeAllowed) * 60 + parseInt(minutesHourStartTimeAllowed) */
    console.log(startTimeAllowedInMinutes, "probando ");

    //Para que aparezca la notificación cuando ingresan una hora despues
    //75 porque es 60 min mas 15 que se da de tolerancia
    const entryOneHourAfter = startTimeAllowedInMinutes + 75; //

    //Cuando ingresen 30 minutos antes sera sobretiempo, menos 15 porque ya tiene 15 de tolerancia que harian 30 min
    const entryThirtyMinutesBefore = startTimeAllowedInMinutes - 15;

    //si tiene permiso restarle a su hora de ingreso normal
    //15 min mas porque ya estan como proroga 
    const entryMinutesBefore =
      startTimeAllowedInMinutes + 15 - timePermission * 60;

    const endTimeAllowed = parametrization[0].HoraFin; //Hora de fin de jornada
        
    //Descripción de tipo de marcación (entrada, almuerzo, fin almuerzo, salida)
    const descrptionTypeMarking = parametrization[0].descripcion;

    /* 📌 Descripción de resultados */
    /* const resultDescriptions = {
      0: `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}`,
      1: "Conforme",
      2: "Tardanza",
      3: "Falta",
      5: "Fuera de horario",
      6: "Sobretiempo",
    };
     */
   
    /* 📌 Verificar que primero ingrese la entrada antes de poder registrar salida */
    let alreadyMarkedEntry = false;
    if (body.idTypesMarking === 4) {
      const userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(
        tableAssist,
        body.idUser,
        date,
        1
      );
      if (userAlreadyMarkedEntry.length === 0) {
        alreadyMarkedEntry = true;
      }
      if (alreadyMarkedEntry) {
        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ENTRADA primero.`;
        return { messages: message };
      }
    }

    /* 📌 Verificar si ya registro su entrada o salida del día */
    const userAlreadyMarked = await db.userAlreadyMarkedToday(
      tableAssist,
      body.idUser,
      date,
      body.idTypesMarking
    );
    console.log(userAlreadyMarked);
    let alreadyMarked = false;
    if (userAlreadyMarked.length > 0) {
      alreadyMarked = true;
    }

    if (alreadyMarked) {
      message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`;
      return { messages: message };
    }

    /* 📌 Verificar si tiene permiso por parte del lider */
    if (timePermission > 0 && body.idTypesMarking === 1) {
      if (
        entryMinutesBefore <= hourInMinutesNow &&
        hourInMinutesNow < entryThirtyMinutesBefore
      ) {
        const assists = {
          /* IdAsistencias: body.id, */
          IdUsuarios: body.idUser,
          Direccion: body.address,
          Fecha: date,
          Hora: formattedTime,
          idTMarcacion: body.idTypesMarking,
          idValidacion: 4,
          idValidacionSecond: 6,
          Created_by: body.idUser,
          Updated_at: "0000-00-00",
          Updated_by: 0,
          idHorario: idSchedule.IdHorarios,
        };
        const respuesta = await db.add(tableAssist, assists);
        return {
          idTipoValidacion: 4,
          idMostrarForm: 0,
          "Registrado como":
            "La asistencia ha sido registrada como: SOBRETIEMPO.",
          Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
        };
      }
    }
    
    const resultValidation = await  validateTime(hourInMinutesNow, parametrization, startTimeAllowedInMinutes, body.idTypesMarking);

    console.log(resultValidation, 'resultValidation hola');

    /* 📌 Cuando intenta marcar antes de su hora de inicio */
    if (resultValidation === 0) {
      return { messages: `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}` };
    } else {
      descriptionValidation = getTypesValidation[resultValidation-1].descripcion;
    }

    console.log("agregando valores");
    /* 📌 Se asignan los campos a guardar en la tabla asistencias */
    const assists = {
      /* IdAsistencias: body.id, */
      IdUsuarios: body.idUser,
      Direccion: body.address,
      Fecha: date,
      Hora: formattedTime,
      idTMarcacion: body.idTypesMarking,
      idValidacion: resultValidation,
      idValidacionSecond: resultValidation,
      Created_by: body.idUser,
      Updated_at: "0000-00-00",
      Updated_by: 0,
      idHorario: idSchedule.IdHorarios,
    };
    console.log("aqui por agregar");
    const respuesta = await db.add(tableAssist, assists);

    //Movi showform aqui
    if (resultValidation !== 1 && body.idTypesMarking === 4) {
      showForm = 1;
    }
    if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1) {
      showForm = 1;

      console.log(showForm, "Show form0");
    }
    console.log(showForm, "Show form");
    if (resultValidation !== 1) {
      console.log(showForm, "Show form2");
      return {
        idTipoValidacion: resultValidation,
        idMostrarForm: showForm,
        "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
        Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
      };
    }
    return {
      idTipoValidacion: resultValidation,
      idMostrarForm: showForm,
      "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
      Detalle: `Hora de registro: ${formattedTime}.¡gracias por su puntualidad!`,
    };
  }

  /* 📌 Validar (Conforme, tardanza, fuera de horario, sobretiempo) */
  async function validateTime(pHourInMinutesNow, pparametrization, pStartTimeAllowedInMinutes, pIdTypesMarking) {
    for (const fila of pparametrization) {

      let startTimeInMinutes = await helpers.parseHourToMinutes(fila.HoraInicio);
      let hourEndInMinutes = await helpers.parseHourToMinutes(fila.HoraFin);

      if (
        pHourInMinutesNow >= startTimeInMinutes &&
        pHourInMinutesNow <= hourEndInMinutes
      ) {
        return fila.IdValidacion;
      }
    }
    if (
        pHourInMinutesNow < pStartTimeAllowedInMinutes &&
        pIdTypesMarking === 4 //4 es justificado
    ) {
      return 5;//fuera de horario
    }
    return 0;
  };

  

  /* 📌 Actualizar  */
  async function update(body) {
    let user = body.username || "";
    let password = body.password || "";
    const marking = {
      IdUsuarios: body.idUser,
      Fecha: body.date,
      Hora: body.hour,
      idTMarcacion: body.idTypesMarking,
      idValidacion: body.idValidacion,
    };
    const modificationMarking = {
      Hora: body.hour,
      idTMarcacion: body.idTypesMarking, //revisar
      idValidacion: body.idValidacion,
      Updated_by: body.idUserModified,
      Updated_at: date,
    };

    if (body.IdRol == 1) {
      const response = await db.queryUpdateAssists(
        tableAssist,
        modificationMarking,
        marking
      );
      return response;
    }
    message = "No tienes permiso para modificar.";
    return { messages: message };
  }

  return {
    addMarking,
    addMarkingVirtual,
    update,
  };
};
