import { PhraseMatchType } from "../../interfaces/phrase-match-type.enum";
import type { PhraseMatch } from "../../interfaces/phrase-validation.interfaces";
import { FeedbackMessage } from "../../../../shared/components/ui/feedback-message";
import { PHRASE_MATCH_TITLES } from "./phrase-validation-feedback.constants";
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
        title="No encontramos una posible coincidencia."
        description="Puedes guardar la frase si deseas añadirla a la lista."
      />
    );
  }

  return (
    <FeedbackMessage
      variant="warning"
      title={
        match
          ? PHRASE_MATCH_TITLES[match.type]
          : PHRASE_MATCH_TITLES[PhraseMatchType.VECTOR]
      }
      badge={match && <MatchBadge match={match} />}
    >
      {match && <MatchDetails match={match} />}
    </FeedbackMessage>
  );
}

function MatchBadge({ match }: { match: PhraseMatch }) {
  return match.type === PhraseMatchType.VECTOR ? (
    <span className="rounded-full bg-warning-badge px-2.5 py-1 text-xs font-bold text-warning-action tabular-nums">
      Similitud semántica · {Math.round(match.similarityScore * 100)} %
    </span>
  ) : (
    <span className="rounded-full bg-warning-badge px-2.5 py-1 text-xs font-bold tabular-nums">
      Coincidencia textual · 100 %
    </span>
  );
}

function MatchDetails({ match }: { match: PhraseMatch }) {
  const isSimilarityMatch = match.type === PhraseMatchType.VECTOR;

  return (
    <>
      <p className="text-xs font-bold uppercase tracking-[0.08em] text-warning-label">
        Frase existente
      </p>
      <p
        className={`mt-1 text-lg leading-snug font-medium ${isSimilarityMatch ? "tracking-[-0.015em]" : ""}`}
      >
        “{match.phrase.text}”
      </p>
      <p className="mt-2 text-xs leading-5 text-warning-muted">
        {isSimilarityMatch
          ? "El puntaje indica similitud; tú decides si es un duplicado."
          : "Comparación textual, sin intervención del modelo de IA."}
      </p>
    </>
  );
}
