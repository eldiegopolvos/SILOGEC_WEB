import StatusBadge from "./StatusBadge";

export default function SimpleTable({
  columns,
  rows,
  emptyMessage = "No hay registros para mostrar.",
  minWidth = "760px",
}) {
  return (
    <div className="overflow-visible rounded-2xl border border-slate-200 bg-white">
      <div className="overflow-x-auto overflow-y-visible rounded-2xl">
        <table className="w-full text-left text-sm" style={{ minWidth }}>
          <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              {columns.map((column) => (
                <th
                  key={column.key}
                  className={`px-4 py-3 ${column.headerClassName || ""}`}
                  style={column.width ? { width: column.width } : undefined}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  className="px-4 py-10 text-center text-sm font-medium text-slate-500"
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : rows.map((row, index) => (
              <tr
                key={row.id || row.pedido || index}
                className="relative transition hover:bg-slate-50"
              >
                {columns.map((column) => (
                  <td
                    key={column.key}
                    className={`relative overflow-visible px-4 py-4 text-slate-700 ${
                      column.cellClassName || ""
                    }`}
                  >
                    {column.render ? (
                      column.render(row)
                    ) : column.type === "status" ? (
                      <StatusBadge value={row[column.key]} />
                    ) : (
                      row[column.key]
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
