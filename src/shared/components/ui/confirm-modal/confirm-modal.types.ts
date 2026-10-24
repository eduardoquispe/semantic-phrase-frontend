import type { ReactNode } from "react";

export type ConfirmModalProps = {
  isOpen: boolean;
  title: string;
  children?: ReactNode;
  onConfirm: () => void;
  onCancel: () => void;
  confirmLabel?: string;
  cancelLabel?: string;
  isPending?: boolean;
  error?: string;
  confirmVariant?: "save" | "danger";
};
