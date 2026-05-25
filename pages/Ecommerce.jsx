import EcommerceKpis from "../modules/ecommerce/components/EcommerceKpis";
import EcommerceToolbar from "../modules/ecommerce/components/EcommerceToolbar";
import EcommerceLotesTable from "../modules/ecommerce/components/EcommerceLotesTable";
import EcommercePedidosTable from "../modules/ecommerce/components/EcommercePedidosTable";
import ModalEscaneoLote from "../modules/ecommerce/components/ModalEscaneoLote";
import ModalNuevoLote from "../modules/ecommerce/components/ModalNuevoLote";
import ModalNuevoPedido from "../modules/ecommerce/components/ModalNuevoPedido";

import { ESTATUS_ECOM, ESTATUS_LOTE } from "../modules/ecommerce/constants";
import { useEcommerceController } from "../modules/ecommerce/hooks/useEcommerceController";
import { useAppDialog } from "../hooks/useAppDialog.jsx";

export default function Ecommerce() {
  const { Dialog, confirm, notify } = useAppDialog();
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

  const pedidosSinLote = pedidos.filter(
    (pedido) => !pedido.lote || pedido.lote === "SIN LOTE"
  );

  return (
    <section className="space-y-6 px-5 py-6 lg:px-8">
      <EcommerceKpis indicadores={indicadores} />

      <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
        <EcommerceToolbar
          vistaActiva={vistaActiva}
          setVistaActiva={setVistaActiva}
          pedidosSinLote={pedidosSinLote.length}
          lotesCount={lotes.length}
          onLimpiarTemporal={limpiarTemporal}
          onNuevoLote={() => setModalLoteAbierto(true)}
          onNuevoPedido={abrirNuevoPedido}
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
            pedidos={pedidosSinLote}
            estatusEcom={ESTATUS_ECOM}
            obtenerClaseEstatus={obtenerClaseEstatus}
            onCambiarEstatus={cambiarEstatusPedido}
            onEditarPedido={abrirEditarPedido}
            onDuplicarPedido={duplicarPedido}
            onEliminarPedidoTemporal={eliminarPedidoTemporal}
            onVerDetalle={verDetallePedido}
            menuAbiertoId={menuAbiertoId}
            setMenuAbiertoId={setMenuAbiertoId}
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
