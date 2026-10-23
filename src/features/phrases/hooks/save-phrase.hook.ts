import { useMutation, useQueryClient } from '@tanstack/react-query'
import { phraseService } from '../services/phrases.service'
import type { CreatePhraseRequest } from '../interfaces/phrase.interfaces'

export const useSavePhrase = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (request: CreatePhraseRequest) => phraseService.save(request),
    retry: false,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['phrases'] }),
  })
}
