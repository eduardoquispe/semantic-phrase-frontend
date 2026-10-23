import { isAxiosError } from "axios";
import type { ProblemDetails } from "../interfaces/problem-details.interface";

export function getErrorMessage(error: unknown): string {
  const message = isAxiosError<ProblemDetails>(error)
    ? error.response?.data?.detail
    : undefined;

  return typeof message === "string" && message.trim()
    ? message
    : "Ocurrió un error. Inténtalo de nuevo.";
}
