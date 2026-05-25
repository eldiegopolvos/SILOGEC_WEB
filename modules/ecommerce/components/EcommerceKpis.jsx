export default function EcommerceKpis({ indicadores }) {
  const cards = [
    { label: "Lotes E-COM", value: indicadores.lotes },
    { label: "Pedidos recibidos", value: indicadores.pedidos },
    { label: "Terminados", value: indicadores.terminados },
    { label: "Fuera de ventana", value: indicadores.fueraVentana },
  ];

  return (
    <div className="grid gap-4 md:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm"
        >
          <div className="text-sm text-slate-500">{card.label}</div>
          <div className="mt-2 text-3xl font-bold text-[#071f3a]">
            {card.value}
          </div>
        </div>
      ))}
    </div>
  );
}
