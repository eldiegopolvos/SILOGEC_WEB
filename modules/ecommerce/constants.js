// src/modules/ecommerce/constants.js

// ======================================================
// STORAGE LOCAL TEMPORAL
// ======================================================

export const STORAGE_PEDIDOS_KEY = "silogec_ecommerce_pedidos";
export const STORAGE_LOTES_KEY = "silogec_ecommerce_lotes";
export const STORAGE_LOTE_COUNTER_KEY = "silogec_ecommerce_lote_counter";

// ======================================================
// VENTANAS OPERATIVAS E-COMMERCE
// ======================================================

export const HORA_INICIO_RECEPCION_ECOM = "08:00";
export const HORA_LIMITE_RECEPCION_ECOM = "18:30";
export const HORA_CORTE_GENERAL_ECOM = "17:00";

export const CORTES_RECOLECCION_ECOM = {
  UPS: "15:00",
  DHL: "17:00",
  ESTAFETA: "17:00",
  FEDEX: "17:00",
  PAQUETEXPRESS: "17:00",
  "MERCADO LIBRE": "17:00",
  DEFAULT: "17:00",
};

// ======================================================
// PLATAFORMAS OFICIALES
// Plataforma = origen comercial del pedido.
// No confundir con tipo de entrega.
// ======================================================

export const PLATAFORMAS_ECOM = [
  "Amazon",
  "Elektra",
  "Liverpool",
  "Magento",
  "Mercado Libre",
  "Omnipaquete",
  "Total Play",
];

export const CLAVES_PLATAFORMA = {
  Amazon: "AMZN",
  Elektra: "ELKT",
  Liverpool: "LVPL",
  Magento: "MGNT",
  "Mercado Libre": "MELI",
  Omnipaquete: "OMNI",
  "Total Play": "TPLY",
};

// ======================================================
// TIPOS OPERATIVOS DE ENVÍO
// TipoEnvio = cómo debe moverse el pedido.
// ======================================================

export const TIPOS_ENVIO_ECOM = {
  ECOMMERCE_FORANEO: "ECOMMERCE FORÁNEO",
  STORE_PICKUP: "STORE PICKUP",
  ECOMMERCE_LOCAL: "ECOMMERCE LOCAL",
  SIN_CLASIFICAR: "SIN CLASIFICAR",
};

// ======================================================
// CANALES DE ENTREGA
// CanalEntrega = quién o qué flujo mueve físicamente el pedido.
// ======================================================

export const CANALES_ENTREGA_ECOM = {
  PAQUETERIA_EXTERNA: "PAQUETERÍA EXTERNA",
  VALIJA_SUCURSAL: "VALIJA SUCURSAL",
  MENSAJERIA_INTERNA: "MENSAJERÍA INTERNA",
  SIN_CANAL: "SIN CANAL",
};

// ======================================================
// GUÍAS / REFERENCIAS ESPECIALES
// ======================================================

export const GUIAS_ESPECIALES_ECOM = {
  STORE_PICKUP: "STORE PICKUP",
  MARKETPLACE_LOCAL: "MARKETPLACE LOCAL",
  MENSAJERIA_INTERNA: "MENSAJERÍA INTERNA",
};

// ======================================================
// PAQUETERÍAS / CANALES OPERATIVOS
// ======================================================

export const PAQUETERIAS_ECOM = [
  "Pendiente",
  "UPS",
  "DHL",
  "Estafeta",
  "FedEx",
  "Paquetexpress",
  "Mercado Libre",
  "Store Pickup",
  "Mensajería Interna",
];

// ======================================================
// ESTATUS VISIBLES DE PEDIDO
// ======================================================

export const ESTATUS_PEDIDO_ECOM = {
  RECIBIDO: "RECIBIDO",
  EN_PROCESO: "EN PROCESO",
  TERMINADO: "TERMINADO",
  ENVIADO: "ENVIADO",
  CANCELADO: "CANCELADO",
  RETORNO: "RETORNO",
  REENVIO: "REENVIO",
};

// Compatibilidad con componentes actuales.
export const ESTATUS_ECOM = Object.values(ESTATUS_PEDIDO_ECOM);

// ======================================================
// ESTATUS VISIBLES DE LOTE
// ======================================================

export const ESTATUS_LOTE_ECOM = {
  CREADO: "CREADO",
  LOTE_CERRADO: "LOTE CERRADO",
  ENVIADO: "ENVIADO",
  CANCELADO: "CANCELADO",
};

// Compatibilidad con componentes actuales.
export const ESTATUS_LOTE = Object.values(ESTATUS_LOTE_ECOM);

