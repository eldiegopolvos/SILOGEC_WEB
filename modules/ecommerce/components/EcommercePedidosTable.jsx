import SimpleTable from "../../../components/SimpleTable";
import { ESTATUS_PEDIDO_ECOM } from "../constants";
import MenuAccionesPedido from "./MenuAccionesPedido";

const claseEstatusFallback = (estatus = "") => {
  const estatusNormalizado = String(estatus || "").trim().toUpperCase();

  const clases = {
    RECIBIDO:
      "rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700",
    "EN PROCESO":
      "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700",
    TERMINADO:
      "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
    ENVIADO:
      "rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700",
    CANCELADO:
      "rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700",
    RETORNO:
      "rounded-xl border border-purple-200 bg-purple-50 px-3 py-2 text-xs font-semibold text-purple-700",
    REENVIO:
      "rounded-xl border border-cyan-200 bg-cyan-50 px-3 py-2 text-xs font-semibold text-cyan-700",
  };

  return (
    clases[estatusNormalizado] ||
    "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
  );
};

function EcommercePedidosTable({
  pedidos = [],
  obtenerClaseEstatus,
  onCambiarEstatus = () => {},
  onEditarPedido = () => {},
  onDuplicarPedido = () => {},
  onEliminarPedidoTemporal = () => {},
  onVerDetalle = () => {},
  menuAbiertoId = null,
  setMenuAbiertoId = () => {},
  emptyMessage = "No hay pedidos para mostrar.",
}) {
  const resolverClaseEstatus =
    typeof obtenerClaseEstatus === "function"
      ? obtenerClaseEstatus
      : claseEstatusFallback;

  const columnas = [
    {
      key: "pedido",
      label: "Pedido",
      width: "280px",
      cellClassName: "align-top",
      render: (row) => {
        const tieneLote = row.lote && row.lote !== "SIN LOTE";

        return (
          <div className="min-w-[250px]">
            <div className="break-words text-base font-bold text-[#071f3a]">
              {row.pedido || "-"}
            </div>

            <div
              className={`mt-1 inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${
                tieneLote
                  ? "bg-sky-50 text-sky-700"
                  : "bg-amber-50 text-amber-700"
              }`}
            >
              {row.lote || "SIN LOTE"}
            </div>
          </div>
        );
      },
    },
    {
      key: "plataforma",
      label: "Plataforma",
      width: "140px",
      render: (row) => row.plataforma || "-",
    },
    {
      key: "guia",
      label: "Guia",
      width: "190px",
      render: (row) => (
        <span className="block min-w-[160px] break-words font-semibold text-slate-700">
          {row.guia || "SIN GUIA"}
        </span>
      ),
    },
    {
      key: "paqueteria",
      label: "Paqueteria / canal",
      width: "170px",
      render: (row) => row.paqueteria || "Pendiente",
    },
    {
      key: "tipoEnvio",
      label: "Tipo envio",
      width: "170px",
      render: (row) => row.tipoEnvio || "SIN CLASIFICAR",
    },
    {
      key: "canalEntrega",
      label: "Canal",
      width: "160px",
      render: (row) => row.canalEntrega || "SIN CANAL",
    },
    {
      key: "estatus",
      label: "Estatus",
      width: "170px",
      render: (row) => {
        const estatusActual = row.estatus || ESTATUS_PEDIDO_ECOM.RECIBIDO;

        return (
          <span
            className={`${resolverClaseEstatus(estatusActual)} inline-flex min-w-[120px] items-center justify-center`}
          >
            {estatusActual}
          </span>
        );
      },
    },
    {
      key: "condicionIngreso",
      label: "Condicion",
      width: "190px",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.condicionIngreso || "SIN CONDICION"}
        </span>
      ),
    },
    {
      key: "noProcesadoMismoDia",
      label: "No procesado",
      width: "130px",
      render: (row) => (
        <span
          className={`rounded-full px-3 py-1 text-xs font-bold ${
            row.noProcesadoMismoDia
              ? "bg-rose-50 text-rose-700"
              : "bg-emerald-50 text-emerald-700"
          }`}
        >
          {row.noProcesadoMismoDia ? "SI" : "NO"}
        </span>
      ),
    },
    {
      key: "fechaIngreso",
      label: "Fecha ingreso",
      width: "130px",
      render: (row) => row.fechaIngreso || "-",
    },
    {
      key: "horaIngreso",
      label: "Hora ingreso",
      width: "120px",
      render: (row) => row.horaIngreso || "-",
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "90px",
      render: (row) => (
        <MenuAccionesPedido
          pedido={row}
          menuAbiertoId={menuAbiertoId}
          setMenuAbiertoId={setMenuAbiertoId}
          onEditarPedido={onEditarPedido}
          onDuplicarPedido={onDuplicarPedido}
          onEliminarPedidoTemporal={onEliminarPedidoTemporal}
          onVerDetalle={onVerDetalle}
          onCambiarEstatus={onCambiarEstatus}
        />
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columnas}
      rows={pedidos}
      minWidth="1380px"
      emptyMessage={emptyMessage}
    />
  );
}

export default EcommercePedidosTable;
