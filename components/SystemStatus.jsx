function SystemStatus({ status }) {
  return (
    <section className="rounded-3xl bg-[#061a2f] p-6 text-white shadow-sm">
      <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#d4af37]">
        Estado del sistema
      </p>

      <h2 className="mt-3 text-2xl font-bold">
        {status.title}
      </h2>

      <p className="mt-3 text-sm leading-6 text-slate-200">
        {status.description}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-slate-300">Ambiente</p>
          <p className="mt-1 font-bold">{status.environment}</p>
        </div>

        <div className="rounded-2xl bg-white/10 p-4">
          <p className="text-sm text-slate-300">Rol activo</p>
          <p className="mt-1 font-bold">{status.activeRole}</p>
        </div>
      </div>
    </section>
  );
}

export default SystemStatus;