import { PhraseMatchType } from "../../interfaces/phrase-match-type.enum";
import { FeedbackMessage } from "../../../../shared/components/ui/feedback-message";
import type { PhraseValidationFeedbackProps } from "./phrase-validation-feedback.types";

export function PhraseValidationFeedback({
  response,
}: PhraseValidationFeedbackProps) {
  if (!response) return null;

  const { requiresConfirmation, match } = response;

  if (!requiresConfirmation) {
    return (
      <FeedbackMessage
        variant="success"
        title="Frase validada"
        description="No se encontró ninguna coincidencia."
      />
    );
  }

  return (
    <FeedbackMessage
      variant="warning"
      title={
        match?.type === PhraseMatchType.TEXTUAL_EXACT
          ? "Coincidencia textual exacta"
          : "Posible coincidencia semántica"
      }
      description="Se requiere tu confirmación antes de guardar. La frase todavía no se guardó."
    >
      {match && (
        <>
          {match.type === PhraseMatchType.VECTOR && (
            <p className="inline-block rounded-full bg-warning-badge px-2.5 py-1 text-xs font-bold text-warning-action tabular-nums">
              Similitud semántica · {Math.round(match.similarityScore * 100)} %
            </p>
          )}
          <p className="mt-3 text-xs font-bold">Frase existente</p>
          <p className="mt-1 text-lg leading-snug font-medium tracking-[-0.015em]">
            “{match.phrase.text}”
          </p>
          {match.type === PhraseMatchType.VECTOR && (
            <p className="mt-2 text-xs leading-5">
              El puntaje indica similitud; tú decides si es un duplicado.
            </p>
          )}
        </>
      )}
    </FeedbackMessage>
  );
}
