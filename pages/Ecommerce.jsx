import EcommerceKpis from "../modules/ecommerce/components/EcommerceKpis";
import EcommerceToolbar from "../modules/ecommerce/components/EcommerceToolbar";
import EcommerceLotesTable from "../modules/ecommerce/components/EcommerceLotesTable";
import EcommercePedidosTable from "../modules/ecommerce/components/EcommercePedidosTable";
import ModalEscaneoLote from "../modules/ecommerce/components/ModalEscaneoLote";
import ModalNuevoLote from "../modules/ecommerce/components/ModalNuevoLote";
import ModalNuevoPedido from "../modules/ecommerce/components/ModalNuevoPedido";
import { useMemo, useState } from "react";

import { ESTATUS_ECOM, ESTATUS_LOTE } from "../modules/ecommerce/constants";
import { useEcommerceController } from "../modules/ecommerce/hooks/useEcommerceController";
import { useAppDialog } from "../hooks/useAppDialog.jsx";

export default function Ecommerce() {
  const { Dialog, confirm, notify } = useAppDialog();
  const [filtroPedidos, setFiltroPedidos] = useState("todos");
  const {
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
    historialLoteSeleccionado,
    menuAbiertoId,
    setMenuAbiertoId,
    setModalLoteAbierto,
    abrirNuevoPedido,
    abrirEditarPedido,
    cerrarModalPedido,
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
    obtenerClaseEstatus,
    pedidosDelLoteSeleccionado,
  } = useEcommerceController({ confirm, notify });

  const pedidosSinLote = useMemo(
    () => pedidos.filter((pedido) => !pedido.lote || pedido.lote === "SIN LOTE"),
    [pedidos]
  );

  const pedidosConLote = useMemo(
    () => pedidos.filter((pedido) => pedido.lote && pedido.lote !== "SIN LOTE"),
    [pedidos]
  );

  const pedidosFiltrados = useMemo(() => {
    if (filtroPedidos === "sin-lote") return pedidosSinLote;
    if (filtroPedidos === "con-lote") return pedidosConLote;
    return pedidos;
  }, [filtroPedidos, pedidos, pedidosConLote, pedidosSinLote]);

  const conteoFiltrosPedidos = useMemo(
    () => ({
      todos: pedidos.length,
      sinLote: pedidosSinLote.length,
      conLote: pedidosConLote.length,
    }),
    [pedidos.length, pedidosConLote.length, pedidosSinLote.length]
  );

  const exportarVistaActual = () => {
    const rows = vistaActiva === "lotes" ? lotes : pedidosFiltrados;

    if (rows.length === 0) {
      notify({
        title: "Sin datos para exportar",
        message: "La vista actual no tiene registros.",
        tone: "info",
      });
      return;
    }

    const columnas =
      vistaActiva === "lotes"
        ? [
            "lote",
            "plataforma",
            "estatus",
            "piezasEsperadas",
            "piezasEscaneadas",
            "responsableLote",
            "fechaCreacionLote",
            "horaCreacionLote",
            "fechaCierreLote",
            "horaCierreLote",
            "fechaEnvioLote",
            "horaEnvioLote",
          ]
        : [
            "pedido",
            "plataforma",
            "guia",
            "paqueteria",
            "estatus",
            "lote",
            "responsable",
            "fechaIngreso",
            "horaIngreso",
          ];

    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      columnas.join(","),
      ...rows.map((row) => columnas.map((columna) => escapeCsv(row[columna])).join(",")),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const vistaArchivo =
      vistaActiva === "pedidos" ? `pedidos-${filtroPedidos}` : vistaActiva;
    link.download = `silogec-${vistaArchivo}-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <EcommerceKpis indicadores={indicadores} />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <EcommerceToolbar
          vistaActiva={vistaActiva}
          setVistaActiva={setVistaActiva}
          pedidosCount={pedidos.length}
          pedidosSinLote={pedidosSinLote.length}
          filtroPedidos={filtroPedidos}
          setFiltroPedidos={setFiltroPedidos}
          conteoFiltrosPedidos={conteoFiltrosPedidos}
          lotesCount={lotes.length}
          onLimpiarTemporal={limpiarTemporal}
          onNuevoLote={() => setModalLoteAbierto(true)}
          onNuevoPedido={abrirNuevoPedido}
          onExportar={exportarVistaActual}
        />

        {vistaActiva === "lotes" ? (
          <EcommerceLotesTable
            lotes={lotes}
            estatusLote={ESTATUS_LOTE}
            obtenerClaseEstatus={obtenerClaseEstatus}
            onCambiarEstatus={cambiarEstatusLote}
            onAbrirLote={abrirEscaneoLote}
            onDarSalida={darSalidaLote}
          />
        ) : (
          <EcommercePedidosTable
            pedidos={pedidosFiltrados}
            estatusEcom={ESTATUS_ECOM}
            obtenerClaseEstatus={obtenerClaseEstatus}
            onCambiarEstatus={cambiarEstatusPedido}
            onEditarPedido={abrirEditarPedido}
            onDuplicarPedido={duplicarPedido}
            onEliminarPedidoTemporal={eliminarPedidoTemporal}
            onVerDetalle={verDetallePedido}
            menuAbiertoId={menuAbiertoId}
            setMenuAbiertoId={setMenuAbiertoId}
            emptyMessage="No hay pedidos para el filtro seleccionado."
          />
        )}
      </div>

      <ModalNuevoLote
        abierto={modalLoteAbierto}
        onCerrar={() => setModalLoteAbierto(false)}
        onGuardar={guardarLote}
      />

      <ModalNuevoPedido
        abierto={modalPedidoAbierto}
        onCerrar={cerrarModalPedido}
        onGuardar={guardarPedido}
        pedidoEditar={pedidoEditando}
      />

      <ModalEscaneoLote
        abierto={modalEscaneoAbierto}
        lote={loteSeleccionado}
        pedidosDelLote={pedidosDelLoteSeleccionado}
        historialLote={historialLoteSeleccionado}
        onCerrar={cerrarEscaneoLote}
        onAgregarPedido={agregarPedidoAlLote}
        onEliminarPedido={eliminarPedidoDelLote}
        onAsignarGuiaLote={asignarGuiaPaqueteriaLote}
        onActualizarGuiaPedido={actualizarGuiaPedido}
        onConfirmar={confirm}
      />

      {Dialog}
    </section>
  );
}
