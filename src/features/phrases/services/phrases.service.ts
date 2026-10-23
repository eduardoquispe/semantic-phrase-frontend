import { phraseData } from "../data/phrases.data";
import { phrasesMappers } from "../mappers/phrases.mapper";
import type {
  PhraseListQuery,
  PhraseListResponse,
  ValidatePhraseRequest,
  ValidatePhraseResponse,
} from "../interfaces/phrase.interfaces";

export const phraseService = {
  list: async (query: PhraseListQuery): Promise<PhraseListResponse> => {
    const queryDTO = phrasesMappers.toPhraseListQuery(query);
    const response = await phraseData.list(queryDTO);
    return phrasesMappers.toPhraseList(response);
  },

  validate: async (
    request: ValidatePhraseRequest,
  ): Promise<ValidatePhraseResponse> => {
    const requestDTO = phrasesMappers.toValidatePhraseRequestDTO(request);
    const response = await phraseData.validate(requestDTO);
    return phrasesMappers.toValidatePhraseResponse(response);
  },
};
