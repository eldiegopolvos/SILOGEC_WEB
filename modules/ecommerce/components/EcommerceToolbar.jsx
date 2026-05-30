import { Download, PackagePlus, Trash2, UploadCloud } from "lucide-react";

export default function EcommerceToolbar({
  vistaActiva,
  setVistaActiva,
  pedidosCount = 0,
  pedidosSinLote = 0,
  filtroPedidos = "todos",
  setFiltroPedidos = () => {},
  conteoFiltrosPedidos = {
    todos: 0,
    sinLote: 0,
    conLote: 0,
  },
  lotesCount = 0,
  onLimpiarTemporal,
  onNuevoLote,
  onNuevoPedido,
  onExportar,
}) {
  const descripcion =
    vistaActiva === "lotes"
      ? "Recepción por lote, pedidos vinculados, estatus automático y salida por recolección."
      : "Vista global de pedidos capturados, con o sin lote, lista para consulta y descarga.";

  const filtrosPedidos = [
    { id: "todos", label: "Todos", count: conteoFiltrosPedidos.todos },
    { id: "sin-lote", label: "Sin lote", count: conteoFiltrosPedidos.sinLote },
    { id: "con-lote", label: "Con lote", count: conteoFiltrosPedidos.conLote },
  ];

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
              Pedidos
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-xs">
                {pedidosCount || pedidosSinLote}
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
        <div className="flex flex-wrap items-center justify-end gap-2">
          {vistaActiva === "pedidos" && (
            <div className="mr-1 inline-flex rounded-xl border border-slate-200 bg-white p-1">
              {filtrosPedidos.map((filtro) => (
                <button
                  key={filtro.id}
                  type="button"
                  onClick={() => setFiltroPedidos(filtro.id)}
                  className={`rounded-lg px-3 py-2 text-xs font-bold transition ${
                    filtroPedidos === filtro.id
                      ? "bg-[#071f3a] text-white"
                      : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {filtro.label}
                  <span className="ml-1 opacity-70">{filtro.count}</span>
                </button>
              ))}
            </div>
          )}

          <button
            type="button"
            onClick={onExportar}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exportar CSV
          </button>

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
    </div>
  );
}
