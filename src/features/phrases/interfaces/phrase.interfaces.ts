export interface ListPhrasesQuery {
  page?: number;
  limit?: number;
}

export interface Phrase {
  id: string;
  text: string;
  createdAt: string;
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
          type: "vector";
          phrase: MatchedPhrase;
          similarityScore: number;
        }
      | {
          type: "textual_exact";
          phrase: MatchedPhrase;
          similarityScore: null;
        };
  };
};
