import { AlertTriangle, CheckCircle2, Info, XCircle } from "lucide-react";

const config = {
  success: {
    icon: CheckCircle2,
    className: "border-emerald-200 bg-emerald-50 text-emerald-900",
    iconClassName: "text-emerald-600",
  },
  error: {
    icon: XCircle,
    className: "border-rose-200 bg-rose-50 text-rose-900",
    iconClassName: "text-rose-600",
  },
  warning: {
    icon: AlertTriangle,
    className: "border-amber-200 bg-amber-50 text-amber-950",
    iconClassName: "text-amber-600",
  },
  info: {
    icon: Info,
    className: "border-sky-200 bg-sky-50 text-sky-950",
    iconClassName: "text-sky-600",
  },
};

export default function InlineAlert({
  tone = "info",
  title,
  message,
  children,
  className = "",
}) {
  if (!title && !message && !children) return null;

  const item = config[tone] || config.info;
  const Icon = item.icon;

  return (
    <div
      className={`flex items-start gap-3 rounded-2xl border px-4 py-3 shadow-sm ${item.className} ${className}`}
      role={tone === "error" || tone === "warning" ? "alert" : "status"}
    >
      <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${item.iconClassName}`} />

      <div className="min-w-0">
        {title && <div className="text-sm font-bold">{title}</div>}
        {message && <div className="mt-0.5 text-sm leading-5">{message}</div>}
        {children}
      </div>
    </div>
  );
}
