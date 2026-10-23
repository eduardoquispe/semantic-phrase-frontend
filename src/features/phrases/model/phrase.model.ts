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
