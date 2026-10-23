import type { ValidatePhraseResponse } from '../../interfaces/phrase-validation.interfaces'

export type PhraseFormFeedbackProps = {
  response: ValidatePhraseResponse | undefined
  error: unknown
  isSaveSuccess: boolean
}
