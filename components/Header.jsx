import { Bell, Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getModuleByPath } from "../config/modules";
import {
  STORAGE_LOTES_KEY,
  STORAGE_PEDIDOS_KEY,
} from "../modules/ecommerce/constants";
import { removerPedidosDemoPredeterminados } from "../modules/ecommerce/utils/ecommerceUtils";

function normalize(value = "") {
  return String(value)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();
}

function readStoredArray(key, fallback) {
  try {
    const stored = localStorage.getItem(key);
    if (!stored) return fallback;
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
}

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const currentModule = getModuleByPath(location.pathname);
  const [query, setQuery] = useState("");

  const searchResults = useMemo(() => {
    const q = normalize(query);
    if (q.length < 2) return [];

    const pedidos = removerPedidosDemoPredeterminados(
      readStoredArray(STORAGE_PEDIDOS_KEY, [])
    );
    const lotes = readStoredArray(STORAGE_LOTES_KEY, []);
    const match = (value) => normalize(value).includes(q);

    const results = [
      ...lotes
        .filter((lote) =>
          [
            lote.lote,
            lote.folioLote,
            lote.plataforma,
            lote.estatus,
            lote.responsableLote,
            lote.responsable,
          ].some(match)
        )
        .map((lote) => ({
          type: "Lote",
          title: lote.lote || lote.folioLote,
          subtitle: `${lote.estatus || "Sin estatus"} - ${lote.plataforma || "-"}`,
          path: "/ecommerce",
        })),
      ...pedidos
        .filter((pedido) =>
          [
            pedido.pedido,
            pedido.guia,
            pedido.lote,
            pedido.plataforma,
            pedido.estatus,
            pedido.paqueteria,
          ].some(match)
        )
        .map((pedido) => ({
          type: "Pedido",
          title: pedido.pedido,
          subtitle: `${pedido.estatus || "Sin estatus"} - ${pedido.guia || "Sin guia"}`,
          path: "/ecommerce",
        })),
    ];

    return results.slice(0, 8);
  }, [query]);

  const openResult = (result) => {
    navigate(result.path);
    setQuery("");
  };

  return (
    <header className="flex h-24 items-center justify-between border-b border-slate-200 bg-white px-8">
      <div>
        <p className="text-xs font-bold uppercase tracking-[0.35em] text-[#b68a2c]">
          {currentModule.eyebrow}
        </p>

        <h2 className="mt-2 text-2xl font-bold text-[#061a2f]">
          {currentModule.title}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden w-80 items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 md:flex">
          <Search size={18} className="text-slate-400" />
          <input
            type="text"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Buscar folio, guia o pedido..."
            className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
          />

          {query && (
            <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-40 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
              {searchResults.length === 0 ? (
                <div className="px-4 py-3 text-sm font-medium text-slate-500">
                  Sin coincidencias locales
                </div>
              ) : (
                searchResults.map((result) => (
                  <button
                    key={`${result.type}-${result.title}-${result.subtitle}`}
                    type="button"
                    onClick={() => openResult(result)}
                    className="block w-full border-b border-slate-100 px-4 py-3 text-left transition last:border-b-0 hover:bg-slate-50"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-bold text-[#061a2f]">
                        {result.title}
                      </span>
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-bold uppercase text-slate-500">
                        {result.type}
                      </span>
                    </div>
                    <div className="mt-1 text-xs text-slate-500">
                      {result.subtitle}
                    </div>
                  </button>
                ))
              )}
            </div>
          )}
        </div>

        <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200 bg-white transition hover:bg-slate-50">
          <Bell size={20} className="text-[#061a2f]" />
        </button>

        <button
          type="button"
          onClick={() => navigate("/ecommerce")}
          className="h-12 rounded-2xl bg-[#061a2f] px-6 text-sm font-bold text-white transition hover:bg-[#09233e]"
        >
          Nuevo registro
        </button>
      </div>
    </header>
  );
}

export default Header;
