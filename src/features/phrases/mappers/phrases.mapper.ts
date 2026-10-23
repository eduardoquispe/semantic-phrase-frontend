import { PhraseMatchType } from '../interfaces/phrase-match-type.enum'
import type {
  PhraseDTO,
  PhraseListQueryDTO,
  PhraseListResponseDTO,
  ValidatePhraseRequestDTO,
  ValidatePhraseResponseDTO,
} from "../data/phrases.dto";
import type {
  Phrase,
  PhraseListQuery,
  PhraseListResponse,
  ValidatePhraseRequest,
  ValidatePhraseResponse,
} from "../interfaces/phrase.interfaces";

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
  toValidatePhraseRequestDTO: (
    request: ValidatePhraseRequest,
  ): ValidatePhraseRequestDTO => ({
    text: request.text,
  }),
  toValidatePhraseResponse: (
    data: ValidatePhraseResponseDTO,
  ): ValidatePhraseResponse => {
    const sourceMatch = data.data.match;
    let match: ValidatePhraseResponse["data"]["match"] = null;

    if (sourceMatch) {
      const phrase = {
        id: sourceMatch.phrase.id,
        text: sourceMatch.phrase.text,
      };

      match =
        sourceMatch.type === PhraseMatchType.VECTOR
          ? {
              type: PhraseMatchType.VECTOR,
              phrase,
              similarityScore: sourceMatch.similarityScore,
            }
          : { type: PhraseMatchType.TEXTUAL_EXACT, phrase, similarityScore: null };
    }

    return {
      data: {
        validationId: data.data.validationId,
        expiresAt: data.data.expiresAt,
        requiresConfirmation: data.data.requiresConfirmation,
        match,
      },
    };
  },
};
