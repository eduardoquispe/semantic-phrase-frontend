import { httpClient } from "../../../shared/api/http-client";
import type {
  CreatePhraseRequestDTO,
  CreatePhraseResponseDTO,
  PhraseListResponseDTO,
  PhraseListQueryDTO,
  ValidatePhraseRequestDTO,
  ValidatePhraseResponseDTO,
} from "./phrases.dto";

export const phraseData = {
  save: async (
    input: CreatePhraseRequestDTO,
  ): Promise<CreatePhraseResponseDTO> => {
    const { data } = await httpClient.post<CreatePhraseResponseDTO>(
      "/v1/phrases",
      input,
    );
    return data;
  },
  list: async (query: PhraseListQueryDTO): Promise<PhraseListResponseDTO> => {
    const { data } = await httpClient.get<PhraseListResponseDTO>(
      "/v1/phrases",
      {
        params: query,
      },
    );
    return data;
  },
  validate: async (
    input: ValidatePhraseRequestDTO,
  ): Promise<ValidatePhraseResponseDTO> => {
    const { data } = await httpClient.post<ValidatePhraseResponseDTO>(
      "/v1/phrase-validations",
      input,
    );
    return data;
  },
};
