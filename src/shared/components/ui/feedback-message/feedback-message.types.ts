import type { ReactNode } from "react";

export type FeedbackMessageVariant = "success" | "error" | "warning";

export type FeedbackMessageAction = {
  label: string;
  onClick: () => void;
  emphasis?: "primary" | "secondary";
};

export type FeedbackMessageProps = {
  variant: FeedbackMessageVariant;
  title: string;
  description?: string;
  children?: ReactNode;
  actions?: FeedbackMessageAction[];
};
