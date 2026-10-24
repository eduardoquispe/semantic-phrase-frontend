import { Button } from "../button";
import { Modal } from "../modal";
import type { ConfirmModalProps } from "./confirm-modal.types";

export function ConfirmModal({
  isOpen,
  title,
  children,
  onConfirm,
  onCancel,
  confirmLabel = "Confirmar",
  cancelLabel = "Cancelar",
  isPending = false,
  error,
  confirmVariant = "save",
}: ConfirmModalProps) {
  return (
    <Modal isOpen={isOpen} title={title}>
      <div className="flex flex-col gap-4">
        {children && <div className="text-sm text-secondary">{children}</div>}
        {error && <p className="text-sm text-danger">{error}</p>}
        <div className="flex items-center justify-end gap-2">
          <Button variant="ordinary" disabled={isPending} onClick={onCancel}>
            {cancelLabel}
          </Button>
          <Button
            variant={confirmVariant}
            disabled={isPending}
            loading={isPending}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Modal>
  );
}
