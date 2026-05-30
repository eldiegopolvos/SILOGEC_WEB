import StatusBadge from "./StatusBadge";

function OperationsTable({
  rows = [],
  emptyMessage = "No hay registros para mostrar.",
  onFilter,
  onCapture,
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="text-xl font-bold text-[#061a2f]">
            Operación en curso
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Vista preliminar para controlar pedidos, guías, incidencias y cierres.
          </p>
        </div>

        {(onFilter || onCapture) && (
          <div className="flex gap-3">
            {onFilter && (
              <button
                type="button"
                onClick={onFilter}
                className="rounded-2xl border border-slate-200 bg-white px-5 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Filtros
              </button>
            )}

            {onCapture && (
              <button
                type="button"
                onClick={onCapture}
                className="rounded-2xl bg-[#d4af37] px-5 py-3 text-sm font-bold text-[#061a2f] hover:bg-[#caa332]"
              >
                Capturar
              </button>
            )}
          </div>
        )}
      </div>

      <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
        <table className="w-full border-collapse text-left text-sm">
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-4 py-4">Folio</th>
              <th className="px-4 py-4">Módulo</th>
              <th className="px-4 py-4">Responsable</th>
              <th className="px-4 py-4">Estatus</th>
              <th className="px-4 py-4">Ventana</th>
              <th className="px-4 py-4">Prioridad</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan="6"
                  className="px-4 py-10 text-center text-sm font-medium text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : rows.map((row) => (
              <tr key={row.folio} className="bg-white hover:bg-slate-50">
                <td className="px-4 py-4 font-bold text-[#061a2f]">
                  {row.folio}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {row.modulo}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {row.responsable}
                </td>
                <td className="px-4 py-4">
                  <StatusBadge status={row.estatus} />
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {row.ventana}
                </td>
                <td className="px-4 py-4 text-slate-600">
                  {row.prioridad}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default OperationsTable;
