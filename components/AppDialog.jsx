import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  Info,
  X,
  XCircle,
} from "lucide-react";

const toneConfig = {
  success: {
    icon: CheckCircle2,
    iconWrap: "bg-emerald-50 text-emerald-600 border-emerald-200",
    button: "bg-emerald-700 text-white hover:bg-emerald-800",
  },
  error: {
    icon: XCircle,
    iconWrap: "bg-rose-50 text-rose-600 border-rose-200",
    button: "bg-rose-700 text-white hover:bg-rose-800",
  },
  warning: {
    icon: AlertTriangle,
    iconWrap: "bg-amber-50 text-amber-600 border-amber-200",
    button: "bg-[#071f3a] text-white hover:bg-[#0a2a4d]",
  },
  confirm: {
    icon: HelpCircle,
    iconWrap: "bg-[#071f3a] text-[#d5b15f] border-[#071f3a]/10",
    button: "bg-[#071f3a] text-white hover:bg-[#0a2a4d]",
  },
  info: {
    icon: Info,
    iconWrap: "bg-sky-50 text-sky-600 border-sky-200",
    button: "bg-[#071f3a] text-white hover:bg-[#0a2a4d]",
  },
};

function splitMessage(message = "") {
  return String(message)
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

export default function AppDialog({ dialog, onCancel, onConfirm }) {
  if (!dialog) return null;

  const tone = dialog.tone || (dialog.kind === "confirm" ? "confirm" : "info");
  const config = toneConfig[tone] || toneConfig.info;
  const Icon = config.icon;
  const lines = splitMessage(dialog.message);
  const details = dialog.details || [];
  const isConfirm = dialog.kind === "confirm";

  return (
    <div className="fixed inset-0 z-[70] overflow-y-auto bg-[#071f3a]/75 px-4 py-6 backdrop-blur-sm">
      <div
        className="mx-auto flex max-h-[calc(100vh-3rem)] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-white/70 bg-white shadow-2xl shadow-slate-950/30"
        role="dialog"
        aria-modal="true"
      >
        <div className="shrink-0 flex items-start justify-between gap-4 border-b border-slate-200 bg-slate-50/90 px-6 py-5">
          <div className="flex min-w-0 items-start gap-4">
            <div
              className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border ${config.iconWrap}`}
            >
              <Icon className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b08a2b]">
                SILOGEC
              </div>
              <h2 className="mt-1 text-xl font-bold text-[#071f3a]">
                {dialog.title || (isConfirm ? "Confirmar acción" : "Aviso")}
              </h2>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 transition hover:bg-slate-100 hover:text-[#071f3a]"
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
          {lines.length > 0 && (
            <div className="space-y-2 text-sm leading-6 text-slate-600">
              {lines.map((line) => (
                <p key={line}>{line}</p>
              ))}
            </div>
          )}

          {details.length > 0 && (
            <dl className="divide-y divide-slate-100 rounded-2xl border border-slate-200 bg-slate-50">
              {details.map((item) => (
                <div
                  key={`${item.label}-${item.value}`}
                  className="grid gap-1 px-4 py-3 text-sm sm:grid-cols-[160px_minmax(0,1fr)] sm:gap-3"
                >
                  <dt className="font-semibold text-slate-500">{item.label}</dt>
                  <dd className="min-w-0 break-words font-semibold text-[#071f3a]">
                    {item.value || "-"}
                  </dd>
                </div>
              ))}
            </dl>
          )}
        </div>

        <div className="shrink-0 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-6 py-4 sm:flex-row sm:justify-end">
          {isConfirm && (
            <button
              type="button"
              onClick={onCancel}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {dialog.cancelLabel || "Cancelar"}
            </button>
          )}

          <button
            type="button"
            onClick={onConfirm}
            className={`rounded-xl px-4 py-2.5 text-sm font-bold transition ${config.button}`}
          >
            {dialog.confirmLabel || (isConfirm ? "Confirmar" : "Entendido")}
          </button>
        </div>
      </div>
    </div>
  );
}
