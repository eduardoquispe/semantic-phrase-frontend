import axios from "axios";
import type {
  PhraseListResponseDTO,
  PhraseListQueryDTO,
  ValidatePhraseRequestDTO,
  ValidatePhraseResponseDTO,
} from "./phrases.dto";

export const phraseData = {
  list: async (query: PhraseListQueryDTO): Promise<PhraseListResponseDTO> => {
    const { data } = await axios.get<PhraseListResponseDTO>(
      "http://localhost:3000/api/v1/phrases",
      { params: query },
    );
    return data;
  },
  validate: async (
    input: ValidatePhraseRequestDTO,
  ): Promise<ValidatePhraseResponseDTO> => {
    const { data } = await axios.post<ValidatePhraseResponseDTO>(
      "http://localhost:3000/api/v1/phrase-validations",
      input,
    );
    return data;
  },
};
