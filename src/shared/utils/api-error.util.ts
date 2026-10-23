import { isAxiosError } from "axios";
import {
  ApiErrorCode,
  type ProblemDetails,
} from "../interfaces/problem-details.interface";

export function getProblemDetails(error: unknown): ProblemDetails | undefined {
  return isAxiosError<ProblemDetails>(error) ? error.response?.data : undefined;
}

export function getErrorMessage(error: unknown): string {
  const message = getProblemDetails(error)?.detail;

  return typeof message === "string" && message.trim()
    ? message
    : "Ocurrió un error. Inténtalo de nuevo.";
}

export function getFieldErrorMessage(
  error: unknown,
  field: string,
): string | undefined {
  const problemDetails = getProblemDetails(error);

  if (problemDetails?.code !== ApiErrorCode.VALIDATION_ERROR) return undefined;

  return problemDetails.errors?.find((fieldError) => fieldError.field === field)
    ?.messages[0];
}
