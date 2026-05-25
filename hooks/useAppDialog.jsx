import { useCallback, useState } from "react";

import AppDialog from "../components/AppDialog";

export function useAppDialog() {
  const [dialog, setDialog] = useState(null);

  const notify = useCallback((options = {}) => {
    setDialog({
      kind: "alert",
      tone: options.tone || "info",
      title: options.title || options.titulo || "Aviso",
      message: options.message || options.mensaje || "",
      details: options.details || [],
      confirmLabel: options.confirmLabel || "Entendido",
    });
  }, []);

  const confirm = useCallback((options = {}) => {
    return new Promise((resolve) => {
      setDialog({
        kind: "confirm",
        tone: options.tone || "confirm",
        title: options.title || options.titulo || "Confirmar acción",
        message: options.message || options.mensaje || "",
        details: options.details || [],
        confirmLabel: options.confirmLabel || "Confirmar",
        cancelLabel: options.cancelLabel || "Cancelar",
        resolve,
      });
    });
  }, []);

  const closeDialog = useCallback(
    (result = false) => {
      if (dialog?.resolve) dialog.resolve(result);
      setDialog(null);
    },
    [dialog]
  );

  const Dialog = (
    <AppDialog
      dialog={dialog}
      onCancel={() => closeDialog(false)}
      onConfirm={() => closeDialog(true)}
    />
  );

  return {
    Dialog,
    confirm,
    notify,
  };
}
