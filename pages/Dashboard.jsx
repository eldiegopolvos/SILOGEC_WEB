import { useMemo } from "react";
import {
  ClipboardList,
  Layers,
  PackageCheck,
  ShoppingCart,
  Truck,
  Wand2,
} from "lucide-react";

import KpiCard from "../components/KpiCard";
import OperationsTable from "../components/OperationsTable";
import SystemStatus from "../components/SystemStatus";
import {
  STORAGE_HISTORIAL_KEY,
  STORAGE_LOTES_KEY,
  STORAGE_PEDIDOS_KEY,
} from "../modules/ecommerce/constants";
import { removerPedidosDemoPredeterminados } from "../modules/ecommerce/utils/ecommerceUtils";

const ESTATUS_RESUELTOS = [
  "TERMINADO",
  "ENVIADO",
  "CANCELADO",
  "RETORNO",
  "REENVIO",
];

const ESTATUS_LOTE_CERRADO = ["LOTE CERRADO", "ENVIADO"];
const ESTATUS_LOTE_FINAL = ["LOTE CERRADO", "ENVIADO", "CANCELADO"];

function readStoredArray(key) {
  try {
    if (typeof localStorage === "undefined") return [];
    const stored = localStorage.getItem(key);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function esSinLote(pedido = {}) {
  return !pedido.lote || pedido.lote === "SIN LOTE";
}

function tieneGuiaValida(pedido = {}) {
  const guia = String(pedido.guia || "").trim().toUpperCase();
  return Boolean(guia && guia !== "SIN GUIA" && guia !== "SIN GUÍA");
}

function tienePaqueteriaValida(pedido = {}) {
  return Boolean(
    pedido.paqueteria &&
      String(pedido.paqueteria).trim() !== "" &&
      pedido.paqueteria !== "Pendiente"
  );
}

function crearOperacionLote(lote = {}) {
  const folio = lote.lote || lote.folioLote || "LOTE SIN FOLIO";
  const estatus = lote.estatus || "CREADO";
  const piezas = `${lote.piezasEscaneadas || 0}/${lote.piezasEsperadas || 0}`;

  return {
    folio,
    modulo: "Comercio Electronico",
    responsable: lote.responsableLote || lote.responsable || "Sin responsable",
    estatus,
    ventana: `${piezas} piezas`,
    prioridad: ESTATUS_LOTE_FINAL.includes(estatus) ? "Baja" : "Media",
  };
}

function crearOperacionPedido(pedido = {}) {
  const estatus = pedido.estatus || "RECIBIDO";

  return {
    folio: pedido.pedido || "PEDIDO SIN FOLIO",
    modulo: "Pedido E-COM",
    responsable: pedido.responsable || pedido.usuarioIngreso || "Sin responsable",
    estatus,
    ventana: pedido.lote && pedido.lote !== "SIN LOTE" ? pedido.lote : "Sin lote",
    prioridad: ESTATUS_RESUELTOS.includes(estatus) ? "Baja" : "Alta",
  };
}

function Dashboard() {
  const panel = useMemo(() => {
    const pedidos = removerPedidosDemoPredeterminados(
      readStoredArray(STORAGE_PEDIDOS_KEY)
    );
    const lotes = readStoredArray(STORAGE_LOTES_KEY);
    const historial = readStoredArray(STORAGE_HISTORIAL_KEY);

    const pedidosSinLote = pedidos.filter(esSinLote);
    const pedidosPendientes = pedidos.filter(
      (pedido) => !ESTATUS_RESUELTOS.includes(pedido.estatus)
    );
    const lotesActivos = lotes.filter(
      (lote) => !ESTATUS_LOTE_FINAL.includes(lote.estatus)
    );
    const lotesCerrados = lotes.filter((lote) =>
      ESTATUS_LOTE_CERRADO.includes(lote.estatus)
    );
    const pedidosConGuiaDetectada = pedidos.filter(
      (pedido) => tieneGuiaValida(pedido) && tienePaqueteriaValida(pedido)
    );

    const operaciones = [
      ...lotes.map(crearOperacionLote),
      ...pedidosPendientes.map(crearOperacionPedido),
    ].slice(0, 10);

    return {
      pedidos,
      lotes,
      historial,
      kpis: [
        {
          title: "Total pedidos",
          value: pedidos.length,
          subtitle: "Capturados en E-Commerce",
          icon: ShoppingCart,
        },
        {
          title: "Pedidos sin lote",
          value: pedidosSinLote.length,
          subtitle: "Pendientes de vincular",
          icon: ClipboardList,
        },
        {
          title: "Lotes activos",
          value: lotesActivos.length,
          subtitle: "Abiertos o en proceso",
          icon: Layers,
        },
        {
          title: "Lotes cerrados/enviados",
          value: lotesCerrados.length,
          subtitle: "Listos o con salida",
          icon: Truck,
        },
        {
          title: "Pedidos pendientes",
          value: pedidosPendientes.length,
          subtitle: "No resueltos todavia",
          icon: PackageCheck,
        },
        {
          title: "Guias detectadas",
          value: pedidosConGuiaDetectada.length,
          subtitle: "Con guia y paqueteria",
          icon: Wand2,
        },
      ],
      operaciones,
    };
  }, []);

  const hayDatos = panel.pedidos.length > 0 || panel.lotes.length > 0;
  const status = {
    title: "SILOGEC WEB v1.0",
    description: hayDatos
      ? `Resumen temporal con ${panel.pedidos.length} pedido(s), ${panel.lotes.length} lote(s) y ${panel.historial.length} movimiento(s).`
      : "Resumen temporal listo. Aun no hay pedidos ni lotes capturados.",
    environment: hayDatos ? "Temporal con capturas" : "Temporal sin capturas",
    activeRole: "Coordinador",
  };

  return (
    <div className="space-y-6">
      <section className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="inline-flex rounded-2xl border border-slate-200 bg-white p-1 shadow-sm">
          <button
            type="button"
            className="rounded-xl bg-[#071f3a] px-4 py-2 text-sm font-bold text-white"
          >
            Resumen
          </button>
          <button
            type="button"
            disabled
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-400"
          >
            Seguimiento
          </button>
          <button
            type="button"
            disabled
            className="rounded-xl px-4 py-2 text-sm font-bold text-slate-400"
          >
            Alertas
          </button>
        </div>

        <div className="text-sm font-semibold text-slate-500">
          Fuente: datos temporales de esta app
        </div>
      </section>

      <section className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {panel.kpis.map((kpi) => (
          <KpiCard
            key={kpi.title}
            title={kpi.title}
            value={kpi.value}
            subtitle={kpi.subtitle}
            icon={kpi.icon}
          />
        ))}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1fr_420px]">
        <OperationsTable
          rows={panel.operaciones}
          emptyMessage="No hay operacion temporal para mostrar."
        />

        <SystemStatus status={status} />
      </section>
    </div>
  );
}

export default Dashboard;
