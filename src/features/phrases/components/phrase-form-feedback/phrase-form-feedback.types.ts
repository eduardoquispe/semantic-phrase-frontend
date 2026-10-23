import type { ValidatePhraseResponse } from '../../interfaces/phrase.interfaces'

export type PhraseFormFeedbackProps = {
  response: ValidatePhraseResponse | undefined
  error: unknown
  isSaveSuccess: boolean
}
