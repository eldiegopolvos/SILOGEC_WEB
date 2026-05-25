// src/modules/ecommerce/hooks/useEcommerceController.js

import { useEffect, useMemo, useState } from "react";
import { ecommercePedidos } from "../data/ecommerceMockData";
import {
  CANALES_ENTREGA_ECOM,
  ESTATUS_LOTE_ECOM,
  ESTATUS_PEDIDO_ECOM,
  HORA_LIMITE_RECEPCION_ECOM,
  STORAGE_LOTES_KEY,
  STORAGE_LOTE_COUNTER_KEY,
  STORAGE_PEDIDOS_KEY,
  TIPOS_ENVIO_ECOM,
} from "../constants";
import {
  crearId,
  detectarPaqueteriaPorGuia,
  esEstatusManualProtegido,
  fechaActualMX,
  generarFolioLote,
  horaActualMX,
  mapearEstatusAnterior,
  normalizarGuia,
  normalizarLotes,
  normalizarPedidos,
  normalizarTextoPedido,
  obtenerSiguienteIdLote,
  pedidoTieneGuiaValida,
  pedidoTienePaqueteriaValida,
} from "../utils/ecommerceUtils";
import {
  construirIndicadoresInternosPedido,
  resolverClasificacionEnvioEcom,
  resolverEstatusLotePorPedidos as resolverEstatusLotePorPedidosRegla,
} from "../rules/ecommerceRules";

function cargarPedidosIniciales() {
  try {
    const almacenados = localStorage.getItem(STORAGE_PEDIDOS_KEY);
    if (almacenados) {
      const parsed = JSON.parse(almacenados);
      return normalizarPedidos(parsed).map((pedido) =>
        enriquecerPedidoConReglasEcommerceBase(pedido)
      );
    }
  } catch (error) {
    console.warn("No se pudieron cargar pedidos temporales:", error);
  }

  return normalizarPedidos(ecommercePedidos).map((pedido) =>
    enriquecerPedidoConReglasEcommerceBase(pedido)
  );
}

function cargarLotesIniciales() {
  try {
    const almacenados = localStorage.getItem(STORAGE_LOTES_KEY);
    if (almacenados) {
      const parsed = JSON.parse(almacenados);
      return normalizarLotes(parsed).map((lote) => ({
        ...lote,
        estatus:
          lote.estatus === "TERMINADO"
            ? ESTATUS_LOTE_ECOM.LOTE_CERRADO
            : lote.estatus === "RECIBIDO" || lote.estatus === "EN PROCESO"
              ? ESTATUS_LOTE_ECOM.CREADO
              : lote.estatus || ESTATUS_LOTE_ECOM.CREADO,
        folioLote: lote.folioLote || lote.lote,
        responsableLote: lote.responsableLote || lote.responsable,
        fechaCreacionLote:
          lote.fechaCreacionLote || lote.fechaIngreso || fechaActualMX(),
        horaCreacionLote:
          lote.horaCreacionLote || lote.horaIngreso || horaActualMX(),
        totalPedidos: lote.totalPedidos || 0,
        pedidosTerminados: lote.pedidosTerminados || 0,
        pedidosNoProcesados: lote.pedidosNoProcesados || 0,
        pedidosFueraVentana: lote.pedidosFueraVentana || 0,
        pedidosPosteriorCorte: lote.pedidosPosteriorCorte || 0,
      }));
    }
  } catch (error) {
    console.warn("No se pudieron cargar lotes temporales:", error);
  }

  return [];
}

function enriquecerPedidoConReglasEcommerceBase(pedidoBase = {}, cambios = {}) {
  const pedido = {
    ...pedidoBase,
    ...cambios,
  };

  const fechaIngreso = pedido.fechaIngreso || fechaActualMX();
  const horaIngreso = pedido.horaIngreso || horaActualMX();

  const guiaOriginal = pedido.guia === "SIN GUÍA" ? "" : pedido.guia || "";
  const guiaNormalizada = normalizarGuia(guiaOriginal);

  const paqueteriaDetectada =
    pedido.paqueteria && pedido.paqueteria !== "Pendiente"
      ? pedido.paqueteria
      : detectarPaqueteriaPorGuia(guiaNormalizada);

  const paqueteriaBase = paqueteriaDetectada || "Pendiente";

  const estatusBase =
    mapearEstatusAnterior(pedido.estatus) || ESTATUS_PEDIDO_ECOM.RECIBIDO;

  const indicadores = construirIndicadoresInternosPedido({
    fechaIngreso,
    horaIngreso,
    fechaFinTrabajo: pedido.fechaFinTrabajo,
    horaFinTrabajo: pedido.horaFinTrabajo,
    fechaInicioTrabajo: pedido.fechaInicioTrabajo,
    horaInicioTrabajo: pedido.horaInicioTrabajo,
    fechaCambioEstatus: pedido.fechaCambioEstatus,
    horaCambioEstatus: pedido.horaCambioEstatus,
    estatusPedido: estatusBase,
    paqueteria: paqueteriaBase,
    pedido: pedido.pedido,
    guia: guiaNormalizada,
    plataforma: pedido.plataforma,
  });

  const guiaFinal =
    indicadores.guiaSugerida ||
    guiaNormalizada ||
    pedido.guia ||
    "SIN GUÍA";

  const paqueteriaFinal =
    indicadores.paqueteriaSugerida || paqueteriaBase || "Pendiente";

  return {
    ...pedido,

    fechaIngreso,
    horaIngreso,

    guia: guiaFinal,
    paqueteria: paqueteriaFinal,

    estatus: estatusBase,

    tipoEnvio:
      indicadores.tipoEnvio ||
      pedido.tipoEnvio ||
      TIPOS_ENVIO_ECOM.SIN_CLASIFICAR,

    canalEntrega:
      indicadores.canalEntrega ||
      pedido.canalEntrega ||
      CANALES_ENTREGA_ECOM.SIN_CANAL,

    condicionIngreso: indicadores.condicionIngreso,
    esFueraVentanaOperativa: indicadores.esFueraVentanaOperativa,
    posteriorCorteRecoleccion: indicadores.posteriorCorteRecoleccion,
    corteRecoleccionAplicable: indicadores.corteRecoleccionAplicable,

    noProcesadoMismoDia: indicadores.noProcesadoMismoDia,
    motivoNoProcesadoMismoDia: indicadores.motivoNoProcesadoMismoDia,

    afectaKpiOperativo: indicadores.afectaKpiOperativo,
    afectaSlaOperativo: indicadores.afectaSlaOperativo,
    bloqueoCondicionOperativa: indicadores.bloqueoCondicionOperativa,

    esStorePickup: indicadores.esStorePickup,
    esEcommerceLocal: indicadores.esEcommerceLocal,
    esPaqueteriaExterna: indicadores.esPaqueteriaExterna,

    fechaActualizacion: pedido.fechaActualizacion || new Date().toISOString(),
  };
}

