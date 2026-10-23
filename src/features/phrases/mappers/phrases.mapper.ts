import type {
  PhraseDTO,
  PhraseListQueryDTO,
  PhraseListResponseDTO,
} from "../data/phrases.dto";
import type {
  Phrase,
  PhraseListQuery,
  PhraseListResponse,
} from "../model/phrase.model";

export const phrasesMappers = {
  toPhraseListItemData: (phrase: PhraseDTO): Phrase => ({
    id: phrase.id,
    text: phrase.text,
    createdAt: new Date(phrase.createdAt).toLocaleDateString(),
  }),
  toPhraseList: (response: PhraseListResponseDTO): PhraseListResponse => ({
    data: response.data.map(phrasesMappers.toPhraseListItemData),
    meta: response.meta,
  }),
  toPhraseListQuery: (query: PhraseListQuery): PhraseListQueryDTO => ({
    page: query.page,
    limit: query.limit,
  }),
};
