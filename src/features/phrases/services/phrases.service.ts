import { phraseData } from "../data/phrases.data";
import { phrasesMappers } from "../mappers/phrases.mapper";
import type {
  CreatePhraseRequest,
  CreatePhraseResponse,
  PhraseListQuery,
  PhraseListResponse,
  ValidatePhraseRequest,
  ValidatePhraseResponse,
} from "../interfaces/phrase.interfaces";

export const phraseService = {
  save: async (request: CreatePhraseRequest): Promise<CreatePhraseResponse> => {
    const response = await phraseData.save(request)
    return { data: phrasesMappers.toPhraseListItemData(response.data) }
  },
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
