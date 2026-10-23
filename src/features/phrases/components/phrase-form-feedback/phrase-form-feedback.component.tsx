import { FeedbackMessage } from "../../../../shared/components/ui/feedback-message";
import { getErrorMessage } from "../../../../shared/utils/api-error.util";
import { PhraseValidationFeedback } from "../phrase-validation-feedback";
import type { PhraseFormFeedbackProps } from "./phrase-form-feedback.types";

export function PhraseFormFeedback({
  response,
  validateError,
  saveError,
  isSaveSuccess,
}: PhraseFormFeedbackProps) {
  if (!response && !validateError && !saveError && !isSaveSuccess) return null;

  return (
    <div className="border-t border-divider px-5 py-4 sm:px-6 sm:py-5">
      {saveError ? (
        <FeedbackMessage
          variant="error"
          title={getErrorMessage(saveError)}
          description="Tu texto se conserva. Vuelve a intentar el guardado."
        />
      ) : validateError ? (
        <FeedbackMessage
          variant="error"
          title={getErrorMessage(validateError)}
          description="Tu texto sigue aquí. Intenta validarlo de nuevo."
        />
      ) : isSaveSuccess ? (
        <FeedbackMessage
          variant="success"
          title="Frase guardada"
          description="Ya aparece al principio de la lista compartida."
        />
      ) : (
        <PhraseValidationFeedback response={response} />
      )}
    </div>
  );
}
