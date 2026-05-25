import { PackagePlus } from "lucide-react";
import { useEffect, useState } from "react";

import InlineAlert from "../../../components/InlineAlert";
import ModalShell from "../../../components/ModalShell";
import { PLATAFORMAS_ECOM, RESPONSABLES_ECOM } from "../constants";

const estadoInicial = {
  plataforma: "Magento",
  piezasEsperadas: "",
  responsable: "Sandra Barrera",
};

export default function ModalNuevoLote({ abierto, onCerrar, onGuardar }) {
  const [form, setForm] = useState(estadoInicial);
  const [alerta, setAlerta] = useState(null);

  useEffect(() => {
    if (abierto) setAlerta(null);
  }, [abierto]);

  if (!abierto) return null;

  const piezasPreview = Number(form.piezasEsperadas || 0);

  const actualizarCampo = (campo, valor) => {
    setForm((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  };

  const guardarLote = (e) => {
    e.preventDefault();

    const piezas = Number(form.piezasEsperadas);

    if (!form.plataforma) {
      setAlerta({
        tone: "warning",
        title: "Selecciona una plataforma",
        message: "El lote necesita una plataforma para generar su folio.",
      });
      return;
    }

    if (!piezas || piezas <= 0) {
      setAlerta({
        tone: "warning",
        title: "Cantidad inválida",
        message: "Captura una cantidad mayor a cero en piezas esperadas.",
      });
      return;
    }

    onGuardar({
      plataforma: form.plataforma,
      piezasEsperadas: piezas,
      piezasEscaneadas: 0,
      responsable: form.responsable,
    });

    setForm(estadoInicial);
    onCerrar();
  };

  return (
    <ModalShell
      abierto={abierto}
      eyebrow="Recepción E-COM"
      title="Nuevo lote E-COM"
      description="Crea un lote por plataforma para recibir pedidos escaneados."
      icon={PackagePlus}
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
            form="form-nuevo-lote"
            className="rounded-xl bg-[#d5b15f] px-5 py-3 text-sm font-bold text-[#071f3a] transition hover:bg-[#c7a04b]"
          >
            Crear lote
          </button>
        </div>
      }
    >
      <div className="space-y-5">
        {alerta && <InlineAlert {...alerta} />}

        <form id="form-nuevo-lote" onSubmit={guardarLote}>
          <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_260px]">
            <div className="space-y-4">
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

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="mb-1 block text-sm font-semibold text-slate-700">
                    Piezas esperadas
                  </label>

                  <input
                    type="number"
                    min="1"
                    value={form.piezasEsperadas}
                    onChange={(e) =>
                      actualizarCampo("piezasEsperadas", e.target.value)
                    }
                    className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm outline-none focus:border-[#d5b15f]"
                    placeholder="Ej. 22"
                  />
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
              </div>
            </div>

            <aside className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
              <div className="text-xs font-bold uppercase tracking-[0.18em] text-[#b08a2b]">
                Resumen
              </div>

              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Plataforma
                  </dt>
                  <dd className="mt-1 font-bold text-[#071f3a]">
                    {form.plataforma}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Piezas
                  </dt>
                  <dd className="mt-1 font-bold text-[#071f3a]">
                    {piezasPreview > 0 ? piezasPreview : "Pendiente"}
                  </dd>
                </div>

                <div>
                  <dt className="text-xs font-semibold uppercase text-slate-500">
                    Responsable
                  </dt>
                  <dd className="mt-1 font-bold text-[#071f3a]">
                    {form.responsable}
                  </dd>
                </div>
              </dl>
            </aside>
          </div>
        </form>
      </div>
    </ModalShell>
  );
}
