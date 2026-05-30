import { ClipboardList } from "lucide-react";
import { useEffect, useState } from "react";

import InlineAlert from "../../../components/InlineAlert";
import ModalShell from "../../../components/ModalShell";
import {
  CANALES_ENTREGA_ECOM,
  ESTATUS_ECOM,
  GUIAS_ESPECIALES_ECOM,
  PAQUETERIAS_ECOM,
  PLATAFORMAS_ECOM,
  RESPONSABLES_ECOM,
  TIPOS_ENVIO_ECOM,
} from "../constants";
import { detectarPaqueteriaPorGuia } from "../utils/ecommerceUtils";

const estadoInicial = {
  pedido: "",
  plataforma: "Magento",
  guia: "",
  paqueteria: "Pendiente",
  responsable: "Sandra Barrera",
  estatus: "RECIBIDO",
};

const horaActualMX = () => {
  const ahora = new Date();

  const horas = String(ahora.getHours()).padStart(2, "0");
  const minutos = String(ahora.getMinutes()).padStart(2, "0");
  const segundos = String(ahora.getSeconds()).padStart(2, "0");

  return `${horas}:${minutos}:${segundos}`;
};

const normalizarReferencia = (valor = "") => {
  return String(valor || "")
    .trim()
    .toUpperCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, "");
};

const sanitizarPlataforma = (plataforma = "") => {
  if (plataforma === "Magento Local") return "Magento";
  if (plataforma === "Store Pickup") return "Magento";

  return PLATAFORMAS_ECOM.includes(plataforma) ? plataforma : "Magento";
};

const sanitizarPaqueteria = (paqueteria = "") => {
  return PAQUETERIAS_ECOM.includes(paqueteria) ? paqueteria : "Pendiente";
};

const sanitizarEstatus = (estatus = "") => {
  if (estatus === "FUERA DE VENTANA") return "RECIBIDO";

  return ESTATUS_ECOM.includes(estatus) ? estatus : "RECIBIDO";
};

const esStorePickupPorGuia = (pedido = "", guia = "", plataforma = "") => {
  const guiaNormalizada = normalizarReferencia(guia);

  if (!guiaNormalizada) return false;

  return (
    guiaNormalizada ===
      normalizarReferencia(GUIAS_ESPECIALES_ECOM.STORE_PICKUP) ||
    detectarPaqueteriaPorGuia(guia, { pedido, plataforma }) === "Store Pickup"
  );
};

