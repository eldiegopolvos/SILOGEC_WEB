import { Bell, Search } from "lucide-react";
import { useLocation } from "react-router-dom";
import { getModuleByPath } from "../config/modules";

function Header() {
  const location = useLocation();
  const currentModule = getModuleByPath(location.pathname);

  return (
    <header className="h-24 bg-white border-b border-slate-200 px-8 flex items-center justify-between">
      <div>
        <p className="text-xs tracking-[0.35em] text-[#b68a2c] font-bold uppercase">
          {currentModule.eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-[#061a2f]">
          {currentModule.title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-3 w-80 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            placeholder="Buscar folio, guía o pedido..."
            className="w-full bg-transparent outline-none text-sm text-slate-700 placeholder:text-slate-400"
          />
        </div>

        <button className="h-12 w-12 rounded-2xl border border-slate-200 bg-white flex items-center justify-center hover:bg-slate-50 transition">
          <Bell size={20} className="text-[#061a2f]" />
        </button>

        <button className="h-12 rounded-2xl bg-[#061a2f] px-6 text-sm font-bold text-white hover:bg-[#09233e] transition">
          Nuevo registro
        </button>
      </div>
    </header>
  );
}

export default Header;