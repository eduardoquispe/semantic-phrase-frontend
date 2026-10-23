import { phraseData } from "../data/phrases.data";
import { phrasesMappers } from "../mappers/phrases.mapper";
import type {
  PhraseListQuery,
  PhraseListResponse,
} from "../model/phrase.model";

export const phraseService = {
  list: async (query: PhraseListQuery): Promise<PhraseListResponse> => {
    const queryDTO = phrasesMappers.toPhraseListQuery(query);
    const response = await phraseData.list(queryDTO);
    return phrasesMappers.toPhraseList(response);
  },
};
