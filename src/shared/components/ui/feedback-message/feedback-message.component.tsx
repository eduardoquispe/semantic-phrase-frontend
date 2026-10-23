import { useId } from "react";
import { Button } from "../button";
import type { FeedbackMessageProps } from "./feedback-message.types";
import "./feedback-message.css";

export function FeedbackMessage({
  variant,
  title,
  description,
  children,
  actions,
}: FeedbackMessageProps) {
  const titleId = useId();

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-labelledby={titleId}
      className={`feedback-message feedback-message--${variant} min-w-0 rounded-xl p-4 wrap-anywhere`}
    >
      <p id={titleId} className="text-sm font-bold">
        {title}
      </p>
      {description && <p className="mt-1 text-xs leading-5">{description}</p>}
      {children != null && <div className="mt-3">{children}</div>}
      {actions && actions.length > 0 && (
        <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {actions.map(({ label, onClick, emphasis = "secondary" }, index) => (
            <Button
              key={`${label}-${index}`}
              onClick={onClick}
              className={`feedback-message__action feedback-message__action--${emphasis} whitespace-normal py-2`}
            >
              {label}
            </Button>
          ))}
        </div>
      )}
    </div>
  );
}
