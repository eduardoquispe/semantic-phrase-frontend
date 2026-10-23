import { useQuery } from "@tanstack/react-query";
import { phraseService } from "../services/phrases.service";
import type { PhraseListQuery } from "../interfaces/phrase.interfaces";

export const usePhrasesList = (query: PhraseListQuery) => {
  const { page = 1, limit = 20 } = query;

  return useQuery({
    queryKey: ["phrases", { page, limit }],
    queryFn: () => phraseService.list({ page, limit }),
  });
};
