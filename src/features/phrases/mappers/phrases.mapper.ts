import { PhraseMatchType } from "../interfaces/phrase-match-type.enum";
import type {
  PhraseDTO,
  PhraseListQueryDTO,
  PhraseListResponseDTO,
  ValidatePhraseRequestDTO,
  ValidatePhraseResponseDTO,
} from "../dto/phrase.dto";
import type {
  Phrase,
  PhraseListQuery,
  PhraseListResponse,
} from "../interfaces/phrase.interfaces";
import type {
  PhraseMatch,
  ValidatePhraseRequest,
  ValidatePhraseResponse,
} from "../interfaces/phrase-validation.interfaces";

const toPhraseMatch = (
  sourceMatch: ValidatePhraseResponseDTO["data"]["match"],
): PhraseMatch | null => {
  if (!sourceMatch) return null;

  const phrase = {
    id: sourceMatch.phrase.id,
    text: sourceMatch.phrase.text,
  };

  if (sourceMatch.type === PhraseMatchType.VECTOR) {
    return {
      type: PhraseMatchType.VECTOR,
      phrase,
      similarityScore: sourceMatch.similarityScore,
    };
  }

  return {
    type: PhraseMatchType.TEXTUAL_EXACT,
    phrase,
    similarityScore: null,
  };
};

export const toPhraseListItemData = (phrase: PhraseDTO): Phrase => ({
  id: phrase.id,
  text: phrase.text,
  createdAt: new Date(phrase.createdAt).toLocaleDateString(),
});

export const toPhraseList = (
  response: PhraseListResponseDTO,
): PhraseListResponse => ({
  data: response.data.map(toPhraseListItemData),
  meta: response.meta,
});

export const toPhraseListQuery = (
  query: PhraseListQuery,
): PhraseListQueryDTO => ({
  page: query.page,
  limit: query.limit,
});

export const toValidatePhraseRequestDTO = (
  request: ValidatePhraseRequest,
): ValidatePhraseRequestDTO => ({
  text: request.text,
});

export const toValidatePhraseResponse = (
  data: ValidatePhraseResponseDTO,
): ValidatePhraseResponse => ({
  validationId: data.data.validationId,
  expiresAt: data.data.expiresAt,
  requiresConfirmation: data.data.requiresConfirmation,
  match: toPhraseMatch(data.data.match),
});
