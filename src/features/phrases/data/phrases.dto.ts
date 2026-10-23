import type { PageMeta } from "../model/phrase.model";

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
