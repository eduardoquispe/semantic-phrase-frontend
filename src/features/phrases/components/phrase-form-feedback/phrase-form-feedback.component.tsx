import { FeedbackMessage } from "../../../../shared/components/ui/feedback-message";
import { getErrorMessage } from "../../../../shared/utils/api-error.util";
import { PhraseValidationFeedback } from "../phrase-validation-feedback";
import type { PhraseFormFeedbackProps } from "./phrase-form-feedback.types";

export function PhraseFormFeedback({
  response,
  error,
  isSaveSuccess,
}: PhraseFormFeedbackProps) {
  if (!response && !error && !isSaveSuccess) return null;

  return (
    <div className="border-t border-divider px-5 py-4 sm:px-6 sm:py-5">
      {error ? (
        <FeedbackMessage variant="error" title={getErrorMessage(error)} />
      ) : isSaveSuccess ? (
        <FeedbackMessage variant="success" title="Frase guardada" />
      ) : (
        <PhraseValidationFeedback response={response} />
      )}
    </div>
  );
}
