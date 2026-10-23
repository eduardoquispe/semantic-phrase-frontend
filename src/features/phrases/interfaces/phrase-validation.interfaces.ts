import type { PhraseMatchType } from "./phrase-match-type.enum";

export type ValidatePhraseRequest = {
  text: string;
};

export type MatchedPhrase = {
  id: string; // UUID
  text: string;
};

type VectorMatch = {
  type: PhraseMatchType.VECTOR;
  phrase: MatchedPhrase;
  similarityScore: number;
};

type TextualExactMatch = {
  type: PhraseMatchType.TEXTUAL_EXACT;
  phrase: MatchedPhrase;
  similarityScore: null;
};

export type PhraseMatch = VectorMatch | TextualExactMatch;

export type ValidatePhraseResponse = {
  validationId: string;
  expiresAt: string; // ISO 8601
  requiresConfirmation: boolean;
  match: PhraseMatch | null;
};
