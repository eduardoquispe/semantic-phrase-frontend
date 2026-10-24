import type { ComponentPropsWithoutRef } from "react";
import { SpinnerIcon } from "../../../icons/spinner-icon";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "ordinary" | "save" | "delete" | "danger" | "icon-delete";
  loading?: boolean;
};

const variants = {
  ordinary:
    "rounded-xl border border-control-border px-5 font-bold text-brand enabled:hover:bg-control-hover focus-visible:outline-brand",
  save: "rounded-xl bg-brand px-5 font-bold text-white enabled:hover:bg-brand-hover focus-visible:outline-brand disabled:bg-disabled disabled:text-disabled-ink",
  delete:
    "rounded-lg px-2 font-semibold text-danger underline decoration-transparent underline-offset-4 enabled:hover:decoration-current focus-visible:outline-danger",
  "icon-delete":
    "rounded-lg p-2 text-danger enabled:hover:text-danger-ink focus-visible:outline-danger disabled:text-disabled-ink",
  danger:
    "rounded-xl border border-danger bg-danger px-5 font-bold text-white enabled:hover:bg-danger-ink enabled:hover:border-danger-ink focus-visible:outline-danger disabled:border-disabled disabled:bg-disabled disabled:text-disabled-ink",
};

export function Button({
  type = "button",
  variant = "ordinary",
  className = "",
  loading = false,
  disabled = false,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={`relative inline-flex min-h-11 items-center justify-center text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 cursor-pointer disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {loading && (
        <span className="absolute inset-0 flex items-center justify-center">
          <SpinnerIcon />
        </span>
      )}
      <span className={loading ? "invisible" : undefined}>{children}</span>
    </button>
  );
}
