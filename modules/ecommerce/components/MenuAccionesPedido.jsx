import { Copy, Edit3, Eye, MoreVertical, Trash2 } from "lucide-react";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

const MENU_WIDTH = 240;
const MENU_HEIGHT = 220;
const MARGIN = 12;

function MenuAccionesPedido({
  pedido,
  menuAbiertoId,
  setMenuAbiertoId,
  onEditarPedido = () => {},
  onDuplicarPedido = () => {},
  onEliminarPedidoTemporal = () => {},
  onVerDetalle = () => {},
}) {
  const botonRef = useRef(null);
  const menuRef = useRef(null);

  const [posicion, setPosicion] = useState({
    top: 0,
    left: 0,
  });

  const idPedido = pedido?.id || pedido?.pedido;
  const abierto = menuAbiertoId === idPedido;

  const calcularPosicion = () => {
    if (!botonRef.current) return;

    const rect = botonRef.current.getBoundingClientRect();

    let top = rect.bottom + MARGIN;
    let left = rect.right - MENU_WIDTH;

    const noCabeAbajo = top + MENU_HEIGHT > window.innerHeight - MARGIN;
    const noCabeDerecha = left + MENU_WIDTH > window.innerWidth - MARGIN;
    const noCabeIzquierda = left < MARGIN;

    if (noCabeAbajo) {
      top = rect.top - MENU_HEIGHT - MARGIN;
    }

    if (noCabeDerecha) {
      left = window.innerWidth - MENU_WIDTH - MARGIN;
    }

    if (noCabeIzquierda) {
      left = MARGIN;
    }

    if (top < MARGIN) {
      top = MARGIN;
    }

    setPosicion({
      top,
      left,
    });
  };

  const cerrarMenu = () => {
    setMenuAbiertoId(null);
  };

  const abrirMenu = (e) => {
    e.preventDefault();
    e.stopPropagation();

    if (abierto) {
      cerrarMenu();
      return;
    }

    calcularPosicion();
    setMenuAbiertoId(idPedido);
  };

  useLayoutEffect(() => {
    if (!abierto) return;
    calcularPosicion();
  }, [abierto]);

  useEffect(() => {
    if (!abierto) return;

    const cerrarPorClickFuera = (e) => {
      const clickEnBoton = botonRef.current?.contains(e.target);
      const clickEnMenu = menuRef.current?.contains(e.target);

      if (!clickEnBoton && !clickEnMenu) {
        cerrarMenu();
      }
    };

    const cerrarPorEscape = (e) => {
      if (e.key === "Escape") {
        cerrarMenu();
      }
    };

    const reposicionar = () => {
      calcularPosicion();
    };

    document.addEventListener("mousedown", cerrarPorClickFuera);
    document.addEventListener("keydown", cerrarPorEscape);
    window.addEventListener("resize", reposicionar);
    window.addEventListener("scroll", reposicionar, true);

    return () => {
      document.removeEventListener("mousedown", cerrarPorClickFuera);
      document.removeEventListener("keydown", cerrarPorEscape);
      window.removeEventListener("resize", reposicionar);
      window.removeEventListener("scroll", reposicionar, true);
    };
  }, [abierto]);

  const ejecutar = (e, accion) => {
    e.preventDefault();
    e.stopPropagation();

    accion(pedido);
    cerrarMenu();
  };

  return (
    <>
      <button
        ref={botonRef}
        type="button"
        onClick={abrirMenu}
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 shadow-sm transition hover:bg-slate-50 hover:text-[#071f3a]"
        title="Acciones"
      >
        <MoreVertical className="h-5 w-5" />
      </button>

      {abierto &&
        createPortal(
          <div
            ref={menuRef}
            style={{
              position: "fixed",
              top: posicion.top,
              left: posicion.left,
              width: MENU_WIDTH,
              zIndex: 99999,
            }}
            className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl"
          >
            <button
              type="button"
              onClick={(e) => ejecutar(e, onVerDetalle)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Eye className="h-4 w-4 text-slate-500" />
              Ver detalle
            </button>

            <button
              type="button"
              onClick={(e) => ejecutar(e, onEditarPedido)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Edit3 className="h-4 w-4 text-slate-500" />
              Editar pedido
            </button>

            <button
              type="button"
              onClick={(e) => ejecutar(e, onDuplicarPedido)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              <Copy className="h-4 w-4 text-slate-500" />
              Duplicar
            </button>

            <div className="border-t border-slate-100" />

            <button
              type="button"
              onClick={(e) => ejecutar(e, onEliminarPedidoTemporal)}
              className="flex w-full items-center gap-3 px-4 py-3 text-left text-sm font-semibold text-rose-700 transition hover:bg-rose-50"
            >
              <Trash2 className="h-4 w-4 text-rose-500" />
              Eliminar temporal
            </button>
          </div>,
          document.body
        )}
    </>
  );
}

export default MenuAccionesPedido;