import type { ValidatePhraseResponse } from "../../interfaces/phrase-validation.interfaces";

export type PhraseFormFeedbackProps = {
  response: ValidatePhraseResponse | undefined;
  validateError: unknown;
  saveError: unknown;
  isSaveSuccess: boolean;
};
