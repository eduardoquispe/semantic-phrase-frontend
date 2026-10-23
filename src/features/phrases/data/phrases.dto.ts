import type { PageMeta } from "../interfaces/phrase.interfaces";

export interface PhraseDTO {
  id: string;
  text: string;
  createdAt: string;
}

export interface PhraseListQueryDTO {
  page?: number;
  limit?: number;
}

export interface PhraseListResponseDTO {
  data: PhraseDTO[];
  meta: PageMeta;
}

export interface ValidatePhraseRequestDTO {
  text: string;
}

type MatchedPhraseDTO = {
  id: string; // UUID
  text: string;
};

export type ValidatePhraseResponseDTO = {
  data: {
    validationId: string;
    expiresAt: string; // ISO 8601
    requiresConfirmation: boolean;
    match:
      | null
      | {
          type: "vector";
          phrase: MatchedPhraseDTO;
          similarityScore: number;
        }
      | {
          type: "textual_exact";
          phrase: MatchedPhraseDTO;
          similarityScore: null;
        };
  };
};
