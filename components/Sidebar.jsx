import { NavLink } from "react-router-dom";
import { modules } from "../config/modules";

function Sidebar() {
  return (
    <aside className="group fixed inset-y-0 left-0 z-40 flex w-20 flex-col overflow-hidden bg-[#061a2f] text-white shadow-xl shadow-slate-950/20 transition-all duration-300 ease-out hover:w-72 focus-within:w-72">
      <div className="border-b border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#d4af37] text-lg font-black text-[#061a2f]">
            S
          </div>

          <div className="min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-56 group-hover:opacity-100 group-focus-within:max-w-56 group-focus-within:opacity-100">
            <p className="whitespace-nowrap text-[11px] font-semibold tracking-[0.28em] text-[#d4af37]">
              PROYECTO SILOGEC
            </p>

            <h1 className="mt-1 whitespace-nowrap text-xl font-bold tracking-wide">
              SILOGEC Web
            </h1>
          </div>
        </div>

        <p className="mt-3 max-w-0 overflow-hidden whitespace-nowrap pl-14 text-sm text-slate-300 opacity-0 transition-all duration-200 group-hover:max-w-56 group-hover:opacity-100 group-focus-within:max-w-56 group-focus-within:opacity-100">
          Recepción · Embarques · E-COM
        </p>
      </div>

      <nav className="flex-1 space-y-2 px-3 py-6">
        {modules.map((item) => {
          const Icon = item.icon;

          return (
            <NavLink
              key={item.path}
              to={item.path}
              title={item.label}
              className={({ isActive }) =>
                [
                  "flex h-12 items-center gap-3 rounded-2xl px-3 text-sm font-semibold transition-all duration-200",
                  isActive
                    ? "bg-white text-[#061a2f] shadow-sm"
                    : "text-slate-200 hover:bg-white/10 hover:text-white",
                ].join(" ")
              }
            >
              <Icon className="h-5 w-5 shrink-0" strokeWidth={1.8} />
              <span className="min-w-0 max-w-0 overflow-hidden whitespace-nowrap opacity-0 transition-all duration-200 group-hover:max-w-48 group-hover:opacity-100 group-focus-within:max-w-48 group-focus-within:opacity-100">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </nav>

      <div className="border-t border-white/10 px-4 py-5">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 shrink-0 rounded-full bg-emerald-400 shadow-[0_0_0_4px_rgba(52,211,153,0.14)]" />

          <div className="min-w-0 max-w-0 overflow-hidden opacity-0 transition-all duration-200 group-hover:max-w-48 group-hover:opacity-100 group-focus-within:max-w-48 group-focus-within:opacity-100">
            <p className="whitespace-nowrap text-[11px] uppercase tracking-[0.25em] text-[#d4af37]">
              Estado
            </p>
            <p className="mt-1 whitespace-nowrap text-sm text-slate-300">
              Esqueleto v1.0
            </p>
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
