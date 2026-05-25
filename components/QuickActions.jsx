function QuickActions({ actions = [] }) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-xl font-bold text-[#061a2f]">
        Acciones rápidas
      </h2>

      <div className="mt-5 space-y-3">
        {actions.map((action) => {
          const Icon = action.icon;
          const EndIcon = action.endIcon;

          return (
            <button
              key={action.label}
              className="flex w-full items-center justify-between rounded-2xl border border-slate-200 bg-white px-4 py-4 text-left text-sm font-semibold text-slate-700 hover:bg-slate-50"
            >
              <span className="flex items-center gap-3">
                {Icon && <Icon size={20} className="text-[#061a2f]" />}
                {action.label}
              </span>

              {EndIcon && <EndIcon size={18} className="text-slate-400" />}
            </button>
          );
        })}
      </div>
    </section>
  );
}

export default QuickActions;