// ======================================================
// ESTATUS DE CIERRE / RESOLUCIÓN
// ======================================================

export const ESTATUS_PEDIDO_CIERRE = [
  ESTATUS_PEDIDO_ECOM.TERMINADO,
  ESTATUS_PEDIDO_ECOM.ENVIADO,
  ESTATUS_PEDIDO_ECOM.CANCELADO,
  ESTATUS_PEDIDO_ECOM.RETORNO,
  ESTATUS_PEDIDO_ECOM.REENVIO,
];

export const ESTATUS_PEDIDO_CIERRE_LOTE = [
  ESTATUS_PEDIDO_ECOM.TERMINADO,
  ESTATUS_PEDIDO_ECOM.CANCELADO,
  ESTATUS_PEDIDO_ECOM.RETORNO,
  ESTATUS_PEDIDO_ECOM.REENVIO,
];

export const ESTATUS_MANUALES_PROTEGIDOS = [
  ESTATUS_PEDIDO_ECOM.CANCELADO,
  ESTATUS_PEDIDO_ECOM.RETORNO,
  ESTATUS_PEDIDO_ECOM.REENVIO,
];

// ======================================================
// CONDICIONES OPERATIVAS INTERNAS
// No deben ser editables por usuario operativo.
// ======================================================

export const CONDICIONES_OPERATIVAS_ECOM = {
  DENTRO_VENTANA: "DENTRO DE VENTANA",
  FUERA_VENTANA_OPERATIVA: "FUERA DE VENTANA OPERATIVA",
  POSTERIOR_CORTE_RECOLECCION: "POSTERIOR A CORTE DE RECOLECCIÓN",
  NO_PROCESADO_MISMO_DIA: "NO PROCESADO MISMO DÍA",
  CAMBIO_ESTATUS_FUERA_HORARIO: "CAMBIO DE ESTATUS FUERA DE HORARIO",
  PROCESO_INICIADO_DIA_SIGUIENTE: "PROCESO INICIADO AL DÍA SIGUIENTE",
  STORE_PICKUP_DETECTADO: "STORE PICKUP DETECTADO",
  ECOMMERCE_LOCAL_DETECTADO: "ECOMMERCE LOCAL DETECTADO",
  ASIGNAR_MENSAJERO: "ASIGNAR MENSAJERO",
  PROGRAMAR_ENTREGA_MANANA: "PROGRAMAR ENTREGA PARA MAÑANA",
  SIN_CONDICION: "SIN CONDICIÓN",
};

// ======================================================
// MOTIVOS NO PROCESADO MISMO DÍA
// ======================================================

export const MOTIVOS_NO_PROCESADO_ECOM = {
  NO_TERMINADO_MISMO_DIA: "NO TERMINADO MISMO DÍA",
  CAMBIO_ESTATUS_FUERA_HORARIO: "CAMBIO DE ESTATUS FUERA DE HORARIO",
  PROCESO_INICIADO_DIA_SIGUIENTE: "PROCESO INICIADO AL DÍA SIGUIENTE",
  LOTE_NO_CERRADO_MISMO_DIA: "LOTE NO CERRADO MISMO DÍA",
  SIN_GUIA_MISMO_DIA: "SIN GUÍA MISMO DÍA",
  JUSTIFICADO_FUERA_VENTANA: "JUSTIFICADO POR FUERA DE VENTANA OPERATIVA",
  JUSTIFICADO_POSTERIOR_CORTE: "JUSTIFICADO POR POSTERIOR A CORTE DE RECOLECCIÓN",
  JUSTIFICADO_STORE_PICKUP: "JUSTIFICADO POR STORE PICKUP",
  JUSTIFICADO_ECOMMERCE_LOCAL: "JUSTIFICADO POR ECOMMERCE LOCAL",
  SIN_MOTIVO: "SIN MOTIVO",
};

// ======================================================
// RETORNOS
// ======================================================

export const ESTATUS_RETORNO_ECOM = {
  RECIBIDO: "RETORNO RECIBIDO",
  ENTREGADO_ALMACEN: "RETORNO ENTREGADO A ALMACÉN",
  EN_INCIDENCIA: "RETORNO EN INCIDENCIA",
};

export const CAMPOS_RETORNO_REQUERIDOS = [
  "NombreRecibeRetorno",
  "NumEmpleadoRecibeRetorno",
  "AreaRecibeRetorno",
];

// ======================================================
// RESPONSABLES
// ======================================================

export const RESPONSABLES_ECOM = [
  "Sandra Barrera",
  "Axel Cuevas",
  "Adrián Vega",
  "Jessica Miranda",
  "Filiberto Cuevas",
  "María Ivonne",
  "Diego Campos",
];
