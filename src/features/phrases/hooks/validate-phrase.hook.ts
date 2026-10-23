import { useMutation } from "@tanstack/react-query";
import { phraseService } from "../services/phrases.service";
import type { ValidatePhraseRequest } from "../interfaces/phrase.interfaces";

export const useValidatePhrase = () => {
  return useMutation({
    retry: false,
    mutationFn: (request: ValidatePhraseRequest) =>
      phraseService.validate(request),
  });
};
