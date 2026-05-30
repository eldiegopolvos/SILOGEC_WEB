import { useMemo, useRef, useState } from "react";
import {
  Bot,
  ChevronDown,
  CornerDownLeft,
  MessageCircle,
  Search,
  Send,
  X,
} from "lucide-react";

import {
  STORAGE_HISTORIAL_KEY,
  STORAGE_LOTES_KEY,
  STORAGE_PEDIDOS_KEY,
} from "../modules/ecommerce/constants";
import { removerPedidosDemoPredeterminados } from "../modules/ecommerce/utils/ecommerceUtils";

const initialMessages = [
  {
    id: "welcome",
    role: "assistant",
    text:
      "Hola, soy REBECA, el asistente operativo de prueba para SILOGEC. Por ahora puedo ayudarte a consultar guias, pedidos, lotes, pendientes y estatus usando la informacion temporal disponible en esta app.",
  },
];

const suggestions = [
  "Busca una guia",
  "Estatus de un pedido",
  "Muestra lotes abiertos",
  "Que pendientes hay?",
];

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

function joinFields(item, fields) {
  return fields
    .map((field) => item[field])
    .filter(Boolean)
    .join(" | ");
}

function containsQuery(item, fields, query) {
  const normalizedQuery = normalize(query);
  return fields.some((field) => normalize(item[field]).includes(normalizedQuery));
}

function createMessageId() {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }

  return `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function formatPedido(pedido) {
  return [
    `Pedido: ${pedido.pedido || "Sin pedido"}`,
    `Estatus: ${pedido.estatus || "Sin estatus"}`,
    `Guia: ${pedido.guia || "Sin guia"}`,
    `Paqueteria: ${pedido.paqueteria || "Pendiente"}`,
    `Lote: ${pedido.lote || "SIN LOTE"}`,
    `Responsable: ${pedido.responsable || pedido.usuarioIngreso || "Sin responsable"}`,
    pedido.horaIngreso ? `Ingreso: ${pedido.horaIngreso}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatLote(lote, pedidos) {
  const loteId = lote.lote || lote.folioLote || "Sin folio";
  const pedidosDelLote = pedidos.filter((pedido) => pedido.lote === loteId);
  const terminados = pedidosDelLote.filter((pedido) =>
    ["TERMINADO", "ENVIADO", "CANCELADO", "RETORNO", "REENVIO"].includes(
      pedido.estatus
    )
  ).length;

  return [
    `Lote: ${loteId}`,
    `Estatus: ${lote.estatus || "Sin estatus"}`,
    `Pedidos: ${pedidosDelLote.length || lote.totalPedidos || 0}`,
    `Resueltos: ${terminados}`,
    `Responsable: ${lote.responsableLote || lote.responsable || "Sin responsable"}`,
    lote.fechaCreacionLote ? `Creado: ${lote.fechaCreacionLote}` : "",
  ]
    .filter(Boolean)
    .join("\n");
}

function formatMovimiento(movimiento) {
  return [
    `${movimiento.fecha || "-"} ${movimiento.hora || ""}`,
    movimiento.tipo || "MOVIMIENTO",
    movimiento.pedido ? `Pedido: ${movimiento.pedido}` : "",
    movimiento.descripcion || "",
    `Usuario: ${movimiento.usuario || "SILOGEC"}`,
  ]
    .filter(Boolean)
    .join("\n");
}

function formatRecepcion(recepcion) {
  return [
    `Guia: ${recepcion.guia}`,
    `Origen: ${recepcion.origen}`,
    `Estatus: ${recepcion.estatus}`,
    `Paquetes: ${recepcion.paquetes}`,
    `Usuario: ${recepcion.usuario}`,
  ].join("\n");
}

function formatOperacion(operacion) {
  return [
    `Folio: ${operacion.folio}`,
    `Modulo: ${operacion.modulo}`,
    `Estatus: ${operacion.estatus}`,
    `Responsable: ${operacion.responsable}`,
    `Ventana: ${operacion.ventana}`,
    `Prioridad: ${operacion.prioridad}`,
  ].join("\n");
}

