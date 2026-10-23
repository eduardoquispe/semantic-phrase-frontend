import type { ReactNode } from "react";

export type FeedbackMessageVariant = "success" | "error" | "warning";

export type FeedbackMessageProps = {
  variant: FeedbackMessageVariant;
  title: string;
  badge?: ReactNode;
  description?: string;
  children?: ReactNode;
};
