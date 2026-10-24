import { ConfirmModal } from "../../../../shared/components/ui/confirm-modal";
import type { PhraseDeleteModalProps } from "./phrase-delete-modal.types";

export function PhraseDeleteModal({
  phrase,
  isOpen,
  isPending,
  error,
  onConfirm,
  onCancel,
}: PhraseDeleteModalProps) {
  return (
    <ConfirmModal
      isOpen={isOpen}
      title={`¿Eliminar "${phrase?.text ?? ""}"?`}
      confirmLabel="Eliminar"
      confirmVariant="danger"
      isPending={isPending}
      error={error}
      onConfirm={onConfirm}
      onCancel={onCancel}
    >
      Esta acción no se puede deshacer.
    </ConfirmModal>
  );
}
