import { useEffect, useRef } from "react";
import type { ModalProps } from "./modal.types";

export function Modal({ isOpen, title, children }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (isOpen && !dialog.open) {
      if (dialog.showModal) dialog.showModal();
      else dialog.setAttribute("open", "");
    }
    if (!isOpen && dialog.open) {
      if (dialog.close) dialog.close();
      else dialog.removeAttribute("open");
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      aria-labelledby="modal-title"
      className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-white p-6 shadow-lg backdrop:bg-black/40"
      onCancel={(event) => event.preventDefault()}
    >
      <h2 id="modal-title" className="text-lg font-semibold text-ink">
        {title}
      </h2>
      <div className="mt-2">{children}</div>
    </dialog>
  );
}
