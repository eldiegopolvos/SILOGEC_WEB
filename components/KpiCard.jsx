function KpiCard({ title, value, subtitle, icon: Icon }) {
  return (
    <article className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-slate-500">
            {title}
          </p>

          <h3 className="mt-4 text-3xl font-bold tracking-wide text-[#061a2f]">
            {value}
          </h3>

          <p className="mt-2 text-xs text-slate-500">
            {subtitle}
          </p>
        </div>

        {Icon && (
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-[#061a2f]">
            <Icon size={23} strokeWidth={1.8} />
          </div>
        )}
      </div>
    </article>
  );
}

export default KpiCard;