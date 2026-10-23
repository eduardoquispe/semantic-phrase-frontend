import { useId } from "react";
import type { FeedbackMessageProps } from "./feedback-message.types";
import "./feedback-message.css";

export function FeedbackMessage({
  variant,
  title,
  badge,
  description,
  children,
}: FeedbackMessageProps) {
  const titleId = useId();

  return (
    <div
      role={variant === "error" ? "alert" : "status"}
      aria-labelledby={titleId}
      className={`feedback-message feedback-message--${variant} min-w-0 rounded-xl p-4 wrap-anywhere`}
    >
      {badge ? (
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p id={titleId} className="text-sm font-bold">
            {title}
          </p>
          {badge}
        </div>
      ) : (
        <p id={titleId} className="text-sm font-bold">
          {title}
        </p>
      )}
      {description && <p className="mt-1 text-xs leading-5">{description}</p>}
      {children != null && <div className="mt-3">{children}</div>}
    </div>
  );
}
