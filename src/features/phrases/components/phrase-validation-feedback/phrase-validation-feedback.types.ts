import type { ValidatePhraseResponse } from "../../interfaces/phrase.interfaces";

export type PhraseValidationFeedbackProps = {
  response: ValidatePhraseResponse | undefined;
  isError: boolean;
};
