import type { ComponentPropsWithoutRef } from "react";

type ButtonProps = ComponentPropsWithoutRef<"button"> & {
  variant?: "ordinary" | "save" | "delete";
};

const variants = {
  ordinary:
    "rounded-xl border border-control-border px-5 font-bold text-brand enabled:hover:bg-control-hover focus-visible:outline-brand",
  save: "rounded-xl bg-brand px-5 font-bold text-white enabled:hover:bg-brand-hover focus-visible:outline-brand disabled:bg-disabled disabled:text-disabled-ink",
  delete:
    "rounded-lg px-2 font-semibold text-danger underline decoration-transparent underline-offset-4 enabled:hover:decoration-current focus-visible:outline-danger",
};

export function Button({
  type = "button",
  variant = "ordinary",
  className = "",
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`inline-flex min-h-11 items-center justify-center text-sm transition-colors motion-reduce:transition-none focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
