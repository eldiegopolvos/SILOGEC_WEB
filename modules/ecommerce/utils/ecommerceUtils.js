import {
  CLAVES_PLATAFORMA,
  ESTATUS_MANUALES_PROTEGIDOS,
  STORAGE_LOTE_COUNTER_KEY,
} from "../constants";

export const crearId = () => {
  if (window.crypto?.randomUUID) return crypto.randomUUID();
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
};

export const fechaActualMX = () =>
  new Date().toLocaleDateString("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

export const horaActualMX = () => {
  const ahora = new Date();
  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");
  return `${horas}:${minutos}:${segundos}`;
};

export const limpiarHora = (hora) => {
  if (!hora) return horaActualMX();
  if (String(hora).includes(".")) return String(hora).split(".")[0];
  return hora;
};

export const normalizarTextoPedido = (valor) =>
  String(valor || "").trim().toUpperCase().replace(/\s+/g, "");

export const normalizarGuia = (valor) =>
  String(valor || "").trim().toUpperCase().replace(/\s+/g, "");

const PEDIDOS_DEMO_PREDETERMINADOS = new Set([
  "204231A2491",
  "ML-88271645",
  "MAG-202605-0182",
]);

export const esPedidoDemoPredeterminado = (pedido = {}) =>
  PEDIDOS_DEMO_PREDETERMINADOS.has(normalizarTextoPedido(pedido.pedido));

export const removerPedidosDemoPredeterminados = (pedidos = []) =>
  pedidos.filter((pedido) => !esPedidoDemoPredeterminado(pedido));

export const estaDentroVentanaRecepcionECOM = () => {
  const ahora = new Date();
  const minutosActuales = ahora.getHours() * 60 + ahora.getMinutes();
  const minutosLimite = 18 * 60 + 30;
  return minutosActuales <= minutosLimite;
};

export const obtenerEstatusInicialPorVentana = () =>
  estaDentroVentanaRecepcionECOM() ? "RECIBIDO" : "FUERA DE VENTANA";

export const obtenerEstatusProcesoPorVentana = () =>
  estaDentroVentanaRecepcionECOM() ? "EN PROCESO" : "FUERA DE VENTANA";

export const esEstatusManualProtegido = (estatus) =>
  ESTATUS_MANUALES_PROTEGIDOS.includes(estatus);

export const mapearEstatusAnterior = (estatus) => {
  if (!estatus) return "RECIBIDO";
  if (estatus === "PENDIENTE DE TRABAJAR") return "RECIBIDO";
  if (estatus === "FUERA DE HORARIO") return "FUERA DE VENTANA";
  if (estatus === "DIFERENCIA") return "FUERA DE VENTANA";
  return estatus;
};

export const generarFolioLote = (plataforma, idGlobal) => {
  const clave = CLAVES_PLATAFORMA[plataforma] || "GEN";
  const consecutivo = String(idGlobal).padStart(5, "0");
  return `ECOM-${clave}-${consecutivo}`;
};

export const obtenerSiguienteIdLote = () => {
  const actual = Number(localStorage.getItem(STORAGE_LOTE_COUNTER_KEY) || "0");
  const siguiente = actual + 1;
  localStorage.setItem(STORAGE_LOTE_COUNTER_KEY, String(siguiente));
  return siguiente;
};

export const detectarPaqueteriaPorGuia = (
  guia,
  { plataforma = "", pedido = "" } = {}
) => {
  const valor = normalizarGuia(guia);
  if (!valor) return "Pendiente";

  const plataformaNormalizada = normalizarTextoPedido(plataforma);
  if (
    valor === "STOREPICKUP" ||
    (plataformaNormalizada === "MAGENTO" && valor.startsWith("900"))
  ) {
    return "Store Pickup";
  }

  if (/^1Z[A-Z0-9]{16}$/.test(valor)) return "UPS";
  if (/^47\d{8}$/.test(valor)) return "Mercado Libre";
  if (/^\d{10}$/.test(valor)) return "DHL";
  if (/^\d{22}$/.test(valor)) return "Estafeta";
  if (/^\d{12}$/.test(valor)) return "FedEx";
  if (/^(?=.*[A-Z])[A-Z0-9]{12}$/.test(valor)) return "Paquetexpress";

  return "Pendiente";
};

export const normalizarPedidos = (pedidos) =>
  pedidos.map((pedido) => ({
    ...pedido,
    id: pedido.id || crearId(),
    pedido: normalizarTextoPedido(pedido.pedido),
    lote: pedido.lote || "SIN LOTE",
    fechaRegistro: pedido.fechaRegistro || new Date().toISOString(),
    fechaIngreso: pedido.fechaIngreso || fechaActualMX(),
    guia: pedido.guia || "SIN GUÍA",
    paqueteria: pedido.paqueteria || "Pendiente",
    estatus: mapearEstatusAnterior(pedido.estatus),
    horaIngreso: limpiarHora(pedido.horaIngreso),
  }));

export const normalizarLotes = (lotes) =>
  lotes.map((lote) => ({
    id: lote.id || crearId(),
    idLoteGlobal: lote.idLoteGlobal || 0,
    lote: lote.lote || "ECOM-GEN-00000",
    plataforma: lote.plataforma || "Sin plataforma",
    piezasEsperadas: Number(lote.piezasEsperadas || 0),
    piezasEscaneadas: Number(lote.piezasEscaneadas || 0),
    responsable: lote.responsable || "Sin responsable",
    estatus: mapearEstatusAnterior(lote.estatus),
    fechaIngreso: lote.fechaIngreso || fechaActualMX(),
    horaIngreso: limpiarHora(lote.horaIngreso),
    fechaRegistro: lote.fechaRegistro || new Date().toISOString(),
  }));

export const obtenerClaseEstatus = (estatus = "") => {
  const estatusNormalizado = String(estatus || "").trim().toUpperCase();
  const base =
    "rounded-xl px-3 py-2 text-xs font-semibold uppercase leading-none";

  const clases = {
    RECIBIDO: "bg-sky-50 text-sky-700 border border-sky-200",
    CREADO: "bg-slate-100 text-slate-700 border border-slate-200",
    "EN PROCESO": "bg-amber-50 text-amber-700 border border-amber-200",
    TERMINADO: "bg-emerald-50 text-emerald-700 border border-emerald-200",
    "LOTE CERRADO": "bg-emerald-50 text-emerald-700 border border-emerald-200",
    ENVIADO: "bg-indigo-50 text-indigo-700 border border-indigo-200",
    "FUERA DE VENTANA": "bg-red-50 text-red-700 border border-red-200",
    "FUERA DE VENTANA OPERATIVA":
      "bg-red-50 text-red-700 border border-red-200",
    CANCELADO: "bg-rose-50 text-rose-700 border border-rose-200",
    RETORNO: "bg-purple-50 text-purple-700 border border-purple-200",
    REENVIO: "bg-cyan-50 text-cyan-700 border border-cyan-200",
  };

  return `${base} ${
    clases[estatusNormalizado] ||
    "bg-slate-50 text-slate-600 border border-slate-200"
  }`;
};

export const pedidoTieneGuiaValida = (pedido) =>
  Boolean(
    pedido.guia &&
      String(pedido.guia).trim() !== "" &&
      String(pedido.guia).trim().toUpperCase() !== "SIN GUÍA"
  );

export const pedidoTienePaqueteriaValida = (pedido) =>
  Boolean(
    pedido.paqueteria &&
      String(pedido.paqueteria).trim() !== "" &&
      pedido.paqueteria !== "Pendiente"
  );
