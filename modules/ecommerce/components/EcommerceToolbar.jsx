import { PackagePlus, Trash2, UploadCloud } from "lucide-react";

export default function EcommerceToolbar({
  vistaActiva,
  setVistaActiva,
  pedidosSinLote = 0,
  lotesCount = 0,
  onLimpiarTemporal,
  onNuevoLote,
  onNuevoPedido,
}) {
  const descripcion =
    vistaActiva === "lotes"
      ? "Recepción por lote, pedidos vinculados, estatus automático y salida por recolección."
      : "Bandeja de pedidos manuales que aún no pertenecen a un lote.";

  return (
    <div className="mb-5 space-y-4">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <h2 className="text-lg font-bold text-[#071f3a]">
            Control E-COM por lote
          </h2>
          <p className="text-sm text-slate-500">{descripcion}</p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="inline-flex rounded-2xl border border-slate-200 bg-slate-50 p-1">
            <button
              type="button"
              onClick={() => setVistaActiva("lotes")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                vistaActiva === "lotes"
                  ? "bg-[#071f3a] text-white shadow-sm"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Lotes
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {lotesCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setVistaActiva("pedidos")}
              className={`rounded-xl px-4 py-2 text-sm font-semibold transition ${
                vistaActiva === "pedidos"
                  ? "bg-[#071f3a] text-white shadow-sm"
                  : "text-slate-700 hover:bg-white"
              }`}
            >
              Pedidos sin lote
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pedidosSinLote}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onLimpiarTemporal}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-rose-200 px-4 py-2.5 text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
          >
            <Trash2 className="h-4 w-4" />
            Limpiar temporal
          </button>
        </div>
      </div>

      <div className="flex justify-end">
        {vistaActiva === "lotes" ? (
          <button
            type="button"
            onClick={onNuevoLote}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d5b15f] px-4 py-2.5 text-sm font-bold text-[#071f3a] transition hover:bg-[#c7a04b]"
          >
            <PackagePlus className="h-4 w-4" />
            Nuevo lote
          </button>
        ) : (
          <button
            type="button"
            onClick={onNuevoPedido}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#d5b15f] px-4 py-2.5 text-sm font-bold text-[#071f3a] transition hover:bg-[#c7a04b]"
          >
            <UploadCloud className="h-4 w-4" />
            Pedido manual
          </button>
        )}
      </div>
    </div>
  );
}