function buildAnswer(question, data) {
  const q = normalize(question);
  const { pedidos, lotes, recepciones = [], operaciones = [] } = data;

  if (!q) {
    return "Escribe una guia, pedido, lote o pregunta operativa para consultar.";
  }

  if (q.includes("puedes") || q.includes("ayuda") || q.includes("como")) {
    return [
      "Por ahora puedo ayudarte con:",
      "- Buscar guia, pedido o folio.",
      "- Mostrar estatus de pedidos E-COM.",
      "- Resumir lotes y pendientes.",
      "- Revisar la bitacora operativa temporal.",
      "",
      "Ejemplos: 'guia DHL1234567', 'pedido 9001234567', 'lotes abiertos'.",
    ].join("\n");
  }

  if (q.includes("pendiente") || q.includes("atrasado") || q.includes("abierto")) {
    const pedidosPendientes = pedidos.filter(
      (pedido) =>
        !["TERMINADO", "ENVIADO", "CANCELADO", "RETORNO", "REENVIO"].includes(
          pedido.estatus
        )
    );
    const recepcionesPendientes = recepciones.filter((item) =>
      normalize(item.estatus).includes("pendiente")
    );
    const lotesAbiertos = lotes.filter(
      (lote) => !["LOTE CERRADO", "ENVIADO", "CANCELADO"].includes(lote.estatus)
    );

    if (
      pedidosPendientes.length === 0 &&
      recepcionesPendientes.length === 0 &&
      lotesAbiertos.length === 0
    ) {
      return "No detecte pendientes en la informacion temporal disponible.";
    }

    return [
      `Pedidos E-COM pendientes: ${pedidosPendientes.length}`,
      pedidosPendientes.slice(0, 4).map(formatPedido).join("\n\n"),
      `Recepciones pendientes: ${recepcionesPendientes.length}`,
      recepcionesPendientes.slice(0, 3).map(formatRecepcion).join("\n\n"),
      `Lotes abiertos: ${lotesAbiertos.length}`,
      lotesAbiertos.slice(0, 3).map((lote) => formatLote(lote, pedidos)).join("\n\n"),
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  if (q.includes("historial") || q.includes("movimiento") || q.includes("bitacora")) {
    const queryWithoutWord = question
      .replace(/historial|movimientos?|bitacora|lote|pedido|de|del/gi, "")
      .trim();
    const movimientos = data.historial.filter((movimiento) =>
      containsQuery(
        movimiento,
        ["lote", "pedido", "tipo", "descripcion", "usuario"],
        queryWithoutWord || question
      )
    );

    if (movimientos.length === 0) {
      return "No encontre movimientos para ese criterio en la bitacora temporal.";
    }

    return movimientos.slice(0, 6).map(formatMovimiento).join("\n\n");
  }

  if (q.includes("lote") || q.includes("lotes")) {
    const queryWithoutWord = question.replace(/lotes?|estatus|folio|busca/gi, "").trim();
    const matches = queryWithoutWord
      ? lotes.filter((lote) =>
          containsQuery(lote, ["lote", "folioLote", "estatus", "responsable"], queryWithoutWord)
        )
      : lotes;

    if (matches.length === 0) {
      return "No encontre lotes con ese criterio. Si aun no has creado lotes en E-Commerce, primero genera uno desde el modulo.";
    }

    return matches.slice(0, 5).map((lote) => formatLote(lote, pedidos)).join("\n\n");
  }

  const searchableText = question.replace(/estatus|estado|busca|buscar|guia|pedido|folio/gi, "").trim();
  const query = searchableText || question;

  const pedidoMatches = pedidos.filter((pedido) =>
    containsQuery(
      pedido,
      ["pedido", "guia", "lote", "plataforma", "paqueteria", "estatus", "responsable"],
      query
    )
  );

  const recepcionMatches = recepciones.filter((item) =>
    containsQuery(item, ["guia", "origen", "estatus", "usuario"], query)
  );

  const operacionMatches = operaciones.filter((item) =>
    containsQuery(item, ["folio", "modulo", "estatus", "responsable", "prioridad"], query)
  );

  const results = [
    ...pedidoMatches.slice(0, 3).map(formatPedido),
    ...recepcionMatches.slice(0, 3).map(formatRecepcion),
    ...operacionMatches.slice(0, 3).map(formatOperacion),
  ];

  if (results.length > 0) return results.join("\n\n");

  const sample = [
    ...pedidos.map((pedido) => joinFields(pedido, ["pedido", "guia", "estatus"])),
    ...recepciones.map((item) => joinFields(item, ["guia", "estatus"])),
  ]
    .filter(Boolean)
    .slice(0, 4)
    .join("\n");

  return [
    "No encontre coincidencias con la informacion temporal disponible.",
    "Puedes probar con alguno de estos datos:",
    sample,
  ]
    .filter(Boolean)
    .join("\n\n");
}

function SilogecAssistant() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState(initialMessages);
  const [input, setInput] = useState("");
  const inputRef = useRef(null);

  const data = useMemo(
    () => ({
      pedidos: removerPedidosDemoPredeterminados(
        readStoredArray(STORAGE_PEDIDOS_KEY, [])
      ),
      lotes: readStoredArray(STORAGE_LOTES_KEY, []),
      historial: readStoredArray(STORAGE_HISTORIAL_KEY, []),
      recepciones: [],
      operaciones: [],
    }),
    [open, messages.length]
  );

  const handleOpen = () => {
    setOpen(true);
    window.setTimeout(() => inputRef.current?.focus(), 80);
  };

  const ask = (value = input) => {
    const question = value.trim();
    if (!question) return;

    const answer = buildAnswer(question, data);
    setMessages((current) => [
      ...current,
      { id: createMessageId(), role: "user", text: question },
      { id: createMessageId(), role: "assistant", text: answer },
    ]);
    setInput("");
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      {open ? (
        <section className="flex h-[620px] w-[min(420px,calc(100vw-32px))] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <header className="flex items-center justify-between border-b border-slate-200 bg-[#061a2f] px-4 py-3 text-white">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
                <Bot size={20} />
              </div>
              <div>
                <h2 className="text-sm font-bold">REBECA</h2>
                <p className="text-xs text-slate-300">Proyecto de asistente SILOGEC</p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex h-9 w-9 items-center justify-center rounded-xl text-slate-200 transition hover:bg-white/10 hover:text-white"
              aria-label="Cerrar asistente"
            >
              <X size={18} />
            </button>
          </header>

          <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <p className="font-bold text-[#061a2f]">{data.pedidos.length}</p>
                <p className="text-slate-500">Pedidos</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <p className="font-bold text-[#061a2f]">{data.lotes.length}</p>
                <p className="text-slate-500">Lotes</p>
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-2">
                <p className="font-bold text-[#061a2f]">{data.recepciones.length}</p>
                <p className="text-slate-500">Guias</p>
              </div>
            </div>
          </div>

          <div className="flex-1 space-y-3 overflow-y-auto bg-slate-50 p-4">
            {messages.map((message) => (
              <article
                key={message.id}
                className={`max-w-[88%] whitespace-pre-line rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  message.role === "user"
                    ? "ml-auto bg-[#061a2f] text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
              >
                {message.text}
              </article>
            ))}
          </div>

          <div className="border-t border-slate-200 bg-white p-4">
            <div className="mb-3 flex gap-2 overflow-x-auto pb-1">
              {suggestions.map((suggestion) => (
                <button
                  key={suggestion}
                  type="button"
                  onClick={() => ask(suggestion)}
                  className="shrink-0 rounded-full border border-slate-200 px-3 py-2 text-xs font-semibold text-slate-600 transition hover:border-[#b68a2c] hover:text-[#061a2f]"
                >
                  {suggestion}
                </button>
              ))}
            </div>

            <form
              className="flex items-center gap-2"
              onSubmit={(event) => {
                event.preventDefault();
                ask();
              }}
            >
              <div className="flex min-h-12 flex-1 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3">
                <Search size={17} className="text-slate-400" />
                <input
                  ref={inputRef}
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  placeholder="Pregunta por guia, pedido o lote..."
                  className="w-full bg-transparent text-sm text-slate-700 outline-none placeholder:text-slate-400"
                />
                <CornerDownLeft size={16} className="hidden text-slate-300 sm:block" />
              </div>

              <button
                type="submit"
                className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#b68a2c] text-white transition hover:bg-[#9b7421]"
                aria-label="Enviar consulta"
              >
                <Send size={18} />
              </button>
            </form>
          </div>
        </section>
      ) : (
        <button
          type="button"
          onClick={handleOpen}
          className="group flex h-14 items-center gap-3 rounded-2xl bg-[#061a2f] px-4 text-white shadow-xl transition hover:bg-[#09233e]"
        >
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10">
            <MessageCircle size={20} />
          </span>
          <span className="hidden text-sm font-bold sm:block">Asistente REBECA</span>
          <ChevronDown size={16} className="hidden rotate-180 text-slate-300 sm:block" />
        </button>
      )}
    </div>
  );
}

export default SilogecAssistant;
