import { Download, ScanLine, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import InlineAlert from "../../../components/InlineAlert";
import ModalShell from "../../../components/ModalShell";
import { ESTATUS_LOTE_ECOM, PAQUETERIAS_ECOM } from "../constants";
import {
  detectarPaqueteriaPorGuia,
  normalizarGuia,
  obtenerClaseEstatus,
} from "../utils/ecommerceUtils";

export default function ModalEscaneoLote({
  abierto,
  lote,
  pedidosDelLote = [],
  historialLote = [],
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
  const soloLectura = [
    ESTATUS_LOTE_ECOM.LOTE_CERRADO,
    ESTATUS_LOTE_ECOM.ENVIADO,
    ESTATUS_LOTE_ECOM.CANCELADO,
  ].includes(lote.estatus);
  const pedidosPendientes = pedidosDelLote.filter(
    (pedido) => !["TERMINADO", "ENVIADO", "CANCELADO", "RETORNO", "REENVIO"].includes(pedido.estatus)
  );
  const pedidosSinGuia = pedidosDelLote.filter(
    (pedido) =>
      !pedido.guia ||
      String(pedido.guia).trim().toUpperCase() === "SIN GUÃƒÂA" ||
      String(pedido.guia).trim().toUpperCase() === "SIN GUIA"
  );
  const alertasOperativas = [
    diferencia !== 0
      ? `Diferencia de piezas: esperadas ${lote.piezasEsperadas || 0}, escaneadas ${pedidosDelLote.length}.`
      : "",
    pedidosPendientes.length > 0
      ? `${pedidosPendientes.length} pedido(s) pendiente(s) de resolver.`
      : "",
    pedidosSinGuia.length > 0
      ? `${pedidosSinGuia.length} pedido(s) sin guia capturada.`
      : "",
  ].filter(Boolean);

  const exportarDetalleLote = () => {
    const columnas = [
      "pedido",
      "guia",
      "paqueteria",
      "estatus",
      "plataforma",
      "fechaIngreso",
      "horaIngreso",
      "usuarioIngreso",
      "fechaFinTrabajo",
      "horaFinTrabajo",
    ];
    const escapeCsv = (value) =>
      `"${String(value ?? "").replace(/"/g, '""')}"`;
    const csv = [
      [`Lote ${lote.lote}`, `Estatus ${lote.estatus || ""}`].map(escapeCsv).join(","),
      columnas.join(","),
      ...pedidosDelLote.map((pedido) =>
        columnas.map((columna) => escapeCsv(pedido[columna])).join(",")
      ),
      "",
      "Historial",
      ["fecha", "hora", "tipo", "pedido", "usuario", "descripcion"].join(","),
      ...historialLote.map((movimiento) =>
        ["fecha", "hora", "tipo", "pedido", "usuario", "descripcion"]
          .map((columna) => escapeCsv(movimiento[columna]))
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lote.lote || "lote"}-detalle.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

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
              "Ya alcanzaste la cantidad esperada del lote. Â¿Deseas agregar una pieza adicional?",
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
          resultado.mensaje || "Valida la informaciÃ³n e intenta nuevamente.",
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
        mensaje: "Captura una guÃ­a o selecciona una paqueterÃ­a vÃ¡lida.",
      });
      return;
    }

    if (pedidosDelLote.length === 0) {
      mostrarAviso({
        tipo: "error",
        titulo: "Lote sin pedidos",
        mensaje: "Primero escanea pedidos antes de asignar guÃ­a o paqueterÃ­a.",
      });
      return;
    }

    const paqueteriaDetectada =
      paqueteriaLote !== "Pendiente"
        ? paqueteriaLote
        : detectarPaqueteriaPorGuia(guia, {
            plataforma: lote.plataforma,
          });

    const resultado = onAsignarGuiaLote(lote, {
      guia,
      paqueteria: paqueteriaDetectada,
      sobrescribir,
    });

    if (resultado?.ok === false) {
      mostrarAviso({
        tipo: "error",
        titulo: resultado.titulo || "No se pudo asignar",
        mensaje: resultado.mensaje || "Valida la informaciÃ³n.",
      });

      enfocarInputEscaneo();
      return;
    }

    mostrarAviso({
      tipo: "success",
      titulo: "AsignaciÃ³n aplicada",
      mensaje: resultado?.mensaje || "Se actualizÃ³ la informaciÃ³n del lote.",
    });

    setGuiaLote("");
    setPaqueteriaLote("Pendiente");
    setSobrescribir(false);

    enfocarInputEscaneo();
  };

  const actualizarGuiaPedido = (pedido, nuevaGuia) => {
    const guia = normalizarGuia(nuevaGuia);

    const paqueteriaDetectada =
      guia === ""
        ? "Pendiente"
        : detectarPaqueteriaPorGuia(guia, {
            pedido: pedido.pedido,
            plataforma: pedido.plataforma,
          });

    onActualizarGuiaPedido(pedido, {
      guia: guia || "",
      paqueteria: paqueteriaDetectada,
    });
  };

  const cambiarPaqueteriaManualPedido = (pedido, nuevaPaqueteria) => {
    const guiaBase =
      pedido.guia && String(pedido.guia).trim().toUpperCase() !== "SIN GUÃA"
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
      eyebrow={soloLectura ? "Detalle E-COM por lote" : "RecepciÃ³n E-COM por lote"}
      title={lote.lote}
      description={
        <>
          Plataforma: <strong>{lote.plataforma}</strong> Â· Responsable:{" "}
          <strong>{lote.responsable}</strong>
        </>
      }
      icon={ScanLine}
      onCerrar={onCerrar}
      size="xl"
      footer={
        <div className="flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={exportarDetalleLote}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-3 text-sm font-bold text-slate-700 transition hover:bg-slate-50"
          >
            <Download className="h-4 w-4" />
            Exportar detalle
          </button>

          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl bg-[#071f3a] px-5 py-3 text-sm font-bold text-white transition hover:bg-[#0a2a4d]"
          >
            {soloLectura ? "Cerrar detalle" : "Cerrar lote"}
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
                Estatus recepciÃ³n
              </div>
              <div className="mt-1 text-sm font-bold text-[#071f3a]">
                {diferencia === 0 ? "COMPLETO" : "EN RECEPCIÃ“N"}
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

          {soloLectura && (
            <InlineAlert
              tone="info"
              title="Lote en modo consulta"
              message="Este lote ya fue cerrado operativamente. Puedes validar su detalle, pero no modificar pedidos, guÃ­as o paqueterÃ­a desde esta vista."
            />
          )}

          {alertasOperativas.length > 0 && (
            <InlineAlert
              tone="warning"
              title="Alertas operativas"
              message={alertasOperativas.join("\n")}
            />
          )}

          <section className="grid gap-4 lg:grid-cols-[1fr_1.2fr]">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#071f3a]">
                Expediente del lote
              </h3>

              <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
                {[
                  ["Estatus", lote.estatus || "-"],
                  ["Responsable", lote.responsableLote || lote.responsable || "-"],
                  ["Creado", `${lote.fechaCreacionLote || "-"} ${lote.horaCreacionLote || ""}`],
                  ["Cerrado", `${lote.fechaCierreLote || "-"} ${lote.horaCierreLote || ""}`],
                  ["Enviado", `${lote.fechaEnvioLote || "-"} ${lote.horaEnvioLote || ""}`],
                  ["Usuario cierre", lote.usuarioCierreLote || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="rounded-xl bg-slate-50 px-3 py-2">
                    <dt className="text-xs font-semibold uppercase text-slate-500">
                      {label}
                    </dt>
                    <dd className="mt-1 font-bold text-[#071f3a]">{value}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-lg font-bold text-[#071f3a]">
                  Bitacora operativa
                </h3>
                <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-bold text-slate-600">
                  {historialLote.length}
                </span>
              </div>

              <div className="mt-4 max-h-56 space-y-3 overflow-auto pr-1">
                {historialLote.length === 0 ? (
                  <p className="rounded-xl bg-slate-50 px-3 py-3 text-sm text-slate-500">
                    Aun no hay movimientos registrados para este lote.
                  </p>
                ) : (
                  historialLote.slice(0, 12).map((movimiento) => (
                    <article
                      key={movimiento.id}
                      className="rounded-xl border border-slate-100 bg-slate-50 px-3 py-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <p className="text-xs font-bold uppercase text-[#b08a2b]">
                          {movimiento.tipo}
                        </p>
                        <p className="text-xs font-semibold text-slate-500">
                          {movimiento.fecha} {movimiento.hora}
                        </p>
                      </div>
                      <p className="mt-1 text-sm font-semibold text-[#071f3a]">
                        {movimiento.descripcion}
                      </p>
                      <p className="mt-1 text-xs text-slate-500">
                        Usuario: {movimiento.usuario || "SILOGEC"}
                      </p>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>

        <div
          className={`grid min-h-0 flex-1 gap-5 overflow-hidden ${
            soloLectura ? "" : "xl:grid-cols-[380px_minmax(0,1fr)]"
          }`}
        >
          {!soloLectura && (
          <div className="min-w-[360px] space-y-5 overflow-auto pr-1">
            <div className="rounded-2xl border border-slate-200 bg-white p-5">
              <h3 className="text-lg font-bold text-[#071f3a]">
                Escaneo de pedidos
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Escanea el cÃ³digo de barras y presiona Enter.
              </p>

              <form onSubmit={escanearPedido} className="mt-5 space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Pedido / CÃ³digo de barras
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
                AsignaciÃ³n rÃ¡pida por lote
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Aplica guÃ­a y/o paqueterÃ­a a todos los pedidos pendientes del
                lote.
              </p>

              <form onSubmit={asignarGuiaRapida} className="mt-5 space-y-4">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    GuÃ­a
                  </label>

                  <input
                    value={guiaLote}
                    onChange={(e) => {
                      const valor = e.target.value.toUpperCase();
                      setGuiaLote(valor);

                      const detectada = detectarPaqueteriaPorGuia(valor, {
                        plataforma: lote.plataforma,
                      });
                      if (detectada !== "Pendiente") {
                        setPaqueteriaLote(detectada);
                      }
                    }}
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-[#d5b15f]"
                    placeholder="Captura guÃ­a si aplica"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    PaqueterÃ­a / canal
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
                  Sobrescribir pedidos que ya tengan guÃ­a o paqueterÃ­a
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
              <div className="text-sm font-bold">DetecciÃ³n automÃ¡tica</div>
              <p className="mt-1 text-sm text-slate-300">
                Al capturar una guÃ­a, SILOGEC detecta la paqueterÃ­a
                automÃ¡ticamente. Si no logra identificarla, puedes seleccionarla
                manualmente.
              </p>
            </div>
          </div>
          )}

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
              <table className="w-full min-w-[1180px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="w-[60px] px-4 py-3">#</th>
                    <th className="w-[230px] px-4 py-3">Pedido</th>
                    <th className="w-[260px] px-4 py-3">GuÃ­a rÃ¡pida</th>
                    <th className="w-[210px] px-4 py-3">PaqueterÃ­a / canal</th>
                    <th className="w-[160px] px-4 py-3">Estatus</th>
                    <th className="w-[130px] px-4 py-3">Hora</th>
                    <th className="w-[130px] px-4 py-3 text-right">AcciÃ³n</th>
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-100">
                  {pedidosDelLote.length === 0 ? (
                    <tr>
                      <td
                        colSpan="7"
                        className="px-4 py-8 text-center text-sm text-slate-500"
                      >
                        AÃºn no hay pedidos escaneados.
                      </td>
                    </tr>
                  ) : (
                    pedidosDelLote.map((pedido, index) => (
                      <tr key={pedido.id} className="hover:bg-slate-50">
                        <td className="px-4 py-3 font-semibold text-slate-500">
                          {index + 1}
                        </td>

                        <td className="px-4 py-3">
                          <div className="min-w-[200px] break-words font-semibold text-[#071f3a]">
                            {pedido.pedido}
                          </div>
                        </td>

                        <td className="px-4 py-3">
                          <input
                            value={
                              pedido.guia === "SIN GUÃA"
                                ? ""
                                : pedido.guia || ""
                            }
                            onChange={(e) =>
                              actualizarGuiaPedido(pedido, e.target.value)
                            }
                            disabled={soloLectura}
                            className={`w-64 rounded-xl border px-3 py-2 text-xs font-semibold uppercase outline-none ${
                              soloLectura
                                ? "border-slate-200 bg-slate-50 text-slate-600"
                                : "border-slate-200 focus:border-[#d5b15f]"
                            }`}
                            placeholder="Captura guÃ­a"
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
                            disabled={soloLectura}
                            className={`rounded-xl border px-3 py-2 text-xs font-semibold outline-none ${
                              soloLectura
                                ? "border-slate-200 bg-slate-50 text-slate-600"
                                : pedido.paqueteria &&
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

                        <td className="px-4 py-3">
                          <span
                            className={`${obtenerClaseEstatus(
                              pedido.estatus
                            )} inline-flex min-w-[120px] items-center justify-center`}
                          >
                            {pedido.estatus}
                          </span>
                        </td>

                        <td className="px-4 py-3 text-slate-600">
                          {pedido.horaIngreso}
                        </td>

                        <td className="px-4 py-3 text-right">
                          {soloLectura ? (
                            <span className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-500">
                              Consulta
                            </span>
                          ) : (
                            <button
                              type="button"
                              onClick={() => onEliminarPedido(pedido)}
                              className="rounded-xl border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                            >
                              <Trash2 className="inline h-3.5 w-3.5" /> Quitar
                            </button>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </ModalShell>
  );
}
