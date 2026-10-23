import { phraseData } from "../data/phrases.data";
import {
  toPhraseList,
  toPhraseListItemData,
  toPhraseListQuery,
  toValidatePhraseRequestDTO,
  toValidatePhraseResponse,
} from "../mappers/phrases.mapper";
import type {
  CreatePhraseRequest,
  CreatePhraseResponse,
  PhraseListQuery,
  PhraseListResponse,
} from "../interfaces/phrase.interfaces";
import type {
  ValidatePhraseRequest,
  ValidatePhraseResponse,
} from "../interfaces/phrase-validation.interfaces";

export const phraseService = {
  save: async (request: CreatePhraseRequest): Promise<CreatePhraseResponse> => {
    const response = await phraseData.save(request);
    return toPhraseListItemData(response.data);
  },
  list: async (query: PhraseListQuery): Promise<PhraseListResponse> => {
    const queryDTO = toPhraseListQuery(query);
    const response = await phraseData.list(queryDTO);
    return toPhraseList(response);
  },

  validate: async (
    request: ValidatePhraseRequest,
  ): Promise<ValidatePhraseResponse> => {
    const requestDTO = toValidatePhraseRequestDTO(request);
    const response = await phraseData.validate(requestDTO);
    return toValidatePhraseResponse(response);
  },
};
