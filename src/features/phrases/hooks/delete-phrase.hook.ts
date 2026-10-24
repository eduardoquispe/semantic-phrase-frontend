import { useMutation, useQueryClient } from "@tanstack/react-query";
import { getErrorMessage } from "../../../shared/utils/api-error.util";
import { phraseService } from "../services/phrases.service";
import { isPhraseNotFoundError } from "../utils/phrase-error.util";

export interface UseDeletePhraseOptions {
  onDeleted?: () => void;
}

export const useDeletePhrase = (
  phraseId: string,
  options?: UseDeletePhraseOptions,
) => {
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: () => phraseService.remove(phraseId),
    retry: false,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["phrases"] });
      options?.onDeleted?.();
    },
    onError: (error) => {
      if (isPhraseNotFoundError(error)) {
        queryClient.invalidateQueries({ queryKey: ["phrases"] });
      }
    },
  });

  const confirm = () => {
    if (mutation.isPending) return;
    mutation.mutate();
  };

  return {
    isPending: mutation.isPending,
    error: mutation.isError ? getErrorMessage(mutation.error) : undefined,
    confirm,
    reset: mutation.reset,
  };
};
