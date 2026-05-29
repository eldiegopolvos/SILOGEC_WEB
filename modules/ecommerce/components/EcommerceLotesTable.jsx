import SimpleTable from "../../../components/SimpleTable";
import { ESTATUS_LOTE, ESTATUS_LOTE_ECOM } from "../constants";

const claseEstatusFallback = (estatus = "") => {
  const estatusNormalizado = String(estatus || "").trim().toUpperCase();

  const clases = {
    CREADO:
      "rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700",
    "LOTE CERRADO":
      "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
    ENVIADO:
      "rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700",
    CANCELADO:
      "rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700",
  };

  return (
    clases[estatusNormalizado] ||
    "rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-600"
  );
};

function EcommerceLotesTable({
  lotes = [],
  estatusLote = ESTATUS_LOTE,
  obtenerClaseEstatus,
  onCambiarEstatus = () => {},
  onAbrirLote = () => {},
  onDarSalida = () => {},
}) {
  const resolverClaseEstatus =
    typeof obtenerClaseEstatus === "function"
      ? obtenerClaseEstatus
      : claseEstatusFallback;

  const columnas = [
    {
      key: "lote",
      label: "Lote",
      width: "270px",
      cellClassName: "align-top",
      render: (row) => (
        <div className="min-w-[240px]">
          <div className="font-bold tracking-wide text-[#071f3a]">
            {row.lote || row.folioLote || "-"}
          </div>
          <div className="mt-1 text-xs font-medium text-slate-500">
            Creado {row.fechaCreacionLote || "-"} Â·{" "}
            {row.horaCreacionLote || "-"}
          </div>
          {row.fechaCierreLote && (
            <div className="mt-1 text-xs font-medium text-emerald-700">
              Cerrado {row.fechaCierreLote} Â· {row.horaCierreLote || "-"}
            </div>
          )}
          {row.fechaEnvioLote && (
            <div className="mt-1 text-xs font-medium text-indigo-700">
              Enviado {row.fechaEnvioLote} Â· {row.horaEnvioLote || "-"}
            </div>
          )}
        </div>
      ),
    },
    {
      key: "plataforma",
      label: "Plataforma",
      width: "150px",
      render: (row) => (
        <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-700">
          {row.plataforma || "-"}
        </span>
      ),
    },
    {
      key: "piezasEsperadas",
      label: "Piezas",
      render: (row) => Number(row.piezasEsperadas || 0),
    },
    {
      key: "piezasEscaneadas",
      label: "Escaneadas",
      render: (row) => Number(row.piezasEscaneadas || 0),
    },
    {
      key: "diferencia",
      label: "Diferencia",
      render: (row) =>
        Number(row.piezasEsperadas || 0) - Number(row.piezasEscaneadas || 0),
    },
    {
      key: "responsable",
      label: "Responsable",
      render: (row) => row.responsableLote || row.responsable || "-",
    },
    {
      key: "estatus",
      label: "Estatus",
      render: (row) => {
        const estatusActual = row.estatus || ESTATUS_LOTE_ECOM.CREADO;

        return (
          <span className={`${resolverClaseEstatus(estatusActual)} inline-flex min-w-[120px] items-center justify-center`}>
            {estatusActual}
          </span>
        );
      },
    },
    {
      key: "fechaCreacionLote",
      label: "Fecha creaciÃ³n",
      render: (row) => row.fechaCreacionLote || "-",
    },
    {
      key: "horaCreacionLote",
      label: "Hora creaciÃ³n",
      render: (row) => row.horaCreacionLote || "-",
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "230px",
      render: (row) => {
        const loteEnviado = row.estatus === ESTATUS_LOTE_ECOM.ENVIADO;
        const loteCancelado = row.estatus === ESTATUS_LOTE_ECOM.CANCELADO;
        const esSoloConsulta =
          row.estatus === ESTATUS_LOTE_ECOM.LOTE_CERRADO ||
          loteEnviado ||
          loteCancelado;

        return (
          <div className="flex min-w-[210px] flex-wrap justify-end gap-2">
            <button
              type="button"
              onClick={() => onAbrirLote(row)}
              className="rounded-xl bg-[#071f3a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0a2a4d]"
            >
              {esSoloConsulta ? "Ver detalle" : "Abrir lote"}
            </button>

            <button
              type="button"
              onClick={() => onDarSalida(row)}
              disabled={loteEnviado || loteCancelado}
              className={`rounded-xl border px-3 py-2 text-xs font-semibold transition ${
                loteEnviado || loteCancelado
                  ? "cursor-not-allowed border-slate-200 bg-slate-50 text-slate-400"
                  : "border-slate-200 text-slate-700 hover:bg-slate-50"
              }`}
            >
              Dar salida
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <SimpleTable
      columns={columnas}
      rows={lotes}
      minWidth="1120px"
      emptyMessage="AÃºn no hay lotes creados. Crea un lote para iniciar la recepciÃ³n."
    />
  );
}

export default EcommerceLotesTable;