export default function ModalNuevoPedido({
  abierto,
  onCerrar,
  onGuardar,
  pedidoEditar = null,
}) {
  const [form, setForm] = useState(estadoInicial);
  const [alerta, setAlerta] = useState(null);

  const modoEdicion = Boolean(pedidoEditar);

  useEffect(() => {
    if (!abierto) return;
    setAlerta(null);

    if (pedidoEditar) {
      setForm({
        pedido: pedidoEditar.pedido || "",
        plataforma: sanitizarPlataforma(pedidoEditar.plataforma),
        guia: pedidoEditar.guia === "SIN GUÃA" ? "" : pedidoEditar.guia || "",
        paqueteria: sanitizarPaqueteria(pedidoEditar.paqueteria),
        responsable: pedidoEditar.responsable || "Sandra Barrera",
        estatus: sanitizarEstatus(pedidoEditar.estatus),
      });
    } else {
      setForm(estadoInicial);
    }
  }, [abierto, pedidoEditar]);

  if (!abierto) return null;

  const actualizarCampo = (campo, valor) => {
    setAlerta(null);

    setForm((prev) => {
      const siguiente = {
        ...prev,
        [campo]: valor,
      };

      if (campo === "plataforma") {
        siguiente.plataforma = sanitizarPlataforma(valor);

        if (
          esStorePickupPorGuia(
            siguiente.pedido,
            siguiente.guia,
            siguiente.plataforma
          )
        ) {
          siguiente.paqueteria = "Store Pickup";
        } else if (prev.paqueteria === "Store Pickup") {
          siguiente.paqueteria = "Pendiente";
        }
      }

      if (campo === "paqueteria") {
        siguiente.paqueteria = sanitizarPaqueteria(valor);

        if (valor === "Store Pickup" && !siguiente.guia.trim()) {
          siguiente.guia =
            siguiente.pedido.trim() || GUIAS_ESPECIALES_ECOM.STORE_PICKUP;
        }
      }

      if (campo === "pedido") {
        if (esStorePickupPorGuia(valor, siguiente.guia, siguiente.plataforma)) {
          siguiente.paqueteria = "Store Pickup";
        }
      }

      if (campo === "guia") {
        const paqueteriaDetectada = detectarPaqueteriaPorGuia(valor, {
          pedido: siguiente.pedido,
          plataforma: siguiente.plataforma,
        });

        if (esStorePickupPorGuia(siguiente.pedido, valor, siguiente.plataforma)) {
          siguiente.paqueteria = "Store Pickup";
        } else if (paqueteriaDetectada !== "Pendiente") {
          siguiente.paqueteria = paqueteriaDetectada;
        } else if (prev.paqueteria === "Store Pickup") {
          siguiente.paqueteria = "Pendiente";
        }
      }

      if (campo === "estatus") {
        siguiente.estatus = sanitizarEstatus(valor);
      }

      return siguiente;
    });
  };

  const guardarPedido = (e) => {
    e.preventDefault();

    const pedidoLimpio = form.pedido.trim();
    const guiaLimpia = form.guia.trim();

    if (!pedidoLimpio) {
      setAlerta({
        tone: "warning",
        title: "Pedido requerido",
        message: "Captura el nÃºmero de pedido antes de guardar.",
      });
      return;
    }

    const esStorePickup = esStorePickupPorGuia(
      pedidoLimpio,
      guiaLimpia,
      form.plataforma
    );

    const guiaFinal =
      guiaLimpia ||
      (form.paqueteria === "Store Pickup" ? pedidoLimpio : "SIN GUÃA");

    const paqueteriaFinal =
      esStorePickup || form.paqueteria === "Store Pickup"
        ? "Store Pickup"
        : sanitizarPaqueteria(form.paqueteria);

    const pedidoFinal = {
      ...pedidoEditar,
      ...form,
      pedido: pedidoLimpio,
      plataforma: sanitizarPlataforma(form.plataforma),
      guia: guiaFinal,
      paqueteria: paqueteriaFinal,
      estatus: sanitizarEstatus(form.estatus),
      tipoEnvio:
        paqueteriaFinal === "Store Pickup"
          ? TIPOS_ENVIO_ECOM.STORE_PICKUP
          : pedidoEditar?.tipoEnvio || TIPOS_ENVIO_ECOM.SIN_CLASIFICAR,
      canalEntrega:
        paqueteriaFinal === "Store Pickup"
          ? CANALES_ENTREGA_ECOM.VALIJA_SUCURSAL
          : pedidoEditar?.canalEntrega || CANALES_ENTREGA_ECOM.SIN_CANAL,
      horaIngreso: pedidoEditar?.horaIngreso || horaActualMX(),
      fechaActualizacion: new Date().toISOString(),
    };

    const resultado = onGuardar(pedidoFinal);

    if (resultado === false || resultado?.ok === false) {
      const detalleTexto = resultado?.details
        ?.map((item) => `${item.label}: ${item.value || "-"}`)
        .join(" Â· ");

      setAlerta({
        tone: "error",
        title: resultado?.titulo || "No se pudo guardar",
        message:
          [resultado?.mensaje, detalleTexto]
            .filter(Boolean)
            .join(" ") ||
          "Valida la informaciÃ³n capturada e intenta nuevamente.",
      });
      return;
    }

    setForm(estadoInicial);
    onCerrar();
  };

  return (
    <ModalShell
      abierto={abierto}
      eyebrow="Comercio ElectrÃ³nico"
      title={modoEdicion ? "Editar pedido E-COM" : "Nuevo pedido E-COM"}
      description={
        modoEdicion
          ? "Actualiza los datos operativos del pedido seleccionado."
          : "Captura manual temporal antes de conectar base de datos."
      }
      icon={ClipboardList}
      onCerrar={onCerrar}
      size="md"
      footer={
        <div className="flex justify-end gap-3">
          <button
            type="button"
            onClick={onCerrar}
            className="rounded-xl border border-slate-200 px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            Cancelar
          </button>

          <button
            type="submit"
            form="form-nuevo-pedido"
            className="rounded-xl bg-[#d5b15f] px-5 py-3 text-sm font-bold text-[#071f3a] transition hover:bg-[#c7a04b]"
          >
            {modoEdicion ? "Guardar cambios" : "Guardar pedido"}
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {alerta && <InlineAlert {...alerta} />}

        <form id="form-nuevo-pedido" onSubmit={guardarPedido} className="space-y-5">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Pedido
              </label>

              <input
                value={form.pedido}
                onChange={(e) => actualizarCampo("pedido", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
                placeholder="Ej. MAG-202605-0183"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Plataforma
              </label>

              <select
                value={form.plataforma}
                onChange={(e) => actualizarCampo("plataforma", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
              >
                {PLATAFORMAS_ECOM.map((plataforma) => (
                  <option key={plataforma} value={plataforma}>
                    {plataforma}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                GuÃ­a
              </label>

              <input
                value={form.guia}
                onChange={(e) => actualizarCampo("guia", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm uppercase outline-none focus:border-[#d5b15f]"
                placeholder="Si guÃ­a = pedido, serÃ¡ Store Pickup"
              />
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                PaqueterÃ­a / canal
              </label>

              <select
                value={form.paqueteria}
                onChange={(e) => actualizarCampo("paqueteria", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
              >
                {PAQUETERIAS_ECOM.map((paqueteria) => (
                  <option key={paqueteria} value={paqueteria}>
                    {paqueteria}
                  </option>
                ))}
              </select>

              {form.paqueteria === "Store Pickup" && (
                <InlineAlert
                  tone="success"
                  title="Store Pickup detectado"
                  message="Se considera entrega a sucursal / valija, no paqueterÃ­a externa."
                  className="mt-3"
                />
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Responsable
              </label>

              <select
                value={form.responsable}
                onChange={(e) => actualizarCampo("responsable", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
              >
                {RESPONSABLES_ECOM.map((responsable) => (
                  <option key={responsable} value={responsable}>
                    {responsable}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm font-semibold text-slate-700">
                Estatus
              </label>

              <select
                value={form.estatus}
                onChange={(e) => actualizarCampo("estatus", e.target.value)}
                className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
              >
                {ESTATUS_ECOM.map((estatus) => (
                  <option key={estatus} value={estatus}>
                    {estatus}
                  </option>
                ))}
              </select>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Fuera de ventana ya no se captura como estatus visible; serÃ¡ una
                condiciÃ³n interna del sistema.
              </p>
            </div>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
