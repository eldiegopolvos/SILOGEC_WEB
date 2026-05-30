// src/modules/ecommerce/rules/ecommerceRules.js

import {
  CANALES_ENTREGA_ECOM,
  CONDICIONES_OPERATIVAS_ECOM,
  CORTES_RECOLECCION_ECOM,
  ESTATUS_LOTE_ECOM,
  ESTATUS_PEDIDO_CIERRE,
  ESTATUS_PEDIDO_CIERRE_LOTE,
  ESTATUS_PEDIDO_ECOM,
  GUIAS_ESPECIALES_ECOM,
  HORA_CORTE_GENERAL_ECOM,
  HORA_INICIO_RECEPCION_ECOM,
  HORA_LIMITE_RECEPCION_ECOM,
  MOTIVOS_NO_PROCESADO_ECOM,
  TIPOS_ENVIO_ECOM,
} from "../constants";

// ======================================================
// HELPERS GENERALES
// ======================================================

export function normalizarTexto(valor = "") {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

export function normalizarReferencia(valor = "") {
  return normalizarTexto(valor).replace(/\s+/g, "");
}

export function convertirHoraAMinutos(hora = "") {
  if (!hora || typeof hora !== "string") return null;

  const partes = hora.trim().split(":");
  if (partes.length < 2) return null;

  const horas = Number(partes[0]);
  const minutos = Number(partes[1]);

  if (Number.isNaN(horas) || Number.isNaN(minutos)) return null;
  if (horas < 0 || horas > 23 || minutos < 0 || minutos > 59) return null;

  return horas * 60 + minutos;
}

export function compararHoras(horaA, horaB) {
  const minutosA = convertirHoraAMinutos(horaA);
  const minutosB = convertirHoraAMinutos(horaB);

  if (minutosA === null || minutosB === null) return 0;

  if (minutosA > minutosB) return 1;
  if (minutosA < minutosB) return -1;
  return 0;
}

export function obtenerFechaCorta(fecha = "") {
  if (!fecha) return "";
  return String(fecha).slice(0, 10);
}

function parsearFechaOperativa(fecha = "") {
  const texto = obtenerFechaCorta(fecha).trim();
  if (!texto) return null;

  const iso = texto.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (iso) {
    return {
      year: Number(iso[1]),
      month: Number(iso[2]),
      day: Number(iso[3]),
    };
  }

  const localMx = texto.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (localMx) {
    return {
      year: Number(localMx[3]),
      month: Number(localMx[2]),
      day: Number(localMx[1]),
    };
  }

  const date = new Date(texto);
  if (Number.isNaN(date.getTime())) return null;

  return {
    year: date.getFullYear(),
    month: date.getMonth() + 1,
    day: date.getDate(),
  };
}

function fechaOperativaATiempo(fecha = "") {
  const parsed = parsearFechaOperativa(fecha);
  if (!parsed) return null;
  return Date.UTC(parsed.year, parsed.month - 1, parsed.day);
}

export function esMismaFecha(fechaA, fechaB) {
  const a = fechaOperativaATiempo(fechaA);
  const b = fechaOperativaATiempo(fechaB);

  if (a === null || b === null) return false;

  return a === b;
}

export function esFechaPosterior(fechaA, fechaB) {
  const a = fechaOperativaATiempo(fechaA);
  const b = fechaOperativaATiempo(fechaB);

  if (a === null || b === null) return false;

  return a > b;
}

// ======================================================
// VENTANA OPERATIVA E-COMMERCE
// ======================================================

export function esDentroVentanaOperativa(
  hora,
  horaInicio = HORA_INICIO_RECEPCION_ECOM,
  horaFin = HORA_LIMITE_RECEPCION_ECOM
) {
  const minutosHora = convertirHoraAMinutos(hora);
  const minutosInicio = convertirHoraAMinutos(horaInicio);
  const minutosFin = convertirHoraAMinutos(horaFin);

  if (
    minutosHora === null ||
    minutosInicio === null ||
    minutosFin === null
  ) {
    return false;
  }

  return minutosHora >= minutosInicio && minutosHora <= minutosFin;
}

export function esFueraVentanaOperativa(hora) {
  return !esDentroVentanaOperativa(hora);
}

// ======================================================
// CORTES DE RECOLECCIÃ“N
// ======================================================

export function obtenerCorteRecoleccionAplicable(paqueteria = "") {
  const paqueteriaNormalizada = normalizarTexto(paqueteria);

  if (!paqueteriaNormalizada || paqueteriaNormalizada === "PENDIENTE") {
    return HORA_CORTE_GENERAL_ECOM;
  }

  return (
    CORTES_RECOLECCION_ECOM[paqueteriaNormalizada] ||
    CORTES_RECOLECCION_ECOM.DEFAULT ||
    HORA_CORTE_GENERAL_ECOM
  );
}

export function esPosteriorCorteRecoleccion(hora, paqueteria = "") {
  const corte = obtenerCorteRecoleccionAplicable(paqueteria);
  return compararHoras(hora, corte) === 1;
}

// ======================================================
// CLASIFICACIÃ“N OPERATIVA MAGENTO / STORE PICKUP / LOCAL
// ======================================================

export function esGuiaIgualPedido(pedido = "", guia = "") {
  const pedidoNormalizado = normalizarReferencia(pedido);
  const guiaNormalizada = normalizarReferencia(guia);

  if (!pedidoNormalizado || !guiaNormalizada) return false;

  return pedidoNormalizado === guiaNormalizada;
}

export function esGuiaStorePickup(pedido = "", guia = "", plataforma = "") {
  const guiaNormalizada = normalizarTexto(guia);
  const plataformaNormalizada = normalizarTexto(plataforma);

  return (
    guiaNormalizada === normalizarTexto(GUIAS_ESPECIALES_ECOM.STORE_PICKUP) ||
    (plataformaNormalizada === "MAGENTO" && guiaNormalizada.startsWith("900"))
  );
}

export function esGuiaMarketplaceLocal(guia = "") {
  const guiaNormalizada = normalizarTexto(guia);

  return (
    guiaNormalizada ===
      normalizarTexto(GUIAS_ESPECIALES_ECOM.MARKETPLACE_LOCAL) ||
    guiaNormalizada ===
      normalizarTexto(GUIAS_ESPECIALES_ECOM.MENSAJERIA_INTERNA)
  );
}

export function esPaqueteriaMensajeriaInterna(paqueteria = "") {
  return normalizarTexto(paqueteria) === "MENSAJERIA INTERNA";
}

export function esPaqueteriaStorePickup(paqueteria = "") {
  return normalizarTexto(paqueteria) === "STORE PICKUP";
}

export function resolverClasificacionEnvioEcom({
  pedido = "",
  guia = "",
  paqueteria = "",
  plataforma = "",
} = {}) {
  const plataformaNormalizada = normalizarTexto(plataforma);
  const paqueteriaNormalizada = normalizarTexto(paqueteria);
  const guiaTextoNormalizado = normalizarTexto(guia);
  const guiaUtil =
   guiaTextoNormalizado === "SIN GUIA" || guiaTextoNormalizado === "SIN GUÃA"
     ? ""
     : guia;

  // Regla: si la guÃ­a coincide con el pedido, es Store Pickup.
  if (
    esGuiaStorePickup(pedido, guia, plataforma) ||
    esPaqueteriaStorePickup(paqueteria)
  ) {
    return {
      plataformaNormalizada,
      tipoEnvio: TIPOS_ENVIO_ECOM.STORE_PICKUP,
      canalEntrega: CANALES_ENTREGA_ECOM.VALIJA_SUCURSAL,
      paqueteriaSugerida: "Store Pickup",
      guiaSugerida: guiaUtil || pedido || GUIAS_ESPECIALES_ECOM.STORE_PICKUP,
      condicionOperativa:
        CONDICIONES_OPERATIVAS_ECOM.STORE_PICKUP_DETECTADO,
      esStorePickup: true,
      esEcommerceLocal: false,
      esPaqueteriaExterna: false,
    };
  }

  // E-commerce local / mensajerÃ­a interna queda fuera de este flujo.
  // Se trabajarÃ¡ despuÃ©s en el mÃ³dulo de Incidencias o MensajerÃ­a Interna.

  // Si tiene guÃ­a y no es caso especial, se considera forÃ¡neo / paqueterÃ­a externa.
  if (guiaUtil && paqueteriaNormalizada && paqueteriaNormalizada !== "PENDIENTE") {
    return {
      plataformaNormalizada,
      tipoEnvio: TIPOS_ENVIO_ECOM.ECOMMERCE_FORANEO,
      canalEntrega: CANALES_ENTREGA_ECOM.PAQUETERIA_EXTERNA,
      paqueteriaSugerida: paqueteria,
      guiaSugerida: guiaUtil,
      condicionOperativa: CONDICIONES_OPERATIVAS_ECOM.SIN_CONDICION,
      esStorePickup: false,
      esEcommerceLocal: false,
      esPaqueteriaExterna: true,
    };
  }

  return {
    plataformaNormalizada,
    tipoEnvio: TIPOS_ENVIO_ECOM.SIN_CLASIFICAR,
    canalEntrega: CANALES_ENTREGA_ECOM.SIN_CANAL,
    paqueteriaSugerida: paqueteria || "Pendiente",
    guiaSugerida: guia || "",
    condicionOperativa: CONDICIONES_OPERATIVAS_ECOM.SIN_CONDICION,
    esStorePickup: false,
    esEcommerceLocal: false,
    esPaqueteriaExterna: false,
  };
}

// ======================================================
// CONDICIÃ“N DE INGRESO
// ======================================================

export function resolverCondicionIngreso({
  horaIngreso,
  paqueteria = "",
  pedido = "",
  guia = "",
  plataforma = "",
} = {}) {
  const clasificacion = resolverClasificacionEnvioEcom({
    pedido,
    guia,
    paqueteria,
    plataforma,
  });

  const fueraVentana = esFueraVentanaOperativa(horaIngreso);

  if (fueraVentana) {
    return {
      ...clasificacion,
      condicionIngreso: CONDICIONES_OPERATIVAS_ECOM.FUERA_VENTANA_OPERATIVA,
      esFueraVentanaOperativa: true,
      posteriorCorteRecoleccion: false,
      corteRecoleccionAplicable: obtenerCorteRecoleccionAplicable(paqueteria),
      afectaKpiOperativo: false,
      afectaSlaOperativo: false,
    };
  }

  // Store Pickup no se mide con corte de recolecciÃ³n de paqueterÃ­a externa.
  if (clasificacion.esStorePickup) {
    return {
      ...clasificacion,
      condicionIngreso: CONDICIONES_OPERATIVAS_ECOM.STORE_PICKUP_DETECTADO,
      esFueraVentanaOperativa: false,
      posteriorCorteRecoleccion: false,
      corteRecoleccionAplicable: null,
      afectaKpiOperativo: true,
      afectaSlaOperativo: true,
    };
  }

  // E-commerce local queda clasificado, pero su operaciÃ³n completa serÃ¡ pÃ¡gina futura.
  if (clasificacion.esEcommerceLocal) {
    const posteriorCorteGeneral =
      compararHoras(horaIngreso, HORA_CORTE_GENERAL_ECOM) === 1;

    return {
      ...clasificacion,
      condicionIngreso: posteriorCorteGeneral
        ? CONDICIONES_OPERATIVAS_ECOM.PROGRAMAR_ENTREGA_MANANA
        : CONDICIONES_OPERATIVAS_ECOM.ASIGNAR_MENSAJERO,
      esFueraVentanaOperativa: false,
      posteriorCorteRecoleccion: posteriorCorteGeneral,
      corteRecoleccionAplicable: HORA_CORTE_GENERAL_ECOM,
      afectaKpiOperativo: true,
      afectaSlaOperativo: true,
    };
  }

  const posteriorCorte = esPosteriorCorteRecoleccion(
    horaIngreso,
    paqueteria
  );

  if (posteriorCorte) {
    return {
      ...clasificacion,
      condicionIngreso:
        CONDICIONES_OPERATIVAS_ECOM.POSTERIOR_CORTE_RECOLECCION,
      esFueraVentanaOperativa: false,
      posteriorCorteRecoleccion: true,
      corteRecoleccionAplicable: obtenerCorteRecoleccionAplicable(paqueteria),
      afectaKpiOperativo: false,
      afectaSlaOperativo: true,
    };
  }

  return {
    ...clasificacion,
    condicionIngreso: CONDICIONES_OPERATIVAS_ECOM.DENTRO_VENTANA,
    esFueraVentanaOperativa: false,
    posteriorCorteRecoleccion: false,
    corteRecoleccionAplicable: obtenerCorteRecoleccionAplicable(paqueteria),
    afectaKpiOperativo: true,
    afectaSlaOperativo: true,
  };
}

// ======================================================
// ESTATUS INICIAL DEL PEDIDO
// ======================================================

export function resolverEstatusInicialPedido({
  horaIngreso,
  paqueteria = "",
  pedido = "",
  guia = "",
  plataforma = "",
} = {}) {
  const condicion = resolverCondicionIngreso({
    horaIngreso,
    paqueteria,
    pedido,
    guia,
    plataforma,
  });

  // Fuera de ventana se queda como condiciÃ³n interna, no como estatus visible.
  if (
    condicion.condicionIngreso ===
    CONDICIONES_OPERATIVAS_ECOM.FUERA_VENTANA_OPERATIVA
  ) {
    return ESTATUS_PEDIDO_ECOM.RECIBIDO;
  }

  return ESTATUS_PEDIDO_ECOM.EN_PROCESO;
}

// ======================================================
// VALIDACIONES DE ESTATUS
// ======================================================

export function esEstatusPedidoCierre(estatusPedido) {
  return ESTATUS_PEDIDO_CIERRE.includes(estatusPedido);
}

export function esEstatusPedidoCierreLote(estatusPedido) {
  return ESTATUS_PEDIDO_CIERRE_LOTE.includes(estatusPedido);
}

export function esEstatusManualProtegidoRegla(estatusPedido) {
  return [
    ESTATUS_PEDIDO_ECOM.CANCELADO,
    ESTATUS_PEDIDO_ECOM.RETORNO,
    ESTATUS_PEDIDO_ECOM.REENVIO,
  ].includes(estatusPedido);
}

// ======================================================
// NO PROCESADO MISMO DÃA
// ======================================================

export function resolverNoProcesadoMismoDia({
  fechaIngreso,
  horaIngreso,
  fechaFinTrabajo,
  horaFinTrabajo,
  fechaInicioTrabajo,
  horaInicioTrabajo,
  fechaCambioEstatus,
  horaCambioEstatus,
  estatusPedido,
  paqueteria = "",
  pedido = "",
  guia = "",
  plataforma = "",
  condicionIngreso,
  esFueraVentanaOperativa: fueraVentanaFlag,
  posteriorCorteRecoleccion: posteriorCorteFlag,
  esStorePickup: storePickupFlag,
  esEcommerceLocal: ecommerceLocalFlag,
} = {}) {
  const condicionBase = resolverCondicionIngreso({
    horaIngreso,
    paqueteria,
    pedido,
    guia,
    plataforma,
  });

  const condicionFinal = condicionIngreso || condicionBase.condicionIngreso;

  const esFueraVentana =
    fueraVentanaFlag ??
    condicionFinal ===
      CONDICIONES_OPERATIVAS_ECOM.FUERA_VENTANA_OPERATIVA;

  const posteriorCorte =
    posteriorCorteFlag ??
    condicionFinal ===
      CONDICIONES_OPERATIVAS_ECOM.POSTERIOR_CORTE_RECOLECCION;

  const esStorePickup =
    storePickupFlag ??
    condicionBase.tipoEnvio === TIPOS_ENVIO_ECOM.STORE_PICKUP;

  const esEcommerceLocal =
    ecommerceLocalFlag ??
    condicionBase.tipoEnvio === TIPOS_ENVIO_ECOM.ECOMMERCE_LOCAL;

  // Fuera de ventana no castiga al operador el mismo dÃ­a.
  if (esFueraVentana) {
    return {
      noProcesadoMismoDia: false,
      motivoNoProcesadoMismoDia:
        MOTIVOS_NO_PROCESADO_ECOM.JUSTIFICADO_FUERA_VENTANA,
      afectaKpiOperativo: false,
    };
  }

  // Store Pickup cuenta para E-commerce, pero no se evalÃºa con corte externo.
  if (esStorePickup) {
    if (fechaFinTrabajo && esMismaFecha(fechaFinTrabajo, fechaIngreso)) {
      return {
        noProcesadoMismoDia: false,
        motivoNoProcesadoMismoDia:
          MOTIVOS_NO_PROCESADO_ECOM.JUSTIFICADO_STORE_PICKUP,
        afectaKpiOperativo: true,
      };
    }

    if (
      fechaFinTrabajo &&
      fechaIngreso &&
      esFechaPosterior(fechaFinTrabajo, fechaIngreso)
    ) {
      return {
        noProcesadoMismoDia: true,
        motivoNoProcesadoMismoDia:
          MOTIVOS_NO_PROCESADO_ECOM.NO_TERMINADO_MISMO_DIA,
        afectaKpiOperativo: true,
      };
    }
  }

  // E-commerce local queda preparado. Su detalle operativo serÃ¡ flujo futuro.
  if (esEcommerceLocal) {
    return {
      noProcesadoMismoDia: false,
      motivoNoProcesadoMismoDia:
        MOTIVOS_NO_PROCESADO_ECOM.JUSTIFICADO_ECOMMERCE_LOCAL,
      afectaKpiOperativo: true,
    };
  }

  // Posterior al corte de recolecciÃ³n queda justificado.
  if (posteriorCorte) {
    return {
      noProcesadoMismoDia: false,
      motivoNoProcesadoMismoDia:
        MOTIVOS_NO_PROCESADO_ECOM.JUSTIFICADO_POSTERIOR_CORTE,
      afectaKpiOperativo: false,
    };
  }

  // Si inicia trabajo al dÃ­a siguiente sin causa justificada, afecta.
  if (
    fechaInicioTrabajo &&
    fechaIngreso &&
    esFechaPosterior(fechaInicioTrabajo, fechaIngreso)
  ) {
    return {
      noProcesadoMismoDia: true,
      motivoNoProcesadoMismoDia:
        MOTIVOS_NO_PROCESADO_ECOM.PROCESO_INICIADO_DIA_SIGUIENTE,
      afectaKpiOperativo: true,
    };
  }

  // Si se terminÃ³ el mismo dÃ­a, cumple.
  if (fechaFinTrabajo && esMismaFecha(fechaFinTrabajo, fechaIngreso)) {
    return {
      noProcesadoMismoDia: false,
      motivoNoProcesadoMismoDia: MOTIVOS_NO_PROCESADO_ECOM.SIN_MOTIVO,
      afectaKpiOperativo: true,
    };
  }

  // Si se terminÃ³ otro dÃ­a, afecta.
  if (
    fechaFinTrabajo &&
    fechaIngreso &&
    esFechaPosterior(fechaFinTrabajo, fechaIngreso)
  ) {
    return {
      noProcesadoMismoDia: true,
      motivoNoProcesadoMismoDia:
        MOTIVOS_NO_PROCESADO_ECOM.NO_TERMINADO_MISMO_DIA,
      afectaKpiOperativo: true,
    };
  }

  // Cambio tardÃ­o de estatus para cerrar/cancelar/retorno/reenvÃ­o.
  if (
    esEstatusPedidoCierre(estatusPedido) &&
    fechaCambioEstatus &&
    horaCambioEstatus &&
    esMismaFecha(fechaCambioEstatus, fechaIngreso) &&
    compararHoras(horaCambioEstatus, HORA_LIMITE_RECEPCION_ECOM) === 1
  ) {
    return {
      noProcesadoMismoDia: true,
      motivoNoProcesadoMismoDia:
        MOTIVOS_NO_PROCESADO_ECOM.CAMBIO_ESTATUS_FUERA_HORARIO,
      afectaKpiOperativo: true,
    };
  }

  return {
    noProcesadoMismoDia: false,
    motivoNoProcesadoMismoDia: MOTIVOS_NO_PROCESADO_ECOM.SIN_MOTIVO,
    afectaKpiOperativo: true,
  };
}

// ======================================================
// ESTATUS DE LOTE
// ======================================================

export function esPedidoResueltoParaCierreLote(pedido = {}) {
  return esEstatusPedidoCierreLote(pedido.estatus);
}

export function resolverEstatusLotePorPedidos(pedidosDelLote = []) {
  if (!Array.isArray(pedidosDelLote) || pedidosDelLote.length === 0) {
    return ESTATUS_LOTE_ECOM.CREADO;
  }

  const todosEnviados = pedidosDelLote.every(
    (pedido) => pedido.estatus === ESTATUS_PEDIDO_ECOM.ENVIADO
  );

  if (todosEnviados) {
    return ESTATUS_LOTE_ECOM.ENVIADO;
  }

  const todosResueltos = pedidosDelLote.every((pedido) =>
    esPedidoResueltoParaCierreLote(pedido)
  );

  if (todosResueltos) {
    return ESTATUS_LOTE_ECOM.LOTE_CERRADO;
  }

  return ESTATUS_LOTE_ECOM.CREADO;
}

// ======================================================
// RETORNOS
// ======================================================

export function esRetornoOperativo(estatusPedido) {
  return estatusPedido === ESTATUS_PEDIDO_ECOM.RETORNO;
}

export function retornoDebeRegistrarEntregaAlmacen(estatusPedido) {
  return esRetornoOperativo(estatusPedido);
}

export function construirPayloadRetornoBase({
  pedido = {},
  usuarioActivo = "",
  fechaActual = "",
  horaActual = "",
} = {}) {
  return {
    IdPedidoECOM: pedido.id || pedido.IdPedidoECOM || null,
    Pedido: pedido.pedido || pedido.Pedido || "",
    Guia: pedido.guia || pedido.Guia || "",
    Plataforma: pedido.plataforma || pedido.Plataforma || "",
    Paqueteria: pedido.paqueteria || pedido.Paqueteria || "",

    FechaIngresoRetorno: fechaActual,
    HoraIngresoRetorno: horaActual,
    UsuarioIngresoRetorno: usuarioActivo,

    FechaEntregaRetorno: "",
    HoraEntregaRetorno: "",
    UsuarioEntregaRetorno: "",
    NombreRecibeRetorno: "",
    NumEmpleadoRecibeRetorno: "",
    AreaRecibeRetorno: "",

    EstatusRetorno: "RETORNO RECIBIDO",
    ObservacionesRetorno: "",
    EvidenciaRetornoUrl: "",
  };
}

// ======================================================
// INDICADORES INTERNOS DEL PEDIDO
// Base futura para PDF / backend / auditorÃ­a.
// ======================================================

export function construirIndicadoresInternosPedido({
  fechaIngreso,
  horaIngreso,
  fechaFinTrabajo,
  horaFinTrabajo,
  fechaInicioTrabajo,
  horaInicioTrabajo,
  fechaCambioEstatus,
  horaCambioEstatus,
  estatusPedido,
  paqueteria,
  pedido,
  guia,
  plataforma,
} = {}) {
  const condicion = resolverCondicionIngreso({
    horaIngreso,
    paqueteria,
    pedido,
    guia,
    plataforma,
  });

  const noProcesado = resolverNoProcesadoMismoDia({
    fechaIngreso,
    horaIngreso,
    fechaFinTrabajo,
    horaFinTrabajo,
    fechaInicioTrabajo,
    horaInicioTrabajo,
    fechaCambioEstatus,
    horaCambioEstatus,
    estatusPedido,
    paqueteria,
    pedido,
    guia,
    plataforma,
    condicionIngreso: condicion.condicionIngreso,
    esFueraVentanaOperativa: condicion.esFueraVentanaOperativa,
    posteriorCorteRecoleccion: condicion.posteriorCorteRecoleccion,
    esStorePickup: condicion.esStorePickup,
    esEcommerceLocal: condicion.esEcommerceLocal,
  });

  return {
    ...condicion,
    ...noProcesado,
    bloqueoCondicionOperativa: true,
  };
}
