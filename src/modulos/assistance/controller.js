const moment = require("moment-timezone");
moment.tz.setDefault("America/Lima");
moment.locale("es");
const helpers = require("../../helpers/helpers");
const constant = require("../../helpers/constants");

module.exports = function (dbInyectada) {
  let message = "";

  let db = dbInyectada;

  if (!db) {
    db = require("../../DB/mysql");
  }

  /* 📌 Añadir registro de asistencia presencial*/
  async function addMarkingOnSite(body) {
    let initialDate = moment();
    let date = await helpers.getDateToday(initialDate);
    let showForm = constant.showFormFalse;
    const formattedTime = await helpers.getTimeNow(initialDate);
    const hourInMinutesNow = await helpers.parseHourToMinutes(formattedTime); //Obtener la hora en minutos

    const dayOfWeekName = await helpers.getJustDay(initialDate);

    const idSchedule = await db.queryGetIdSchedule(constant.tableUser, {
      IdUsuarios: body.idUser,
    }); //Obtener id de horario

    const timeBreak = await db.queryGetTimeBreak(idSchedule.IdHorarios); //Obtener tiempo de break

    let typesMarkings = await db.allInformationOfOneTable(
      constant.tableTypeMarking
    );
    //Descripción de tipo de marcación (entrada, almuerzo, fin almuerzo, salida)
    var descrptionTypeMarking =
      typesMarkings[body.idTypesMarking - 1].descripcion; //-1 porque los indices empiezan desde cero

    /* let descriptionValidation = ""; //movi descriptionValidation */

    /* 📌 Verificar si ya registro su entrada, break, fin break o salida del día */
    let userAlreadyMarked = false;
    userAlreadyMarked = await checkIfAlreadyRegister(
      body.idTypesMarking,
      body.idUser,
      date,
      constant.tableAssist
    );
    if (userAlreadyMarked) {
      message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`;
      return { messages: message };
    }
    /* 📌 Verificar que primero ingrese entrada, antes de poder registrar break */
    let alreadyMarkedEntry = false; //aun no marca
    alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
      body.idTypesMarking,
      2,
      body.idUser,
      date,
      constant.tableAssist,
      1
    );
    if (alreadyMarkedEntry) {
      message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
        body.idTypesMarking - 2
      ].descripcion.toUpperCase()} primero.`;
      return { messages: message };
    }

    /* 📌 Verificar que primero ingrese break, antes de poder registrar fin break */
    alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
      body.idTypesMarking,
      3,
      body.idUser,
      date,
      constant.tableAssist,
      2
    );
    if (alreadyMarkedEntry) {
      message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
        body.idTypesMarking - 2
      ].descripcion.toUpperCase()} primero.`;
      return { messages: message };
    }

    if (
      (timeBreak && timeBreak.length > 0) ||
      idSchedule.IdHorarios == constant.flexibleSchedule
    ) {
      /* 📌 Verificar que primero ingrese fin break, antes de poder registrar salida */
      alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
        body.idTypesMarking,
        4,
        body.idUser,
        date,
        constant.tableAssist,
        3
      );
      if (alreadyMarkedEntry) {
        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
          body.idTypesMarking - 2
        ].descripcion.toUpperCase()} primero.`;
        return { messages: message };
      }
    } else {
      /* 📌 Verificar que primero ingrese entrada, antes de poder registrar salida */
      alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
        body.idTypesMarking,
        4,
        body.idUser,
        date,
        constant.tableAssist,
        1
      );
      if (alreadyMarkedEntry) {
        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
          body.idTypesMarking - 2
        ].descripcion.toUpperCase()} primero.`;
        return { messages: message };
      }
    }

    /* 📌 Verificar si es su día de descanso */
    const daysOff = await db.queryGetDaysOff(
      constant.tableDaysOff,
      constant.tableSchedule,
      constant.tableUser,
      { IdUsuarios: body.idUser }
    );
    if (daysOff.includes(dayOfWeekName)) {
      message = `Hoy ${dayOfWeekName.toUpperCase()} es su día no laborable.`;
      return { messages: message };
    }

    /* 📌 Verificar si esta de vacaciones */
    var haveVacation = await db.queryCheckVacation(date, body.idUser);
    if (haveVacation && haveVacation.length > 0) {
      message = `Está de vacaciones, disfrútelas al máximo`;
      return { messages: message };
    }

    /* 📌 Verificar si trabajador tiene permiso todo el día */
    const havePermissionAllDay = await db.queryCheckPermissionAllDay(
      constant.tablePermissions,
      body.idUser,
      date
    );
    if (havePermissionAllDay) {
      message = `Día libre, aprovéchalo`;
      return { messages: message };
    }

    const locations = await db.compareLocation(
      constant.tableUser,
      constant.tableAddress,
      body.idUser,
      body.latitude,
      body.latitude,
      body.longitude,
      constant.radiusMeters,
      body.idUser,
      body.latitude,
      body.latitude,
      body.longitude,
      constant.radiusMeters
    );

    if (locations.length > 0) {
      //Si esta dentro del rango

      const firstLocationResult = locations[0];
      const nameAddress = firstLocationResult.Direccion;

      let typesMarkings = await db.allInformationOfOneTable(
        constant.tableTypeMarking
      );
      //Descripción de tipo de marcación (entrada, almuerzo, fin almuerzo, salida)
      let getTypesValidation = await db.queryGetTypesValidation(); //Tipos de validación

      //PARA HORARIO FLEXIBLE
      var resultValidations;
      //Si es horario 0 no verificar la hora de ingreso
      if (idSchedule.IdHorarios == constant.flexibleSchedule) {
        //Para registro de entrada e inicio de break
        resultValidations = constant.cconformable;
        //Para registro de fin break
        if (body.idTypesMarking == constant.typeRegisterEndBreak) {
          //Verificar hora de "inicio break" para permitir o no el registro
          let refreshmentStartLog = await db.queryAttendanceRegistrationTime(
            body.idUser,
            constant.typeRegisterStartBreak
          );

          const timeRegisterBreakInMinutes = await helpers.parseHourToMinutes(
            refreshmentStartLog[0].Hora
          ); //Obtener la hora en minutos
          const timeToShouldRegisterEndBreak =
            timeRegisterBreakInMinutes + constant.timeBreakInMinutes;
          resultValidations = constant.cconformable;

          if (hourInMinutesNow < timeToShouldRegisterEndBreak) {
            const timeToHaveOfBreak =
              timeRegisterBreakInMinutes +
              constant.timeBreakInMinutes -
              hourInMinutesNow;
            message = `Todavía dispone de ${timeToHaveOfBreak} minutos para poder registrar su ${descrptionTypeMarking.toUpperCase()}`;
            return { messages: message };
          }

          if (
            hourInMinutesNow >
            timeToShouldRegisterEndBreak + constant.toleranceTime
          ) {
            resultValidations = constant.cdelay;
            var timeToShouldRegisterEndBreaks =
              await helpers.parseMinutesToHour(timeToShouldRegisterEndBreak);
          }
        }

        //Para registro de salida
        if (body.idTypesMarking == constant.typeRegisterDeparture) {
          let entryStartLog = await db.queryAttendanceRegistrationTime(
            body.idUser,
            constant.typeRegisterEntry
          ); //Hora de ingreso
          let refreshmentStartLog = await db.queryAttendanceRegistrationTime(
            body.idUser,
            constant.typeRegisterStartBreak
          ); //Hora de break
          let refreshmentEndLog = await db.queryAttendanceRegistrationTime(
            body.idUser,
            constant.typeRegisterEndBreak
          ); //Hora de fin break

          let entryStartLogM = await helpers.parseHourToMinutes(
            entryStartLog[0].Hora
          ); //Hora de ingreso en minutos
          let refreshmentStartLogM = await helpers.parseHourToMinutes(
            refreshmentStartLog[0].Hora
          ); //Hora de break en minutos
          let refreshmentEndLogM = await helpers.parseHourToMinutes(
            refreshmentEndLog[0].Hora
          ); //Hora fin break en minutos

          let timeoOfWorked =
            refreshmentStartLogM -
            entryStartLogM +
            (hourInMinutesNow - refreshmentEndLogM); //Tiempo en minutos trabajado
          //12:00 - 7:00 + (? - 13:00)
              5 + 3
          let timeWorked = refreshmentStartLogM - entryStartLogM; //Tiempo trabajado (inicio break - entrada)

          let timeLeftToWork = constant.dailyWorkingHours - timeWorked; //Tiempo que queda por trabajar(8h diarios - tiempo trabajado)

          let timeShouldRegisterEnd = refreshmentEndLogM + timeLeftToWork; //Hora que deberia registrar la salida
          let timeShouldRegisterEndTolerance =
            timeShouldRegisterEnd + constant.extraTimeDeparture; //Hora que deberia registrar la salida + tolerancia

          var timeShouldRegisterEndH = await helpers.parseMinutesToHour(
            timeShouldRegisterEnd
          ); //Hora que deberia registrar la salida en horas
          var timeShouldRegisterEndToleranceH =
            await helpers.parseMinutesToHour(timeShouldRegisterEndTolerance); //Hora que deberia registrar la salida + tolerancia en horas
          var descriptionVali = constant.cconformabled;

          //Si esta registrando antes
          if (timeoOfWorked < constant.dailyWorkingHours) {
            resultValidations = constant.coutoftime;
            descriptionVali = constant.coutoftimed;
          }
          //Si esta registrando despues de las 8 horas laboradas + 15 de tolerancia pero antes de las 8 horas + 30 min es fuera de horario
          if (
            timeoOfWorked >
              constant.dailyWorkingHours + constant.extraTimeDeparture &&
            timeoOfWorked >
              constant.dailyWorkingHours + constant.extraTimeDeparture
          ) {
            resultValidations = constant.coutoftime;
            descriptionVali = constant.coutoftimed;
          }
          //Si esta registrando despues de las 8 horas laboradas mas 30 min es sobretiempo
          if (timeoOfWorked > constant.dailyWorkingHours + constant.extraTime) {
            resultValidations = constant.covertime;
            descriptionVali = constant.covertimed;
          }
        }

        /* 📌 Se asignan los campos a guardar en la tabla asistencias */
        const assists = {
          IdUsuarios: body.idUser,
          Direccion: body.address,
          Fecha: date,
          Hora: formattedTime,
          idTMarcacion: body.idTypesMarking,
          idValidacion: resultValidations,
          idValidacionSecond: resultValidations,
          Created_by: body.idUser,
          Updated_at: "0000-00-00",
          Updated_by: 0,
          idHorario: idSchedule.IdHorarios,
        };

        await db.add(constant.tableAssist, assists);
        if (
          resultValidations !== constant.cconformable &&
          body.idTypesMarking === constant.typeRegisterEndBreak
        ) {
          showForm = constant.showFormTrue;
          return {
            idTipoValidacion: resultValidations,
            idMostrarForm: showForm,
            "Registrado como": `La asistencia ha sido registrada como: ${constant.cdelayd.toUpperCase()}.`,
            Detalle: `Ya que debio registrar su ${descrptionTypeMarking.toUpperCase()} hasta las ${timeToShouldRegisterEndBreaks}`,
          };
        }
        if (
          resultValidations !== constant.cconformable &&
          body.idTypesMarking === constant.typeRegisterDeparture
        ) {
          showForm = constant.showFormTrue;

          return {
            idTipoValidacion: resultValidations,
            idMostrarForm: showForm,
            "Registrado como": `La asistencia ha sido registrada como: ${descriptionVali.toUpperCase()}.`,
            Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${timeShouldRegisterEndH} a ${timeShouldRegisterEndToleranceH}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
          };
        }
        return {
          idTipoValidacion: resultValidations,
          idMostrarForm: showForm,
          "Registrado como": `La asistencia de ${descrptionTypeMarking.toUpperCase()} ha sido registrada como: ${constant.cconformabled.toUpperCase()}`,
          Detalle: `Hora de registro: ${formattedTime} ¡gracias por su puntualidad!`,
        };
      } //TERMINA HORARIO FLEXIBLE

      const exceptionDay = await db.queryGetExceptionDays(
        constant.tableDaysOff,
        constant.tableSchedule,
        constant.tableUser,
        { IdUsuarios: body.idUser }
      ); //Obtener horario del dia diferente

      const IdExcepcion = await db.queryGetIdException(constant.tableSchedule, {
        IdHorarios: idSchedule.IdHorarios,
      }); //Obtener id de horario de día diferente

      /* 📌 Comprueba si inicio o fin de refrigerio - 2 o 3 */
      if (
        body.idTypesMarking == constant.typeRegisterStartBreak ||
        body.idTypesMarking == constant.typeRegisterEndBreak
      ) {
        const timeInHoursFormat = await helpers.parseHourToMinutes(
          formattedTime
        ); //Convertir el tiempo en minutos
        const typeMarkDescription = await db.queryGetNameTypeMark(
          body.idTypesMarking
        ); //Obtenemos el nombre de tipo de marcación
        return await registerBreak(
          body,
          timeBreak,
          timeInHoursFormat,
          typeMarkDescription,
          getTypesValidation,
          idSchedule,
          formattedTime,
          typesMarkings
        );
      }

      let parametrization;
      if (exceptionDay.includes(dayOfWeekName)) {
        parametrization = await db.getTableParametrization(
          constant.tableExceptions,
          constant.tableTypeMarking,
          { IdExcepcion: IdExcepcion.IdExcepcion },
          body.idTypesMarking
        );
      } else {
        parametrization = await db.getTableParametrization(
          constant.tableSchedule,
          constant.tableTypeMarking,
          { IdHorarios: idSchedule.IdHorarios },
          body.idTypesMarking
        );
      }

      const timePermission = await db.queryCheckTimePermission(
        constant.tablePermissions,
        4,
        body.idUser,
        date
      );
      const startTimeAllowed = parametrization[0].HoraInicio; //Hora de inicio de jornada

      const endTimeAllowed = parametrization[0].HoraFin; //Hora de fin de jornada

      const startTimeAllowedInMinutes = await helpers.parseHourToMinutes(
        startTimeAllowed
      );

      //Para que aparezca la notificación cuando ingresan una hora despues
      //75 porque es 60 min mas 15 que se da de tolerancia
      const entryOneHourAfter = startTimeAllowedInMinutes + 75;

      //Cuando ingresen 30 minutos antes sera sobretiempo, menos 15 porque ya tiene 15 de tolerancia que harian 30 min
      const entryThirtyMinutesBefore = startTimeAllowedInMinutes - 15;

      //si tiene permiso restarle a su hora de ingreso normal
      //15 min mas porque ya estan como proroga
      const entryMinutesBefore =
        startTimeAllowedInMinutes + 15 - timePermission * 60;

      descrptionTypeMarking = parametrization[0].descripcion;

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
          const respuesta = await db.add(constant.tableAssist, assists);
          /* const update = await db.update(constant.tableUser, {tiempoPermiso : 0},body.idUser); */
          return {
            idTipoValidacion: 4,
            idMostrarForm: 0,
            "Registrado como":
              "La asistencia ha sido registrada como: SOBRETIEMPO",
            Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
          };
        }
      }

      /* 📌 Validar (Conforme, tardanza, fuera de horario, sobretiempo) */
      function validateTime(formattedTime) {
        const [hour, minutes] = formattedTime.split(":");
        const hourInMinutes = parseInt(hour) * 60 + parseInt(minutes);
        for (const fila of parametrization) {
          const [startTime, minutesHome] = fila.HoraInicio.split(":");
          const [endTime, minutesEnd] = fila.HoraFin.split(":");
          const startTimeInMinutes =
            parseInt(startTime) * 60 + parseInt(minutesHome);
          const hourEndInMinutes =
            parseInt(endTime) * 60 + parseInt(minutesEnd);

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

      /* 📌 Descripción de resultados */
      const resultDescriptions = {
        0: `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}`,
        1: "Conforme",
        2: "Tardanza",
        3: "Salida",
        5: "Fuera de horario",
        6: "Sobretiempo",
      };

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

      if (resultValidation !== 1 && body.idTypesMarking === 4) {
        showForm = constant.showFormTrue;
      }
      if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1) {
        showForm = constant.showFormTrue;
      }
      const respuesta = await db.add(constant.tableAssist, assists);

      if (resultValidation !== constant.showFormTrue) {
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
        "Registrado como": `La asistencia de ${descrptionTypeMarking.toUpperCase()} ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
        Detalle: `Hora de registro: ${formattedTime} ¡gracias por su puntualidad!`,
      };
    }
    message = `El rango para registrar su asistencia es de ${constant.radiusMeters} metros. Por favor, verifique que se encuentra dentro de ese rango.`;
    return { messages: message };
  }

  /* 📌 Para registrar asistencia modalidad presencial o virtual*/
  async function addMarking(body) {
    /* 📌 Verificar usuario es correcto */
    const data = await db.query(constant.tableUser, {
      IdUsuarios: body.idUser,
    });
    if (!data) {
      message = "Usuario incorrecto";
      return { messages: message };
    }

    /* 📌 Verificar si es presencial o virtual */
    const workModality = await db.queryModalityValidation(constant.tableUser, {
      IdUsuarios: body.idUser,
    });

    if (!workModality) {
      return await addMarkingOnSite(body);
    }
    return await addMarkingVirtual(body);
  }

  /* 📌 Para registrar asistencia desde la web ya que, la ubicación falla mucho  */
  async function addMarkingVirtual(body) {
    let initialDate = moment();
    let date = await helpers.getDateToday(initialDate);
    const formattedTime = await helpers.getTimeNow(initialDate);
    const dayOfWeekName = await helpers.getJustDay(initialDate);
    const hourInMinutesNow = await helpers.parseHourToMinutes(formattedTime); //Obtener la hora en minutos
    let showForm = constant.showFormFalse; //Movi showform aqui
    let getTypesValidation = await db.queryGetTypesValidation();

    let typesMarkings = await db.allInformationOfOneTable(
      constant.tableTypeMarking
    );
    //Descripción de tipo de marcación (entrada, almuerzo, fin almuerzo, salida)
    const idSchedule = await db.queryGetIdSchedule(constant.tableUser, {
      IdUsuarios: body.idUser,
    }); //Obtener Id del horario

    const timeBreak = await db.queryGetTimeBreak(idSchedule.IdHorarios); //Obtener tiempo de break

    const descrptionTypeMarking =
      typesMarkings[body.idTypesMarking - 1].descripcion; //-1 porque los indices empiezan desde cero

    /* let idvalidation = 1; */
    let descriptionValidation = ""; //movi descriptionValidation

    ///////VERFICACIONES
    /* 📌 Verificar si ya registro su entrada, break, fin break o salida del día */
    let userAlreadyMarked = false;
    userAlreadyMarked = await checkIfAlreadyRegister(
      body.idTypesMarking,
      body.idUser,
      date,
      constant.tableAssist
    );
    if (userAlreadyMarked) {
      message = `Usted ya ha registrado su ${descrptionTypeMarking.toUpperCase()} hoy.`;
      return { messages: message };
    }

    /* 📌 Verificar que primero ingrese entrada, antes de poder registrar break */
    let alreadyMarkedEntry = false; //aun no marca
    alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
      body.idTypesMarking,
      2,
      body.idUser,
      date,
      constant.tableAssist,
      1
    );
    if (alreadyMarkedEntry) {
      message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
        body.idTypesMarking - 2
      ].descripcion.toUpperCase()} primero.`;
      return { messages: message };
    }

    /* 📌 Verificar que primero ingrese break, antes de poder registrar fin break */
    alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
      body.idTypesMarking,
      3,
      body.idUser,
      date,
      constant.tableAssist,
      2
    );
    if (alreadyMarkedEntry) {
      message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
        body.idTypesMarking - 2
      ].descripcion.toUpperCase()} primero.`;
      return { messages: message };
    }

    if (
      (timeBreak && timeBreak.length > 0) ||
      idSchedule.IdHorarios == constant.flexibleSchedule
    ) {
      /* 📌 Verificar que primero ingrese fin break, antes de poder registrar salida */
      alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
        body.idTypesMarking,
        4,
        body.idUser,
        date,
        constant.tableAssist,
        3
      );
      if (alreadyMarkedEntry) {
        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
          body.idTypesMarking - 2
        ].descripcion.toUpperCase()} primero.`;
        return { messages: message };
      }
    } else {
      /* 📌 Verificar que primero ingrese entrada, antes de poder registrar salida */
      alreadyMarkedEntry = await checkIfAlreadyRegisterPrevious(
        body.idTypesMarking,
        4,
        body.idUser,
        date,
        constant.tableAssist,
        1
      );
      if (alreadyMarkedEntry) {
        message = `Para marcar su ${descrptionTypeMarking.toUpperCase()} usted debe registrar su ${typesMarkings[
          body.idTypesMarking - 4
        ].descripcion.toUpperCase()} primero.`;
        return { messages: message };
      }
    }

    /* 📌 Verificar si es su día de descanso */
    const daysOff = await db.queryGetDaysOff(
      constant.tableDaysOff,
      constant.tableSchedule,
      constant.tableUser,
      { IdUsuarios: body.idUser }
    );
    if (daysOff.includes(dayOfWeekName)) {
      message = `Hoy ${dayOfWeekName.toUpperCase()} es su día no laborable.`;
      return { messages: message };
    }

    /* 📌 Verificar si esta de vacaciones */
    var haveVacation = await db.queryCheckVacation(date, body.idUser);
    if (haveVacation && haveVacation.length > 0) {
      message = `Está de vacaciones, disfrútelas al máximo`;
      return { messages: message };
    }

    /* 📌 Verificar si trabajador tiene permiso todo el día */
    const havePermissionAllDay = await db.queryCheckPermissionAllDay(
      constant.tablePermissions,
      body.idUser,
      date
    );
    if (havePermissionAllDay) {
      message = `Día libre, aprovéchalo`;
      return { messages: message };
    }
    ///FIN VERIFICACIONES

    //PARA HORARIO FLEXIBLE
    var resultValidation;
    //Si es horario 0 no verificar la hora de ingreso
    if (idSchedule.IdHorarios == constant.flexibleSchedule) {
      //Para registro de entrada e inicio de break
      resultValidation = constant.cconformable;
      //Para registro de fin break
      if (body.idTypesMarking == constant.typeRegisterEndBreak) {
        //Verificar hora de "inicio break" para permitir o no el registro
        let refreshmentStartLog = await db.queryAttendanceRegistrationTime(
          body.idUser,
          constant.typeRegisterStartBreak
        );

        const timeRegisterBreakInMinutes = await helpers.parseHourToMinutes(
          refreshmentStartLog[0].Hora
        ); //Obtener la hora en minutos
        const timeToShouldRegisterEndBreak =
          timeRegisterBreakInMinutes + constant.timeBreakInMinutes;
        resultValidation = constant.cconformable;

        if (hourInMinutesNow < timeToShouldRegisterEndBreak) {
          const timeToHaveOfBreak =
            timeRegisterBreakInMinutes +
            constant.timeBreakInMinutes -
            hourInMinutesNow;
          message = `Todavía dispone de ${timeToHaveOfBreak} minutos para poder registrar su ${descrptionTypeMarking.toUpperCase()}`;
          return { messages: message };
        }

        if (
          hourInMinutesNow >
          timeToShouldRegisterEndBreak + constant.toleranceTime
        ) {
          resultValidation = constant.cdelay;
          var timeToShouldRegisterEndBreaks = await helpers.parseMinutesToHour(
            timeToShouldRegisterEndBreak
          );
        }
      }

      //Para registro de fin break
      if (body.idTypesMarking == constant.typeRegisterDeparture) {
        let entryStartLog = await db.queryAttendanceRegistrationTime(
          body.idUser,
          constant.typeRegisterEntry
        ); //Hora de ingreso
        let refreshmentStartLog = await db.queryAttendanceRegistrationTime(
          body.idUser,
          constant.typeRegisterStartBreak
        ); //Hora de break
        let refreshmentEndLog = await db.queryAttendanceRegistrationTime(
          body.idUser,
          constant.typeRegisterEndBreak
        ); //Hora de fin break

        let entryStartLogM = await helpers.parseHourToMinutes(
          entryStartLog[0].Hora
        ); //Hora de ingreso en minutos
        let refreshmentStartLogM = await helpers.parseHourToMinutes(
          refreshmentStartLog[0].Hora
        ); //Hora de break en minutos
        let refreshmentEndLogM = await helpers.parseHourToMinutes(
          refreshmentEndLog[0].Hora
        ); //Hora fin break en minutos

        let timeoOfWorked =
          refreshmentStartLogM -
          entryStartLogM +
          (hourInMinutesNow - refreshmentEndLogM); //Tiempo en minutos trabajado
        let timeWorked = refreshmentStartLogM - entryStartLogM; //Tiempo trabajado (inicio break - entrada)

        let timeLeftToWork = constant.dailyWorkingHours - timeWorked; //Tiempo que queda por trabajar(8h diarios - tiempo trabajado)

        let timeShouldRegisterEnd = refreshmentEndLogM + timeLeftToWork; //Hora que deberia registrar la salida
        let timeShouldRegisterEndTolerance =
          timeShouldRegisterEnd + constant.extraTimeDeparture; //Hora que deberia registrar la salida + tolerancia

        var timeShouldRegisterEndH = await helpers.parseMinutesToHour(
          timeShouldRegisterEnd
        ); //Hora que deberia registrar la salida en horas
        var timeShouldRegisterEndToleranceH = await helpers.parseMinutesToHour(
          timeShouldRegisterEndTolerance
        ); //Hora que deberia registrar la salida + tolerancia en horas
        var descriptionVali = constant.cconformabled;

        //Si esta registrando antes
        if (timeoOfWorked < constant.dailyWorkingHours) {
          resultValidation = constant.coutoftime;
          descriptionVali = constant.coutoftimed;
        }
        //Si esta registrando despues de las 8 horas laboradas + 15 de tolerancia pero antes de las 8 horas + 30 min es fuera de horario
        if (
          timeoOfWorked >
            constant.dailyWorkingHours + constant.extraTimeDeparture &&
          timeoOfWorked >
            constant.dailyWorkingHours + constant.extraTimeDeparture
        ) {
          resultValidation = constant.coutoftime;
          descriptionVali = constant.coutoftimed;
        }
        //Si esta registrando despues de las 8 horas laboradas mas 30 min es sobretiempo
        if (timeoOfWorked > constant.dailyWorkingHours + constant.extraTime) {
          resultValidation = constant.covertime;
          descriptionVali = constant.covertimed;
        }
      }

      /* 📌 Se asignan los campos a guardar en la tabla asistencias */
      const assists = {
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

      await db.add(constant.tableAssist, assists);
      if (
        resultValidation !== constant.cconformable &&
        body.idTypesMarking === constant.typeRegisterEndBreak
      ) {
        showForm = 1;
        return {
          idTipoValidacion: resultValidation,
          idMostrarForm: showForm,
          "Registrado como": `La asistencia ha sido registrada como: ${constant.cdelayd.toUpperCase()}.`,
          Detalle: `Ya que debio registrar su ${descrptionTypeMarking.toUpperCase()} hasta las ${timeToShouldRegisterEndBreaks}`,
        };
      }
      if (
        resultValidation !== constant.cconformable &&
        body.idTypesMarking === constant.typeRegisterDeparture
      ) {
        showForm = constant.showFormTrue;

        return {
          idTipoValidacion: resultValidation,
          idMostrarForm: showForm,
          "Registrado como": `La asistencia ha sido registrada como: ${descriptionVali.toUpperCase()}.`,
          Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${timeShouldRegisterEndH} a ${timeShouldRegisterEndToleranceH}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
        };
      }
      return {
        idTipoValidacion: resultValidation,
        idMostrarForm: showForm,
        "Registrado como": `La asistencia de ${descrptionTypeMarking.toUpperCase()} ha sido registrada como: ${constant.cconformabled.toUpperCase()}`,
        Detalle: `Hora de registro: ${formattedTime} ¡gracias por su puntualidad!`,
      };
    }
    //TERMINA HORARIO FLEXIBLE

    /* 📌 Comprueba si inicio o fin de refrigerio - 2 o 3 */
    if (
      body.idTypesMarking == constant.typeRegisterStartBreak ||
      body.idTypesMarking == constant.typeRegisterEndBreak
    ) {
      const timeInHoursFormat = await helpers.parseHourToMinutes(formattedTime); //Convertir el tiempo en minutos
      const typeMarkDescription = await db.queryGetNameTypeMark(
        body.idTypesMarking
      ); //Obtenemos el nombre de tipo de marcación

      return await registerBreak(
        body,
        timeBreak,
        timeInHoursFormat,
        typeMarkDescription,
        getTypesValidation,
        idSchedule,
        formattedTime,
        typesMarkings
      );
    }

    const exceptionDay = await db.queryGetExceptionDays(
      constant.tableDaysOff,
      constant.tableSchedule,
      constant.tableUser,
      { IdUsuarios: body.idUser }
    ); //Obtener día con horario del día diferente

    const IdExcepcion = await db.queryGetIdException(constant.tableSchedule, {
      IdHorarios: idSchedule.IdHorarios,
    }); //obtener id del horario diferente

    let parametrization;
    if (exceptionDay.includes(dayOfWeekName)) {
      //Si coincide el dia de hoy con el día de excepción entonces obtenemos el horario de la tabla excepci´n
      parametrization = await db.getTableParametrization(
        constant.tableExceptions,
        constant.tableTypeMarking,
        { IdExcepcion: IdExcepcion.IdExcepcion },
        body.idTypesMarking
      );
    } else {
      //Sino del horario normal
      parametrization = await db.getTableParametrization(
        constant.tableSchedule,
        constant.tableTypeMarking,
        { IdHorarios: idSchedule.IdHorarios },
        body.idTypesMarking
      );
    }

    const startTimeAllowed = parametrization[0].HoraInicio; //Hora de inicio de jornada
    const startTimeAllowedInMinutes = await helpers.parseHourToMinutes(
      startTimeAllowed
    );
    const endTimeAllowed = parametrization[0].HoraFin; //Hora de fin de jornada

    const timePermission = await db.queryCheckTimePermission(
      constant.tablePermissions,
      4,
      body.idUser,
      date
    ); //Cuanto tiempo de permiso tiene en su entrada

    //Para que aparezca la notificación cuando ingresan una hora despues
    //75 porque es 60 min mas 15 que se da de tolerancia
    const entryOneHourAfter = startTimeAllowedInMinutes + 75;

    //Cuando ingresen 30 minutos antes sera sobretiempo, menos 15 porque ya tiene 15 de tolerancia que harian 30 min
    const entryThirtyMinutesBefore = startTimeAllowedInMinutes - 15;

    //si tiene permiso restarle a su hora de ingreso normal
    //15 min mas porque ya estan como proroga
    const entryMinutesBefore =
      startTimeAllowedInMinutes + 15 - timePermission * 60;

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
        const respuesta = await db.add(constant.tableAssist, assists);
        return {
          idTipoValidacion: 4,
          idMostrarForm: 0,
          "Registrado como":
            "La asistencia ha sido registrada como: SOBRETIEMPO.",
          Detalle: `Ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de '${startTimeAllowed} a ${endTimeAllowed}'. De tener algún inconveniente comuníquese con el área de RRHH.`,
        };
      }
    }

    /* 📌 Cuando intenta marcar antes de su hora de inicio */
    if (body.idTypesMarking == 1 || body.idTypesMarking == 4) {
      resultValidation = await validateTime(
        hourInMinutesNow,
        parametrization,
        startTimeAllowedInMinutes,
        body.idTypesMarking
      );

      if (resultValidation === 0) {
        return {
          messages: `Lo sentimos, no se pudo registrar su asistencia, ya que el horario para ${descrptionTypeMarking.toUpperCase()} es de: ${startTimeAllowed} a ${endTimeAllowed}`,
        };
      } else {
        descriptionValidation =
          getTypesValidation[resultValidation - 1].descripcion;
      }
    }

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

    const respuesta = await db.add(constant.tableAssist, assists);

    //Movi showform aqui
    if (resultValidation !== 1 && body.idTypesMarking === 4) {
      showForm = constant.showFormTrue;
    }
    if (hourInMinutesNow > entryOneHourAfter && body.idTypesMarking === 1) {
      showForm = constant.showFormTrue;
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
      "Registrado como": `La asistencia de ${descrptionTypeMarking.toUpperCase()} ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
      Detalle: `Hora de registro: ${formattedTime} ¡gracias por su puntualidad!`,
    };
  }

  /* 📌 Validar (Conforme, tardanza, fuera de horario, sobretiempo) */
  async function validateTime(
    pHourInMinutesNow,
    pparametrization,
    pStartTimeAllowedInMinutes,
    pIdTypesMarking
  ) {
    for (const fila of pparametrization) {
      let startTimeInMinutes = await helpers.parseHourToMinutes(
        fila.HoraInicio
      );
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
      pIdTypesMarking === 4 //4 es salida
    ) {
      return 5; //fuera de horario
    }
    return 0;
  }

  /* 📌 Para registrar inicio o fin de break*/
  async function registerBreak(
    body,
    pTimeBreak,
    pTimeInHoursFormat,
    pTypeMarkDescription,
    pGetTypesValidation,
    pIdSchedule,
    pFormattedTime,
    ptypesMarkings
  ) {
    if (pTimeBreak && pTimeBreak.length > 0) {
      //Si es mayor a cero significa que tiene habilitado break y va a poder registrarlo
      let idvalidation = 1;
      let showForm = 0;
      const timeInHoursStartBreak = await helpers.parseHourToMinutes(
        pTimeBreak[0].horainicio
      ); //Convertir el tiempo de inicio de refrigerio en minutos
      const timeInHoursEndBreak = await helpers.parseHourToMinutes(
        pTimeBreak[0].horafin
      ); //Convertir el tiempo de fin de regrigerio en minutos

      //SOLO PARA INICIO DE REFRIGERIO
      if (body.idTypesMarking == constant.typeRegisterStartBreak) {
        if (pTimeInHoursFormat < timeInHoursStartBreak) {
          //Para cuando intente registrar antes de la hora asignado
          message = `El horario asignado para registrar ${pTypeMarkDescription.descripcion.toUpperCase()} es de ${
            pTimeBreak[0].horainicio
          } hasta ${pTimeBreak[0].horafin}`;
          return { messages: message };
        }
        if (pTimeInHoursFormat > timeInHoursEndBreak) {
          //Si se paso de las horas establecidas para el break, entonces mostrara alerta de justificación
          idvalidation = 2; //2 es tardanza
          showForm = 1; //Entonces debe mostrar formulario
          descriptionValidation = pGetTypesValidation[1].descripcion;
        } else {
          descriptionValidation = pGetTypesValidation[0].descripcion;
        }

        const assists = {
          /* IdAsistencias: body.id, */
          IdUsuarios: body.idUser,
          Direccion: body.address,
          Fecha: date,
          Hora: pFormattedTime,
          idTMarcacion: body.idTypesMarking,
          idValidacion: idvalidation,
          idValidacionSecond: idvalidation,
          Created_by: body.idUser,
          Updated_at: "0000-00-00",
          Updated_by: 0,
          idHorario: pIdSchedule.IdHorarios,
        };

        await db.add(constant.tableAssist, assists);

        if (idvalidation == 2) {
          return {
            idTipoValidacion: idvalidation,
            idMostrarForm: showForm,
            "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
            Detalle: `Ya que el horario para ${pTypeMarkDescription.descripcion.toUpperCase()} es de '${
              pTimeBreak[0].horainicio
            } a ${
              pTimeBreak[0].horafin
            }'. De tener algún inconveniente comuníquese con el área de RRHH.`,
          };
        }

        return {
          idTipoValidacion: idvalidation,
          idMostrarForm: showForm,
          "Registrado como": `La asistencia de ${pTypeMarkDescription.descripcion.toUpperCase()} ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
          Detalle: `Hora de registro: ${pFormattedTime} ¡gracias por su puntualidad!`,
        };
      }

      //SOLO PARA FIN DE REFRIGERIO
      if (body.idTypesMarking == constant.typeRegisterEndBreak) {
        if (pTimeInHoursFormat < timeInHoursStartBreak) {
          //Para cuando intente registrar antes de la hora asignado
          message = `El horario asignado para registrar ${pTypeMarkDescription.descripcion.toUpperCase()} es ${
            pTimeBreak[0].tiempo
          } minutos despues de registrar su ${ptypesMarkings[
            constant.typeRegisterStartBreak - 1
          ].descripcion.toUpperCase()}`;
          return { messages: message };
        }

        //Verificar a que hora registro inicio de break
        const knowHourtoRegisterStartBreak = await db.userAlreadyMarkedToday(
          constant.tableAssist,
          body.idUser,
          date,
          constant.typeRegisterStartBreak
        );
        const hourStartBreakThatRegitered = await helpers.parseHourToMinutes(
          knowHourtoRegisterStartBreak[0].Hora
        );

        const timeToBreak = hourStartBreakThatRegitered + pTimeBreak[0].tiempo;

        if (pTimeInHoursFormat < timeToBreak) {
          const timeHaveOfBreak =
            hourStartBreakThatRegitered +
            pTimeBreak[0].tiempo -
            pTimeInHoursFormat;
          message = `Todavía dispone de ${timeHaveOfBreak} minutos para poder registrar su ${pTypeMarkDescription.descripcion.toUpperCase()}`;
          return { messages: message };
        }

        var descriptionValidation = pGetTypesValidation[0].descripcion;
        var timeLateAfterMark = 0;

        if (pTimeInHoursFormat > constant.timeLimitToRegisterEndBreak) {
          timeLateAfterMark = 1;
          idvalidation = 2;
          showForm = 1;
          descriptionValidation = pGetTypesValidation[1].descripcion;
        }
        if (pTimeInHoursFormat > timeToBreak + 5) {
          //+5 por la tolerancia
          timeLateAfterMark = 2;
          idvalidation = 2;
          showForm = 1;
          descriptionValidation = pGetTypesValidation[1].descripcion;
        }

        const assists = {
          /* IdAsistencias: body.id, */
          IdUsuarios: body.idUser,
          Direccion: body.address,
          Fecha: date,
          Hora: pFormattedTime,
          idTMarcacion: body.idTypesMarking,
          idValidacion: idvalidation,
          idValidacionSecond: idvalidation,
          Created_by: body.idUser,
          Updated_at: "0000-00-00",
          Updated_by: 0,
          idHorario: pIdSchedule.IdHorarios,
        };
        await db.add(constant.tableAssist, assists);

        if (idvalidation == 2) {
          if (timeLateAfterMark == 1) {
            return {
              idTipoValidacion: idvalidation,
              idMostrarForm: showForm,
              "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
              Detalle: `Ya que el horario para ${pTypeMarkDescription.descripcion} es hasta las 15:00`,
            };
          }
          if (timeLateAfterMark == 2) {
            const timeToBreakInHours = await helpers.parseMinutesToHour(
              timeToBreak
            );
            return {
              idTipoValidacion: idvalidation,
              idMostrarForm: showForm,
              "Registrado como": `La asistencia ha sido registrada como: ${descriptionValidation.toUpperCase()}.`,
              Detalle: `Ya que debio registrar su ${pTypeMarkDescription.descripcion} hasta las ${timeToBreakInHours} `,
            };
          }
        }
        return {
          idTipoValidacion: idvalidation,
          idMostrarForm: showForm,
          "Registrado como": `La asistencia de ${pTypeMarkDescription.descripcion.toUpperCase()} ha sido registrada como: ${descriptionValidation.toUpperCase()}`,
          Detalle: `Hora de registro: ${pFormattedTime} ¡gracias por su puntualidad!`,
        };
      }
    }
    message = `No dispones de tiempo para descanso.`;
    return { messages: message };
  }

  /* 📌 Función para comprobar si ya registro el registro previo para que pueda registrar el siguiente  */
  async function checkIfAlreadyRegisterPrevious(
    pIdTypesMarking,
    pTypeMarkNext,
    pIdUser,
    pDate,
    pTableAssist,
    pTypeMarkToCheck
  ) {
    if (pIdTypesMarking === pTypeMarkNext) {
      let userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(
        pTableAssist, //tableAssist,
        pIdUser, //body.idUser,
        pDate, //date,
        pTypeMarkToCheck
      );
      if (userAlreadyMarkedEntry.length === 0) {
        //Si es cero aun no registra la asistencia anterior
        return true;
      }
    }
    return false;
  }

  /* 📌 Función para comprobar que no registre doble el mismo tipo  */
  async function checkIfAlreadyRegister(
    pIdTypesMarking,
    pIdUser,
    pDate,
    pTableAssist
  ) {
    let userAlreadyMarkedEntry = await db.userAlreadyMarkedToday(
      pTableAssist, //tableAssist,
      pIdUser, //body.idUser,
      pDate, //date,
      pIdTypesMarking //Entrada
    );
    if (userAlreadyMarkedEntry.length > 0) {
      return true;
    } else {
      return false;
    }
  }

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
        constant.tableAssist,
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
    addMarkingOnSite,
    addMarkingVirtual,
    update,
  };
};