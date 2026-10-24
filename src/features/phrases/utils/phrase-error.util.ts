import { ApiErrorCode } from "../../../shared/interfaces/problem-details.interface";
import { getProblemDetails } from "../../../shared/utils/api-error.util";

export function isPhraseNotFoundError(error: unknown): boolean {
  return getProblemDetails(error)?.code === ApiErrorCode.PHRASE_NOT_FOUND;
}
