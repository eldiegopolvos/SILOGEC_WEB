import { X } from "lucide-react";

export default function ModalShell({
  abierto,
  eyebrow,
  title,
  description,
  children,
  footer,
  onCerrar,
  size = "md",
  icon: Icon,
}) {
  if (!abierto) return null;

  const sizes = {
    sm: "max-w-xl",
    md: "max-w-3xl",
    lg: "max-w-5xl",
    xl: "max-w-7xl",
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#071f3a]/70 px-4 py-6 backdrop-blur-sm">
      <div
        className={`flex max-h-[92vh] w-full ${sizes[size] || sizes.md} flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/25`}
        role="dialog"
        aria-modal="true"
      >
        <div className="border-b border-slate-200 bg-slate-50/80 px-6 py-5">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 gap-3">
              {Icon && (
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#071f3a] text-[#d5b15f]">
                  <Icon className="h-5 w-5" />
                </div>
              )}

              <div className="min-w-0">
                {eyebrow && (
                  <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b08a2b]">
                    {eyebrow}
                  </div>
                )}

                <h2 className="mt-1 text-xl font-bold text-[#071f3a] md:text-2xl">
                  {title}
                </h2>

                {description && (
                  <p className="mt-1 max-w-3xl text-sm leading-5 text-slate-500">
                    {description}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              onClick={onCerrar}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-[#071f3a]"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="border-t border-slate-200 bg-white px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
