import SimpleTable from "../../../components/SimpleTable";
import { ESTATUS_ECOM } from "../constants";
import MenuAccionesPedido from "./MenuAccionesPedido";

const claseEstatusFallback = (estatus = "") => {
  const estatusNormalizado = String(estatus || "").trim().toUpperCase();

  const clases = {
    RECIBIDO:
      "rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700",
    CREADO:
      "rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700",
    "EN PROCESO":
      "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700",
    TERMINADO:
      "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
    ENVIADO:
      "rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700",
    "FUERA DE VENTANA":
      "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700",
    "FUERA DE VENTANA OPERATIVA":
      "rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700",
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
  estatusEcom = ESTATUS_ECOM,
  obtenerClaseEstatus,
  onCambiarEstatus = () => {},
  onEditarPedido = () => {},
  onDuplicarPedido = () => {},
  onEliminarPedidoTemporal = () => {},
  onVerDetalle = () => {},
  menuAbiertoId = null,
  setMenuAbiertoId = () => {},
}) {
  const listaEstatus =
    Array.isArray(estatusEcom) && estatusEcom.length > 0
      ? estatusEcom
      : ESTATUS_ECOM;

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
      render: (row) => (
        <div className="min-w-[250px]">
          <div className="break-words text-base font-bold text-[#071f3a]">
            {row.pedido || "-"}
          </div>

          <div className="mt-1 inline-flex rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
            {row.lote || "SIN LOTE"}
          </div>
        </div>
      ),
    },
    {
      key: "plataforma",
      label: "Plataforma",
      width: "140px",
      render: (row) => row.plataforma || "-",
    },
    {
      key: "guia",
      label: "Guía",
      width: "190px",
      render: (row) => (
        <span className="block min-w-[160px] break-words font-semibold text-slate-700">
          {row.guia || "SIN GUÍA"}
        </span>
      ),
    },
    {
      key: "paqueteria",
      label: "Paquetería / canal",
      width: "170px",
      render: (row) => row.paqueteria || "Pendiente",
    },
    {
      key: "tipoEnvio",
      label: "Tipo envío",
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
        const estatusActual = row.estatus || "RECIBIDO";

        return (
          <select
            value={estatusActual}
            onChange={(e) => onCambiarEstatus(row, e.target.value)}
            className={resolverClaseEstatus(estatusActual)}
          >
            {listaEstatus.map((estatus) => (
              <option key={estatus} value={estatus}>
                {estatus}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "condicionIngreso",
      label: "Condición",
      width: "190px",
      render: (row) => (
        <span className="text-xs font-semibold text-slate-600">
          {row.condicionIngreso || "SIN CONDICIÓN"}
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
          {row.noProcesadoMismoDia ? "SÍ" : "NO"}
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
        />
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columnas}
      rows={pedidos}
      minWidth="1380px"
      emptyMessage="No hay pedidos sin lote. La operación principal se controla desde Lotes."
    />
  );
}

export default EcommercePedidosTable;
