import SimpleTable from "../../../components/SimpleTable";
import { ESTATUS_LOTE } from "../constants";

const claseEstatusFallback = (estatus = "") => {
  const estatusNormalizado = String(estatus || "").trim().toUpperCase();

  const clases = {
    CREADO: "rounded-xl border border-slate-200 bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700",
    "LOTE CERRADO":
      "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
    ENVIADO:
      "rounded-xl border border-indigo-200 bg-indigo-50 px-3 py-2 text-xs font-semibold text-indigo-700",
    CANCELADO:
      "rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-xs font-semibold text-rose-700",

    RECIBIDO:
      "rounded-xl border border-sky-200 bg-sky-50 px-3 py-2 text-xs font-semibold text-sky-700",
    "EN PROCESO":
      "rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700",
    TERMINADO:
      "rounded-xl border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-700",
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
  const listaEstatusLote =
    Array.isArray(estatusLote) && estatusLote.length > 0
      ? estatusLote
      : ESTATUS_LOTE;

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
            Creado {row.fechaCreacionLote || row.fechaIngreso || "-"} ·{" "}
            {row.horaCreacionLote || row.horaIngreso || "-"}
          </div>
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
      render: (row) => row.responsable || row.responsableLote || "-",
    },
    {
      key: "estatus",
      label: "Estatus",
      render: (row) => {
        const estatusActual = row.estatus || "CREADO";

        return (
          <select
            value={estatusActual}
            onChange={(e) => onCambiarEstatus(row, e.target.value)}
            className={resolverClaseEstatus(estatusActual)}
          >
            {listaEstatusLote.map((estatus) => (
              <option key={estatus} value={estatus}>
                {estatus}
              </option>
            ))}
          </select>
        );
      },
    },
    {
      key: "fechaIngreso",
      label: "Fecha ingreso",
      render: (row) => row.fechaCreacionLote || row.fechaIngreso || "-",
    },
    {
      key: "horaIngreso",
      label: "Hora ingreso",
      render: (row) => row.horaCreacionLote || row.horaIngreso || "-",
    },
    {
      key: "acciones",
      label: "Acciones",
      width: "230px",
      render: (row) => (
        <div className="flex min-w-[210px] flex-wrap justify-end gap-2">
          <button
            type="button"
            onClick={() => onAbrirLote(row)}
            className="rounded-xl bg-[#071f3a] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#0a2a4d]"
          >
            Abrir lote
          </button>

          <button
            type="button"
            onClick={() => onDarSalida(row)}
            className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Dar salida
          </button>
        </div>
      ),
    },
  ];

  return (
    <SimpleTable
      columns={columnas}
      rows={lotes}
      minWidth="1120px"
      emptyMessage="Aún no hay lotes creados. Crea un lote para iniciar la recepción."
    />
  );
}

export default EcommerceLotesTable;
