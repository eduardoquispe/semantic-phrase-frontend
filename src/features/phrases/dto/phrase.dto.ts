import type { PhraseMatchType } from '../interfaces/phrase-match-type.enum'
import type { PageMeta } from "../../../shared/interfaces/pagination.interface";

export interface PhraseDTO {
  id: string;
  text: string;
  createdAt: string;
}

export interface CreatePhraseRequestDTO {
  text: string
  validationId: string
  confirmed?: boolean
}

export interface CreatePhraseResponseDTO {
  data: PhraseDTO
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

type VectorMatchDTO = {
  type: PhraseMatchType.VECTOR;
  phrase: MatchedPhraseDTO;
  similarityScore: number;
};

type TextualExactMatchDTO = {
  type: PhraseMatchType.TEXTUAL_EXACT;
  phrase: MatchedPhraseDTO;
  similarityScore: null;
};

export type PhraseMatchDTO = VectorMatchDTO | TextualExactMatchDTO;

export type ValidatePhraseResponseDataDTO = {
  validationId: string;
  expiresAt: string; // ISO 8601
  requiresConfirmation: boolean;
  match: PhraseMatchDTO | null;
};

export type ValidatePhraseResponseDTO = {
  data: ValidatePhraseResponseDataDTO;
};
