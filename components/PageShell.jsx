function PageShell({
  eyebrow = "Módulo Operativo",
  title,
  description,
  children,
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl border border-slate-200 bg-white p-8 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#b68a2c]">
          {eyebrow}
        </p>

        <h1 className="mt-4 text-3xl font-bold text-[#061a2f]">
          {title}
        </h1>

        {description && (
          <p className="mt-3 max-w-4xl text-sm leading-6 text-slate-500">
            {description}
          </p>
        )}

        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-6">
          <h2 className="text-sm font-bold text-slate-800">
            Siguiente etapa
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            Aquí conectaremos formularios, tablas, reglas de negocio, permisos
            y reportes específicos del módulo.
          </p>
        </div>
      </section>

      {children}
    </div>
  );
}

export default PageShell;