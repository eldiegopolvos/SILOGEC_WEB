const statusStyles = {
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

export default function StatusBadge({ status, estatus, children }) {
  const valor = String(status || estatus || children || "SIN ESTATUS")
    .trim()
    .toUpperCase();

  const clase =
    statusStyles[valor] ||
    "bg-slate-50 text-slate-600 border border-slate-200";

  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-bold uppercase ${clase}`}
    >
      {children || status || estatus || "SIN ESTATUS"}
    </span>
  );
}