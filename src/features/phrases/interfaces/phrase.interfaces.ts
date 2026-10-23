import type { PhraseMatchType } from './phrase-match-type.enum'
export interface ListPhrasesQuery {
  page?: number;
  limit?: number;
}

export interface Phrase {
  id: string;
  text: string;
  createdAt: string;
}

export interface CreatePhraseRequest {
  text: string
  validationId: string
  confirmed?: boolean
}

export interface CreatePhraseResponse {
  data: Phrase
}

export interface PageMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PhraseListQuery {
  page?: number;
  limit?: number;
}

export interface PhraseListResponse {
  data: Phrase[];
  meta: PageMeta;
}

export type ValidatePhraseRequest = {
  text: string;
};

export type MatchedPhrase = {
  id: string; // UUID
  text: string;
};

export type ValidatePhraseResponse = {
  data: {
    validationId: string;
    expiresAt: string; // ISO 8601
    requiresConfirmation: boolean;
    match:
      | null
      | {
          type: PhraseMatchType.VECTOR;
          phrase: MatchedPhrase;
          similarityScore: number;
        }
      | {
          type: PhraseMatchType.TEXTUAL_EXACT;
          phrase: MatchedPhrase;
          similarityScore: null;
        };
  };
};
