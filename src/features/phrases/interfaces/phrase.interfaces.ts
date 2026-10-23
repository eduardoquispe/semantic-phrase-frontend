import type { PageMeta } from '../../../shared/interfaces/pagination.interface'

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

export type CreatePhraseResponse = Phrase

export interface PhraseListQuery {
  page?: number;
  limit?: number;
}

export interface PhraseListResponse {
  data: Phrase[];
  meta: PageMeta;
}