const defaultNotify = ({ title = "Aviso", message = "" } = {}) => {
  alert([title, message].filter(Boolean).join("\n\n"));
};

const defaultConfirm = ({ message = "" } = {}) => Promise.resolve(confirm(message));

export function useEcommerceController({
  notify = defaultNotify,
  confirm: requestConfirm = defaultConfirm,
} = {}) {
  const [vistaActiva, setVistaActiva] = useState("lotes");
  const [pedidos, setPedidos] = useState(() => cargarPedidosIniciales());
  const [lotes, setLotes] = useState(() => cargarLotesIniciales());

  const [modalPedidoAbierto, setModalPedidoAbierto] = useState(false);
  const [modalLoteAbierto, setModalLoteAbierto] = useState(false);
  const [modalEscaneoAbierto, setModalEscaneoAbierto] = useState(false);
  const [pedidoEditando, setPedidoEditando] = useState(null);
  const [loteSeleccionado, setLoteSeleccionado] = useState(null);
  const [menuAbiertoId, setMenuAbiertoId] = useState(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_PEDIDOS_KEY, JSON.stringify(pedidos));
  }, [pedidos]);

  useEffect(() => {
    localStorage.setItem(STORAGE_LOTES_KEY, JSON.stringify(lotes));
  }, [lotes]);

  const indicadores = useMemo(
    () => ({
      lotes: lotes.length,
      pedidos: pedidos.length,
      terminados: pedidos.filter((p) => p.estatus === ESTATUS_PEDIDO_ECOM.TERMINADO).length,
      enProceso: pedidos.filter((p) => p.estatus === ESTATUS_PEDIDO_ECOM.EN_PROCESO).length,
      enviados: pedidos.filter((p) => p.estatus === ESTATUS_PEDIDO_ECOM.ENVIADO).length,
      fueraVentana: pedidos.filter((p) => p.esFueraVentanaOperativa).length,
    }),
    [pedidos, lotes]
  );

  const pedidosDelLoteSeleccionado = useMemo(() => {
    if (!loteSeleccionado) return [];
    return pedidos.filter((pedido) => pedido.lote === loteSeleccionado.lote);
  }, [pedidos, loteSeleccionado]);

  const enriquecerPedidoConReglasEcommerce = (pedidoBase = {}, cambios = {}) =>
    enriquecerPedidoConReglasEcommerceBase(pedidoBase, cambios);

  const abrirNuevoPedido = () => {
    setPedidoEditando(null);
    setModalPedidoAbierto(true);
  };

  const abrirEditarPedido = (pedido) => {
    setPedidoEditando(pedido);
    setModalPedidoAbierto(true);
  };

  const cerrarModalPedido = () => {
    setModalPedidoAbierto(false);
    setPedidoEditando(null);
  };

  const abrirEscaneoLote = (lote) => {
    setLoteSeleccionado(lote);
    setModalEscaneoAbierto(true);
  };

  const cerrarEscaneoLote = () => {
    setModalEscaneoAbierto(false);
    setLoteSeleccionado(null);
  };

  const actualizarEstatusLotePorPedidos = (loteId, pedidosBase = []) => {
    const pedidosDelLoteActualizados = pedidosBase.filter(
      (pedido) =>
        pedido.lote === loteId ||
        pedido.idLote === loteId ||
        pedido.folioLote === loteId
    );

    const nuevoEstatusLote = resolverEstatusLotePorPedidosRegla(
      pedidosDelLoteActualizados
    );

    const totalPedidos = pedidosDelLoteActualizados.length;

    const pedidosTerminados = pedidosDelLoteActualizados.filter((pedido) =>
      [
        ESTATUS_PEDIDO_ECOM.TERMINADO,
        ESTATUS_PEDIDO_ECOM.ENVIADO,
        ESTATUS_PEDIDO_ECOM.CANCELADO,
        ESTATUS_PEDIDO_ECOM.RETORNO,
        ESTATUS_PEDIDO_ECOM.REENVIO,
      ].includes(pedido.estatus)
    ).length;

    const pedidosNoProcesados = pedidosDelLoteActualizados.filter(
      (pedido) => pedido.noProcesadoMismoDia
    ).length;

    const pedidosFueraVentana = pedidosDelLoteActualizados.filter(
      (pedido) => pedido.esFueraVentanaOperativa
    ).length;

    const pedidosPosteriorCorte = pedidosDelLoteActualizados.filter(
      (pedido) => pedido.posteriorCorteRecoleccion
    ).length;

    const esCierreLote = nuevoEstatusLote === ESTATUS_LOTE_ECOM.LOTE_CERRADO;

    setLotes((prev) =>
      prev.map((lote) => {
        if (lote.lote !== loteId && lote.folioLote !== loteId) return lote;

        const yaEstabaCerrado = lote.estatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO;

        return {
          ...lote,
          estatus: nuevoEstatusLote,
          totalPedidos,
          pedidosTerminados,
          pedidosNoProcesados,
          pedidosFueraVentana,
          pedidosPosteriorCorte,
          fechaCierreLote:
            esCierreLote && !yaEstabaCerrado
              ? fechaActualMX()
              : lote.fechaCierreLote || "",
          horaCierreLote:
            esCierreLote && !yaEstabaCerrado
              ? horaActualMX()
              : lote.horaCierreLote || "",
          usuarioCierreLote:
            esCierreLote && !yaEstabaCerrado
              ? lote.responsable || lote.responsableLote || ""
              : lote.usuarioCierreLote || "",
          fechaActualizacion: new Date().toISOString(),
        };
      })
    );

    setLoteSeleccionado((prev) => {
      if (!prev) return prev;
      if (prev.lote !== loteId && prev.folioLote !== loteId) return prev;

      const yaEstabaCerrado = prev.estatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO;

      return {
        ...prev,
        estatus: nuevoEstatusLote,
        totalPedidos,
        pedidosTerminados,
        pedidosNoProcesados,
        pedidosFueraVentana,
        pedidosPosteriorCorte,
        fechaCierreLote:
          esCierreLote && !yaEstabaCerrado
            ? fechaActualMX()
            : prev.fechaCierreLote || "",
        horaCierreLote:
          esCierreLote && !yaEstabaCerrado
            ? horaActualMX()
            : prev.horaCierreLote || "",
        usuarioCierreLote:
          esCierreLote && !yaEstabaCerrado
            ? prev.responsable || prev.responsableLote || ""
            : prev.usuarioCierreLote || "",
        fechaActualizacion: new Date().toISOString(),
      };
    });
  };

  const guardarPedido = (pedidoFormulario) => {
    const pedidoNormalizado = normalizarTextoPedido(pedidoFormulario.pedido);

    if (!pedidoNormalizado) {
      return {
        ok: false,
        titulo: "Pedido inválido",
        mensaje: "El pedido está vacío o no tiene un formato válido.",
      };
    }

    const duplicado = pedidos.find(
      (pedido) =>
        pedido.id !== pedidoEditando?.id &&
        normalizarTextoPedido(pedido.pedido) === pedidoNormalizado
    );

    if (duplicado) {
      return {
        ok: false,
        titulo: "Pedido duplicado",
        mensaje:
          `El pedido ${pedidoFormulario.pedido} ya existe. ` +
          "No se puede duplicar.",
        details: [
          { label: "Lote", value: duplicado.lote || "SIN LOTE" },
          { label: "Plataforma", value: duplicado.plataforma || "Sin plataforma" },
          { label: "Estatus", value: duplicado.estatus || "Sin estatus" },
        ],
      };
    }

    const guiaNormalizada = normalizarGuia(pedidoFormulario.guia);
    const guiaFinal = guiaNormalizada || "SIN GUÍA";

    const paqueteriaBase =
      pedidoFormulario.paqueteria && pedidoFormulario.paqueteria !== "Pendiente"
        ? pedidoFormulario.paqueteria
        : detectarPaqueteriaPorGuia(guiaFinal);

    const clasificacion = resolverClasificacionEnvioEcom({
      pedido: pedidoNormalizado,
      guia: guiaFinal === "SIN GUÍA" ? "" : guiaFinal,
      paqueteria: paqueteriaBase,
      plataforma: pedidoFormulario.plataforma,
    });

    const paqueteriaFinal = clasificacion.paqueteriaSugerida || paqueteriaBase || "Pendiente";
    const guiaFinalClasificada = clasificacion.guiaSugerida || guiaFinal;

    const guiaValida = guiaFinalClasificada !== "SIN GUÍA";
    const paqueteriaValida = paqueteriaFinal && paqueteriaFinal !== "Pendiente";
    const estatusFinal =
      guiaValida && paqueteriaValida
        ? ESTATUS_PEDIDO_ECOM.TERMINADO
        : pedidoFormulario.estatus || ESTATUS_PEDIDO_ECOM.RECIBIDO;

    if (pedidoEditando) {
      setPedidos((prev) => {
        const pedidosActualizados = prev.map((pedido) => {
          if (pedido.id !== pedidoEditando.id) return pedido;

          const pedidoBase = {
            ...pedido,
            ...pedidoFormulario,
            pedido: pedidoNormalizado,
            guia: guiaFinalClasificada,
            paqueteria: paqueteriaFinal,
            estatus: esEstatusManualProtegido(pedidoFormulario.estatus)
              ? pedidoFormulario.estatus
              : mapearEstatusAnterior(estatusFinal),
            id: pedido.id,
            lote: pedido.lote || "SIN LOTE",
            fechaRegistro: pedido.fechaRegistro,
            fechaIngreso: pedido.fechaIngreso,
            horaIngreso: pedido.horaIngreso,
            fechaActualizacion: new Date().toISOString(),
          };

          return enriquecerPedidoConReglasEcommerce(pedidoBase);
        });

        const editado = pedidosActualizados.find((p) => p.id === pedidoEditando.id);
        if (editado?.lote && editado.lote !== "SIN LOTE") {
          actualizarEstatusLotePorPedidos(editado.lote, pedidosActualizados);
        }

        return pedidosActualizados;
      });

      return { ok: true };
    }

    const nuevoPedidoBase = {
      id: crearId(),
      lote: "SIN LOTE",
      fechaRegistro: new Date().toISOString(),
      fechaIngreso: fechaActualMX(),
      horaIngreso: horaActualMX(),
      ...pedidoFormulario,
      pedido: pedidoNormalizado,
      guia: guiaFinalClasificada,
      paqueteria: paqueteriaFinal,
      estatus: estatusFinal,
    };

    const nuevoPedido = enriquecerPedidoConReglasEcommerce(nuevoPedidoBase);

    setPedidos((prev) => [nuevoPedido, ...prev]);
    return { ok: true };
  };

  const guardarLote = (loteFormulario) => {
    const idGlobal = obtenerSiguienteIdLote();
    const folioLote = generarFolioLote(loteFormulario.plataforma, idGlobal);

    const nuevoLote = {
      id: crearId(),
      idLoteGlobal: idGlobal,
      lote: folioLote,
      folioLote,
      plataforma: loteFormulario.plataforma,

      piezasEsperadas: Number(loteFormulario.piezasEsperadas || 0),
      piezasEscaneadas: loteFormulario.piezasEscaneadas || 0,

      responsable: loteFormulario.responsable,
      responsableLote: loteFormulario.responsable,

      estatus: ESTATUS_LOTE_ECOM.CREADO,
      condicionLote: "SIN CONDICIÓN",

      totalPedidos: 0,
      pedidosTerminados: 0,
      pedidosNoProcesados: 0,
      pedidosFueraVentana: 0,
      pedidosPosteriorCorte: 0,

      fechaIngreso: fechaActualMX(),
      horaIngreso: horaActualMX(),
      fechaCreacionLote: fechaActualMX(),
      horaCreacionLote: horaActualMX(),

      fechaCierreLote: "",
      horaCierreLote: "",
      usuarioCierreLote: "",

      fechaSalida: "",
      horaSalida: "",
      usuarioSalida: "",

      fechaRegistro: new Date().toISOString(),
      fechaActualizacion: new Date().toISOString(),
      ventanaOperativa: HORA_LIMITE_RECEPCION_ECOM,
    };

    setLotes((prev) => [nuevoLote, ...prev]);
    setVistaActiva("lotes");
  };

  const agregarPedidoAlLote = (lote, pedidoEscaneado) => {
    const pedidoNormalizado = normalizarTextoPedido(pedidoEscaneado);

    if (!pedidoNormalizado) {
      return {
        ok: false,
        titulo: "Pedido inválido",
        mensaje: "El código escaneado está vacío o no es válido.",
      };
    }

    const pedidoExistente = pedidos.find(
      (pedido) => normalizarTextoPedido(pedido.pedido) === pedidoNormalizado
    );

    if (pedidoExistente) {
      return {
        ok: false,
        titulo: "Pedido duplicado",
        mensaje:
          `El pedido ${pedidoNormalizado} ya existe en ` +
          `${pedidoExistente.lote || "SIN LOTE"} / ` +
          `${pedidoExistente.plataforma || "Sin plataforma"}. ` +
          `Estatus actual: ${pedidoExistente.estatus || "Sin estatus"}.`,
      };
    }

    const pedidoBase = {
      id: crearId(),
      pedido: pedidoNormalizado,

      lote: lote.lote,
      idLote: lote.id || lote.lote,
      folioLote: lote.folioLote || lote.lote,

      plataforma: lote.plataforma,

      guia: "SIN GUÍA",
      paqueteria: "Pendiente",

      responsable: lote.responsable,
      responsableProceso: lote.responsable,
      usuarioIngreso: lote.responsable,
      usuarioTrabajo: lote.responsable,

      estatus: ESTATUS_PEDIDO_ECOM.EN_PROCESO,

      fechaRegistro: new Date().toISOString(),
      fechaIngreso: fechaActualMX(),
      horaIngreso: horaActualMX(),
      fechaInicioTrabajo: "",
      horaInicioTrabajo: "",
      fechaFinTrabajo: "",
      horaFinTrabajo: "",
      ventanaOperativa: HORA_LIMITE_RECEPCION_ECOM,
    };

    const nuevoPedido = enriquecerPedidoConReglasEcommerce(pedidoBase);

    setPedidos((prev) => {
      const pedidosActualizados = [nuevoPedido, ...prev];

      actualizarEstatusLotePorPedidos(lote.lote, pedidosActualizados);

      return pedidosActualizados;
    });

    const piezasEscaneadasActualizadas = (lote.piezasEscaneadas || 0) + 1;

    setLotes((prev) =>
      prev.map((item) =>
        item.id === lote.id || item.lote === lote.lote
          ? {
              ...item,
              piezasEscaneadas: piezasEscaneadasActualizadas,
              fechaActualizacion: new Date().toISOString(),
            }
          : item
      )
    );

    setLoteSeleccionado((prev) =>
      prev && prev.lote === lote.lote
        ? {
            ...prev,
            piezasEscaneadas: piezasEscaneadasActualizadas,
            fechaActualizacion: new Date().toISOString(),
          }
        : prev
    );

    return { ok: true };
  };

  const eliminarPedidoDelLote = async (pedido) => {
    const confirmar = await requestConfirm({
      title: "Quitar pedido del lote",
      message: `¿Deseas quitar el pedido ${pedido.pedido} del lote?`,
      tone: "warning",
      confirmLabel: "Quitar pedido",
    });
    if (!confirmar) return;

    setPedidos((prev) => {
      const pedidosActualizados = prev.filter((item) => item.id !== pedido.id);
      actualizarEstatusLotePorPedidos(pedido.lote, pedidosActualizados);
      return pedidosActualizados;
    });

    descontarPiezaEscaneada(pedido.lote);
  };

  const actualizarGuiaPedido = (pedidoActual, datos = {}) => {
    const guiaNormalizada = normalizarGuia(datos.guia);
    const guiaFinalInicial = guiaNormalizada || "SIN GUÍA";

    const paqueteriaBase =
      datos.paqueteria && datos.paqueteria !== "Pendiente"
        ? datos.paqueteria
        : guiaFinalInicial === "SIN GUÍA"
          ? datos.paqueteria || "Pendiente"
          : detectarPaqueteriaPorGuia(guiaFinalInicial);

    const clasificacion = resolverClasificacionEnvioEcom({
      pedido: pedidoActual.pedido,
      guia: guiaFinalInicial === "SIN GUÍA" ? "" : guiaFinalInicial,
      paqueteria: paqueteriaBase,
      plataforma: pedidoActual.plataforma,
    });

    const guiaFinal = clasificacion.guiaSugerida || guiaFinalInicial;
    const paqueteriaFinal =
      clasificacion.paqueteriaSugerida || paqueteriaBase || "Pendiente";

    const guiaValida =
      guiaFinal && String(guiaFinal).trim().toUpperCase() !== "SIN GUÍA";
    const paqueteriaValida = paqueteriaFinal && paqueteriaFinal !== "Pendiente";
    const debeTerminar = guiaValida && paqueteriaValida;

    setPedidos((prev) => {
      const pedidosActualizados = prev.map((pedido) => {
        if (pedido.id !== pedidoActual.id) return pedido;

        const pedidoBase = {
          ...pedido,
          guia: guiaFinal,
          paqueteria: paqueteriaFinal,
          tipoEnvio: clasificacion.tipoEnvio,
          canalEntrega: clasificacion.canalEntrega,
          fechaInicioTrabajo:
            debeTerminar && !pedido.fechaInicioTrabajo
              ? fechaActualMX()
              : pedido.fechaInicioTrabajo || "",
          horaInicioTrabajo:
            debeTerminar && !pedido.horaInicioTrabajo
              ? horaActualMX()
              : pedido.horaInicioTrabajo || "",
          fechaFinTrabajo: debeTerminar ? fechaActualMX() : pedido.fechaFinTrabajo || "",
          horaFinTrabajo: debeTerminar ? horaActualMX() : pedido.horaFinTrabajo || "",
          estatus: esEstatusManualProtegido(pedido.estatus)
            ? pedido.estatus
            : debeTerminar
              ? ESTATUS_PEDIDO_ECOM.TERMINADO
              : pedido.estatus || ESTATUS_PEDIDO_ECOM.EN_PROCESO,
          fechaActualizacion: new Date().toISOString(),
        };

        return enriquecerPedidoConReglasEcommerce(pedidoBase);
      });

      const pedidoActualizado = pedidosActualizados.find(
        (pedido) => pedido.id === pedidoActual.id
      );

      if (pedidoActualizado?.lote && pedidoActualizado.lote !== "SIN LOTE") {
        actualizarEstatusLotePorPedidos(
          pedidoActualizado.lote,
          pedidosActualizados
        );
      }

      return pedidosActualizados;
    });
  };

  const asignarGuiaPaqueteriaLote = (loteActual, datos) => {
    const guia = normalizarGuia(datos.guia);
    const paqueteria = datos.paqueteria || "Pendiente";
    const sobrescribir = Boolean(datos.sobrescribir);

    if (!guia && paqueteria === "Pendiente") {
      return {
        ok: false,
        titulo: "Datos incompletos",
        mensaje: "Captura una guía o selecciona una paquetería válida.",
      };
    }

    const pedidosDelLote = pedidos.filter((pedido) => pedido.lote === loteActual.lote);

    if (pedidosDelLote.length === 0) {
      return {
        ok: false,
        titulo: "Lote sin pedidos",
        mensaje: "No hay pedidos escaneados para actualizar.",
      };
    }

    let actualizados = 0;

    const pedidosActualizados = pedidos.map((pedido) => {
      if (pedido.lote !== loteActual.lote) return pedido;

      const tieneGuia = pedidoTieneGuiaValida(pedido);
      const tienePaqueteria = pedidoTienePaqueteriaValida(pedido);
      const debeActualizarGuia = guia && (sobrescribir || !tieneGuia);
      const debeActualizarPaqueteria =
        paqueteria !== "Pendiente" && (sobrescribir || !tienePaqueteria);

      if (!debeActualizarGuia && !debeActualizarPaqueteria) return pedido;

      actualizados += 1;

      const guiaFinal = debeActualizarGuia ? guia : pedido.guia;
      const paqueteriaBase = debeActualizarPaqueteria
        ? paqueteria
        : pedido.paqueteria;

      const clasificacion = resolverClasificacionEnvioEcom({
        pedido: pedido.pedido,
        guia: guiaFinal === "SIN GUÍA" ? "" : guiaFinal,
        paqueteria: paqueteriaBase,
        plataforma: pedido.plataforma,
      });

      const guiaFinalClasificada = clasificacion.guiaSugerida || guiaFinal;
      const paqueteriaFinal =
        clasificacion.paqueteriaSugerida || paqueteriaBase || "Pendiente";

      const guiaValida =
        guiaFinalClasificada &&
        String(guiaFinalClasificada).trim().toUpperCase() !== "SIN GUÍA";
      const paqueteriaValida = paqueteriaFinal && paqueteriaFinal !== "Pendiente";

      const pedidoBase = {
        ...pedido,
        guia: guiaFinalClasificada,
        paqueteria: paqueteriaFinal,
        tipoEnvio: clasificacion.tipoEnvio,
        canalEntrega: clasificacion.canalEntrega,
        fechaInicioTrabajo:
          guiaValida && paqueteriaValida && !pedido.fechaInicioTrabajo
            ? fechaActualMX()
            : pedido.fechaInicioTrabajo || "",
        horaInicioTrabajo:
          guiaValida && paqueteriaValida && !pedido.horaInicioTrabajo
            ? horaActualMX()
            : pedido.horaInicioTrabajo || "",
        fechaFinTrabajo:
          guiaValida && paqueteriaValida
            ? fechaActualMX()
            : pedido.fechaFinTrabajo || "",
        horaFinTrabajo:
          guiaValida && paqueteriaValida
            ? horaActualMX()
            : pedido.horaFinTrabajo || "",
        estatus: esEstatusManualProtegido(pedido.estatus)
          ? pedido.estatus
          : guiaValida && paqueteriaValida
            ? ESTATUS_PEDIDO_ECOM.TERMINADO
            : ESTATUS_PEDIDO_ECOM.EN_PROCESO,
        fechaActualizacion: new Date().toISOString(),
      };

      return enriquecerPedidoConReglasEcommerce(pedidoBase);
    });

    if (actualizados === 0) {
      return {
        ok: false,
        titulo: "Sin cambios aplicados",
        mensaje:
          "No se actualizó ningún pedido. Activa sobrescribir si deseas reemplazar datos existentes.",
      };
    }

    setPedidos(pedidosActualizados);
    actualizarEstatusLotePorPedidos(loteActual.lote, pedidosActualizados);

    return {
      ok: true,
      mensaje: `Se actualizaron ${actualizados} pedido(s) del lote ${loteActual.lote}.`,
    };
  };

  const cambiarEstatusPedido = (pedidoActual, nuevoEstatus) => {
    const esCierreOperativo =
      nuevoEstatus === ESTATUS_PEDIDO_ECOM.TERMINADO ||
      nuevoEstatus === ESTATUS_PEDIDO_ECOM.ENVIADO;

    if (
      esCierreOperativo &&
      (!pedidoTieneGuiaValida(pedidoActual) ||
        !pedidoTienePaqueteriaValida(pedidoActual))
    ) {
      notify({
        title: "Estatus bloqueado",
        message:
          "No puedes avanzar a TERMINADO/ENVIADO un pedido sin guía o con paquetería pendiente.",
        tone: "warning",
      });
      return;
    }

    setPedidos((prev) => {
      const pedidosActualizados = prev.map((pedido) => {
        if (pedido.id !== pedidoActual.id) return pedido;

        const esRetorno = nuevoEstatus === ESTATUS_PEDIDO_ECOM.RETORNO;

        const pedidoBase = {
          ...pedido,
          estatus: nuevoEstatus,
          fechaCambioEstatus: fechaActualMX(),
          horaCambioEstatus: horaActualMX(),
          tieneRetorno: esRetorno ? true : pedido.tieneRetorno || false,
          fechaUltimoRetorno: esRetorno
            ? fechaActualMX()
            : pedido.fechaUltimoRetorno || "",
          fechaIngresoRetorno: esRetorno
            ? pedido.fechaIngresoRetorno || fechaActualMX()
            : pedido.fechaIngresoRetorno || "",
          horaIngresoRetorno: esRetorno
            ? pedido.horaIngresoRetorno || horaActualMX()
            : pedido.horaIngresoRetorno || "",
          fechaActualizacion: new Date().toISOString(),
        };

        return enriquecerPedidoConReglasEcommerce(pedidoBase);
      });

      const pedidoActualizado = pedidosActualizados.find(
        (pedido) => pedido.id === pedidoActual.id
      );

      if (pedidoActualizado?.lote && pedidoActualizado.lote !== "SIN LOTE") {
        actualizarEstatusLotePorPedidos(
          pedidoActualizado.lote,
          pedidosActualizados
        );
      }

      return pedidosActualizados;
    });
  };

  const darSalidaLote = async (loteActual) => {
    const pedidosDelLote = pedidos.filter((pedido) => pedido.lote === loteActual.lote);

    if (pedidosDelLote.length === 0) {
      notify({
        title: "Lote sin pedidos",
        message: `No puedes dar salida al lote ${loteActual.lote} porque no tiene pedidos escaneados.`,
        tone: "warning",
      });
      return;
    }

    const pedidosIncompletos = pedidosDelLote.filter(
      (pedido) =>
        pedido.estatus !== ESTATUS_PEDIDO_ECOM.TERMINADO &&
        ![
          ESTATUS_PEDIDO_ECOM.CANCELADO,
          ESTATUS_PEDIDO_ECOM.RETORNO,
          ESTATUS_PEDIDO_ECOM.REENVIO,
        ].includes(pedido.estatus)
    );

    if (pedidosIncompletos.length > 0) {
      notify({
        title: "Salida bloqueada",
        message:
          `No puedes dar salida al lote ${loteActual.lote}.\n\n` +
          `Hay ${pedidosIncompletos.length} pedido(s) pendientes de terminar o resolver.\n\n` +
          "Primero termina la captura de guías o resuelve las excepciones.",
        tone: "warning",
      });
      return;
    }

    const confirmar = await requestConfirm({
      title: "Confirmar salida",
      message:
        `¿Confirmas la salida/recolección del lote ${loteActual.lote}?\n\n` +
        "Esta acción cambiará el lote a ENVIADO y solo los pedidos TERMINADO pasarán a ENVIADO.",
      tone: "confirm",
      confirmLabel: "Dar salida",
    });

    if (!confirmar) return;

    const fechaSalida = fechaActualMX();
    const horaSalida = horaActualMX();
    const usuarioSalida = loteActual.responsable || loteActual.responsableLote || "";

    setPedidos((prev) => {
      const pedidosActualizados = prev.map((pedido) => {
        if (pedido.lote !== loteActual.lote) return pedido;

        if (pedido.estatus !== ESTATUS_PEDIDO_ECOM.TERMINADO) {
          return pedido;
        }

        return enriquecerPedidoConReglasEcommerce(pedido, {
          estatus: ESTATUS_PEDIDO_ECOM.ENVIADO,
          fechaSalida,
          horaSalida,
          usuarioSalida,
          fechaCambioEstatus: fechaSalida,
          horaCambioEstatus: horaSalida,
        });
      });

      return pedidosActualizados;
    });

    setLotes((prev) =>
      prev.map((lote) =>
        lote.lote === loteActual.lote
          ? {
              ...lote,
              estatus: ESTATUS_LOTE_ECOM.ENVIADO,
              fechaSalida,
              horaSalida,
              usuarioSalida,
              fechaActualizacion: new Date().toISOString(),
            }
          : lote
      )
    );

    setLoteSeleccionado((prev) =>
      prev && prev.lote === loteActual.lote
        ? {
            ...prev,
            estatus: ESTATUS_LOTE_ECOM.ENVIADO,
            fechaSalida,
            horaSalida,
            usuarioSalida,
            fechaActualizacion: new Date().toISOString(),
          }
        : prev
    );
  };

  const cambiarEstatusLote = async (loteActual, nuevoEstatus) => {
    const pedidosDelLote = pedidos.filter((pedido) => pedido.lote === loteActual.lote);

    if (nuevoEstatus === ESTATUS_LOTE_ECOM.ENVIADO) {
      await darSalidaLote(loteActual);
      return;
    }

    if (nuevoEstatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO) {
      const faltantes = pedidosDelLote.filter(
        (pedido) =>
          ![
            ESTATUS_PEDIDO_ECOM.TERMINADO,
            ESTATUS_PEDIDO_ECOM.CANCELADO,
            ESTATUS_PEDIDO_ECOM.RETORNO,
            ESTATUS_PEDIDO_ECOM.REENVIO,
          ].includes(pedido.estatus)
      );

      if (faltantes.length > 0) {
        notify({
          title: "Cierre bloqueado",
          message:
            `No puedes cerrar el lote ${loteActual.lote}.\n\n` +
            `Hay ${faltantes.length} pedido(s) activos o pendientes.`,
          tone: "warning",
        });
        return;
      }
    }

    const confirmar = await requestConfirm({
      title: "Cambiar estatus de lote",
      message: `¿Confirmas cambiar el lote ${loteActual.lote} a ${nuevoEstatus}?`,
      tone: "confirm",
      confirmLabel: "Cambiar estatus",
    });
    if (!confirmar) return;

    setLotes((prev) =>
      prev.map((lote) =>
        lote.id === loteActual.id
          ? {
              ...lote,
              estatus: nuevoEstatus,
              fechaCierreLote:
                nuevoEstatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO
                  ? fechaActualMX()
                  : lote.fechaCierreLote || "",
              horaCierreLote:
                nuevoEstatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO
                  ? horaActualMX()
                  : lote.horaCierreLote || "",
              usuarioCierreLote:
                nuevoEstatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO
                  ? lote.responsable || lote.responsableLote || ""
                  : lote.usuarioCierreLote || "",
              fechaActualizacion: new Date().toISOString(),
            }
          : lote
      )
    );
  };

  const duplicarPedido = (pedido) => {
    const base = `${pedido.pedido}-COPIA`;
    let nuevoNumero = base;
    let contador = 1;

    while (pedidos.some((item) => normalizarTextoPedido(item.pedido) === normalizarTextoPedido(nuevoNumero))) {
      contador += 1;
      nuevoNumero = `${base}-${contador}`;
    }

    const copia = enriquecerPedidoConReglasEcommerce({
      ...pedido,
      id: crearId(),
      pedido: normalizarTextoPedido(nuevoNumero),
      estatus: ESTATUS_PEDIDO_ECOM.RECIBIDO,
      fechaRegistro: new Date().toISOString(),
      fechaIngreso: fechaActualMX(),
      horaIngreso: horaActualMX(),
      fechaActualizacion: new Date().toISOString(),
    });

    setPedidos((prev) => [copia, ...prev]);
  };

  const eliminarPedidoTemporal = async (pedido) => {
    const confirmar = await requestConfirm({
      title: "Eliminar pedido temporal",
      message: `¿Deseas eliminar temporalmente el pedido ${pedido.pedido}?`,
      tone: "warning",
      confirmLabel: "Eliminar",
    });
    if (!confirmar) return;

    setPedidos((prev) => {
      const pedidosActualizados = prev.filter((item) => item.id !== pedido.id);
      if (pedido.lote && pedido.lote !== "SIN LOTE") {
        actualizarEstatusLotePorPedidos(pedido.lote, pedidosActualizados);
      }
      return pedidosActualizados;
    });

    if (pedido.lote && pedido.lote !== "SIN LOTE") descontarPiezaEscaneada(pedido.lote);
  };

  const verDetallePedido = (pedido) => {
    notify({
      title: "Detalle del pedido",
      message: "Información operativa registrada para el pedido seleccionado.",
      tone: "info",
      details: [
        { label: "Pedido", value: pedido.pedido },
        { label: "Lote", value: pedido.lote || "SIN LOTE" },
        { label: "Plataforma", value: pedido.plataforma },
        { label: "Tipo envío", value: pedido.tipoEnvio || "SIN CLASIFICAR" },
        { label: "Canal entrega", value: pedido.canalEntrega || "SIN CANAL" },
        {
          label: "Condición ingreso",
          value: pedido.condicionIngreso || "SIN CONDICIÓN",
        },
        {
          label: "No procesado",
          value: pedido.noProcesadoMismoDia ? "Sí" : "No",
        },
        { label: "Motivo", value: pedido.motivoNoProcesadoMismoDia || "SIN MOTIVO" },
        { label: "Guía", value: pedido.guia },
        { label: "Paquetería", value: pedido.paqueteria },
        { label: "Responsable", value: pedido.responsable },
        { label: "Estatus", value: pedido.estatus },
        { label: "Fecha ingreso", value: pedido.fechaIngreso },
        { label: "Hora ingreso", value: pedido.horaIngreso },
      ],
    });
  };

  const limpiarTemporal = async () => {
    const confirmar = await requestConfirm({
      title: "Limpiar datos temporales",
      message:
        "¿Deseas limpiar los lotes y pedidos temporales capturados en este navegador?",
      tone: "warning",
      confirmLabel: "Limpiar datos",
    });
    if (!confirmar) return;

    localStorage.removeItem(STORAGE_PEDIDOS_KEY);
    localStorage.removeItem(STORAGE_LOTES_KEY);
    localStorage.removeItem(STORAGE_LOTE_COUNTER_KEY);
    setPedidos(normalizarPedidos(ecommercePedidos).map((pedido) =>
      enriquecerPedidoConReglasEcommerceBase(pedido)
    ));
    setLotes([]);
    setLoteSeleccionado(null);
  };

  function descontarPiezaEscaneada(loteId) {
    setLotes((prev) =>
      prev.map((lote) =>
        lote.lote === loteId
          ? {
              ...lote,
              piezasEscaneadas: Math.max(0, (lote.piezasEscaneadas || 0) - 1),
              fechaActualizacion: new Date().toISOString(),
            }
          : lote
      )
    );

    setLoteSeleccionado((prev) =>
      prev && prev.lote === loteId
        ? {
            ...prev,
            piezasEscaneadas: Math.max(0, (prev.piezasEscaneadas || 0) - 1),
            fechaActualizacion: new Date().toISOString(),
          }
        : prev
    );
  }

  return {
    vistaActiva,
    setVistaActiva,

    pedidos,
    lotes,
    indicadores,

    modalPedidoAbierto,
    modalLoteAbierto,
    modalEscaneoAbierto,
    pedidoEditando,
    loteSeleccionado,
    pedidosDelLoteSeleccionado,

    menuAbiertoId,
    setMenuAbiertoId,

    abrirNuevoPedido,
    abrirEditarPedido,
    cerrarModalPedido,

    setModalLoteAbierto,

    abrirEscaneoLote,
    cerrarEscaneoLote,

    guardarPedido,
    guardarLote,
    agregarPedidoAlLote,
    eliminarPedidoDelLote,

    actualizarGuiaPedido,
    asignarGuiaPaqueteriaLote,

    cambiarEstatusPedido,
    cambiarEstatusLote,
    darSalidaLote,

    duplicarPedido,
    eliminarPedidoTemporal,
    verDetallePedido,
    limpiarTemporal,
  };
}
