import { ScanLine, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InlineAlert from "../../../components/InlineAlert";
import ModalShell from "../../../components/ModalShell";
import { PAQUETERIAS_ECOM } from "../constants";
import { detectarPaqueteriaPorGuia, normalizarGuia } from "../utils/ecommerceUtils";

export default function ModalEscaneoLote({
  abierto,
  lote,
  pedidosDelLote = [],
  onCerrar,
  onAgregarPedido,
  onEliminarPedido,
  onAsignarGuiaLote,
  onActualizarGuiaPedido,
  onConfirmar,
}) {
  const [pedidoEscaneado, setPedidoEscaneado] = useState("");
  const [guiaLote, setGuiaLote] = useState("");
  const [paqueteriaLote, setPaqueteriaLote] = useState("Pendiente");
  const [sobrescribir, setSobrescribir] = useState(false);
  const [aviso, setAviso] = useState(null);

  const inputRef = useRef(null);

  useEffect(() => {
    if (abierto) {
      setAviso(null);
      setPedidoEscaneado("");
      setGuiaLote("");
      setPaqueteriaLote("Pendiente");
      setSobrescribir(false);

      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  }, [abierto]);

  if (!abierto || !lote) return null;

  const diferencia = lote.piezasEsperadas - pedidosDelLote.length;

  const limpiarAvisoDespues = () => {
    setTimeout(() => {
      setAviso(null);
    }, 3500);
  };

  const mostrarAviso = (nuevoAviso) => {
    setAviso(nuevoAviso);
    limpiarAvisoDespues();
  };

  const enfocarInputEscaneo = () => {
    setTimeout(() => {
      inputRef.current?.focus();
    }, 50);
  };

  const escanearPedido = async (e) => {
    e.preventDefault();

    const pedido = pedidoEscaneado.trim();

    if (!pedido) return;

    if (pedidosDelLote.length >= lote.piezasEsperadas) {
      const confirmar = onConfirmar
        ? await onConfirmar({
            title: "Pieza adicional",
            message:
              "Ya alcanzaste la cantidad esperada del lote. ¿Deseas agregar una pieza adicional?",
            tone: "warning",
            confirmLabel: "Agregar pieza",
          })
        : true;

      if (!confirmar) {
        setPedidoEscaneado("");
        enfocarInputEscaneo();
        return;
      }
    }

    const resultado = onAgregarPedido(lote, pedido);

    if (resultado?.ok === false) {
      mostrarAviso({
        tipo: "error",
        titulo: resultado.titulo || "No se pudo agregar el pedido",
        mensaje:
          resultado.mensaje || "Valida la información e intenta nuevamente.",
      });

      setPedidoEscaneado("");
      enfocarInputEscaneo();
      return;
    }

    mostrarAviso({
      tipo: "success",
      titulo: "Pedido agregado",
      mensaje: `El pedido ${pedido} fue vinculado correctamente al lote ${lote.lote}.`,
    });

    setPedidoEscaneado("");
    enfocarInputEscaneo();
  };

  const asignarGuiaRapida = (e) => {
    e.preventDefault();

    const guia = normalizarGuia(guiaLote);

    if (!guia && paqueteriaLote === "Pendiente") {
      mostrarAviso({
        tipo: "error",
        titulo: "Datos incompletos",
        mensaje: "Captura una guía o selecciona una paquetería válida.",
      });
      return;
    }

    if (pedidosDelLote.length === 0) {
      mostrarAviso({
        tipo: "error",
        titulo: "Lote sin pedidos",
        mensaje: "Primero escanea pedidos antes de asignar guía o paquetería.",
      });
      return;
    }

    const paqueteriaDetectada =
      paqueteriaLote !== "Pendiente"
        ? paqueteriaLote
        : detectarPaqueteriaPorGuia(guia);

    const resultado = onAsignarGuiaLote(lote, {
      guia,
      paqueteria: paqueteriaDetectada,
      sobrescribir,
    });

    if (resultado?.ok === false) {
      mostrarAviso({
        tipo: "error",
        titulo: resultado.titulo || "No se pudo asignar",
        mensaje: resultado.mensaje || "Valida la información.",
      });

      enfocarInputEscaneo();
      return;
    }

    mostrarAviso({
      tipo: "success",
      titulo: "Asignación aplicada",
      mensaje: resultado?.mensaje || "Se actualizó la información del lote.",
    });

    setGuiaLote("");
    setPaqueteriaLote("Pendiente");
    setSobrescribir(false);

    enfocarInputEscaneo();
  };

  const actualizarGuiaPedido = (pedido, nuevaGuia) => {
    const guia = normalizarGuia(nuevaGuia);

    const paqueteriaDetectada =
      guia === "" ? "Pendiente" : detectarPaqueteriaPorGuia(guia);

    onActualizarGuiaPedido(pedido, {
      guia: guia || "",
      paqueteria: paqueteriaDetectada,
    });
  };

  const cambiarPaqueteriaManualPedido = (pedido, nuevaPaqueteria) => {
    const guiaBase =
      pedido.guia && String(pedido.guia).trim().toUpperCase() !== "SIN GUÍA"
        ? pedido.guia
        : "";

    onActualizarGuiaPedido(pedido, {
      guia: guiaBase,
      paqueteria: nuevaPaqueteria,
    });
  };

  return (
    <ModalShell
      abierto={abierto}
      eyebrow="Recepción E-COM por lote"
      title={lote.lote}
      description={
        <>
          Plataforma: <strong>{lote.plataforma}</strong> · Responsable:{" "}
          <strong>{lote.responsable}</strong>
        </>
      }
      icon={ScanLine}
      onCerrar={onCerrar}
      size="xl"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-[#071f3a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a2a4d]"
          >
            Cerrar lote
          </button>
        </div>
      }
    >
      <div className="space-y-5">
          <div className="grid gap-4 md:grid-cols-4">
            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Esperadas
              </div>
              <div className="mt-1 text-2xl font-bold text-[#071f3a]">
                {lote.piezasEsperadas}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Escaneadas
              </div>
              <div className="mt-1 text-2xl font-bold text-[#071f3a]">
                {pedidosDelLote.length}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Diferencia
              </div>
              <div
                className={`mt-1 text-2xl font-bold ${
                  diferencia === 0 ? "text-emerald-700" : "text-amber-700"
                }`}
              >
                {diferencia}
              </div>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-semibold uppercase text-slate-500">
                Estatus recepción
              </div>
              <div className="mt-1 text-sm font-bold text-[#071f3a]">
                {diferencia === 0 ? "COMPLETO" : "EN RECEPCIÓN"}
              </div>
            </div>
          </div>

          {aviso && (
            <InlineAlert
              className="mt-5"
              tone={aviso.tipo === "error" ? "error" : "success"}
              title={aviso.titulo}
              message={aviso.mensaje}
            />
          )}
        </div>

        <div className="grid min-h-0 flex-1 gap-5 overflow-hidden xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="min-w-[360px] space-y-5 overflow-auto pr-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#071f3a]">
                Escaneo de pedidos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Escanea el código de barras y presiona Enter.
              </p>

              <form onSubmit={escanearPedido} className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Pedido / Código de barras
                </label>

                <div className="flex gap-2">
                  <input
                    ref={inputRef}
                    value={pedidoEscaneado}
                    onChange={(e) => setPedidoEscaneado(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-lg font-semibold outline-none focus:border-[#d5b15f]"
                    placeholder="Escanear pedido..."
                  />

                  <button
                    type="submit"
                    className="inline-flex items-center gap-2 rounded-2xl bg-[#d5b15f] px-5 py-3 text-sm font-bold text-[#071f3a] transition hover:bg-[#c7a04b]"
                  >
                    <ScanLine className="h-5 w-5" />
                    Agregar
                  </button>
                </div>
              </form>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#071f3a]">
                Asignación rápida por lote
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Aplica guía y/o paquetería a todos los pedidos pendientes del
                lote.
              </p>

              <form onSubmit={asignarGuiaRapida} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Guía
                  </label>

                  <input
                    value={guiaLote}
                    onChange={(e) => {
                      const valor = e.target.value.toUpperCase();
                      setGuiaLote(valor);

                      const detectada = detectarPaqueteriaPorGuia(valor);
                      if (detectada !== "Pendiente") {
                        setPaqueteriaLote(detectada);
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-[#d5b15f]"
                    placeholder="Captura guía si aplica"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Paquetería / canal
                  </label>

                  <select
                    value={paqueteriaLote}
                    onChange={(e) => setPaqueteriaLote(e.target.value)}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
                  >
                    {PAQUETERIAS_ECOM.map((paqueteria) => (
                      <option key={paqueteria} value={paqueteria}>
                        {paqueteria}
                      </option>
                    ))}
                  </select>
                </div>

                <label className="flex items-center gap-2 text-sm font-medium text-slate-600">
                  <input
                    type="checkbox"
                    checked={sobrescribir}
                    onChange={(e) => setSobrescribir(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300"
                  />
                  Sobrescribir pedidos que ya tengan guía o paquetería
                </label>

                <button
                  type="submit"
                  className="w-full rounded-2xl bg-[#071f3a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a2a4d]"
                >
                  Aplicar al lote
                </button>
              </form>
            </div>

            <div className="rounded-2xl border border-[#d5b15f]/40 bg-[#071f3a] p-4 text-white">
              <div className="text-sm font-bold">Detección automática</div>
              <p className="mt-1 text-sm text-slate-300">
                Al capturar una guía, SILOGEC detecta la paquetería
                automáticamente. Si no logra identificarla, puedes seleccionarla
                manualmente.
              </p>
            </div>
          </div>

          <div className="min-h-0 min-w-0 rounded-2xl border border-slate-200 bg-white p-5">
            <div className="mb-4 flex items-center justify-between gap-3">
              <div>
                <h3 className="text-lg font-bold text-[#071f3a]">
                  Pedidos escaneados
                </h3>

                <p className="text-sm text-slate-500">
                  Total vinculados al lote: {pedidosDelLote.length}
                </p>
              </div>
            </div>

            <div className="max-h-[540px] overflow-auto rounded-2xl border border-slate-200">
              <table className="w-full min-w-[1050px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">#</th>
                    <th className="px-4 py-3">Pedido</th>
                    <th className="px-4 py-3">Guía rápida</th>
                    <th className="px-4 py-3">Paquetería / canal</th>
                    <th className="px-4 py-3">Estatus</th>
                    <th className="px-4 py-3">Hora</th>
                    <th className="px-4 py-3">Acción</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pedidosDelLote.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        Aún no hay pedidos escaneados.
                      </td>
                    </tr>
                  ) : (
                    pedidosDelLote.map((pedido, index) => (
                      <tr key={pedido.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3 font-semibold text-[#071f3a]">
                          {pedido.pedido}
                        </td>

                        <td className="px-4 py-3">
                          <input
                            value={
                              pedido.guia === "SIN GUÍA"
                                ? ""
                                : pedido.guia || ""
                            }
                            onChange={(e) =>
                              actualizarGuiaPedido(pedido, e.target.value)
                            }
                            className="w-56 rounded-xl border border-slate-200 px-3 py-2 text-xs font-semibold uppercase outline-none focus:border-[#d5b15f]"
                            placeholder="Captura guía"
                          />
                        </td>

                        <td className="px-4 py-3">
                          <select
                            value={pedido.paqueteria || "Pendiente"}
                            onChange={(e) =>
                              cambiarPaqueteriaManualPedido(
                                pedido,
                                e.target.value
                              )
                            }
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                              pedido.paqueteria &&
                              pedido.paqueteria !== "Pendiente"
                                ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                                : "border-slate-200 bg-slate-50 text-slate-500"
                            }`}
                          >
                            {PAQUETERIAS_ECOM.map((paqueteria) => (
                              <option key={paqueteria} value={paqueteria}>
                                {paqueteria}
                              </option>
                            ))}
                          </select>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {pedido.estatus}
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {pedido.horaIngreso}
                        </td>

                        <td className="px-4 py-3">
                          <button
                            type="button"
                            onClick={() => onEliminarPedido(pedido)}
                            className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                          >
                            <Trash2 className="inline h-3.5 w-3.5" /> Quitar
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
      </div>
    </ModalShell>
  );
}
