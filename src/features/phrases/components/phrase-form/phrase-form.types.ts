import type { PhraseFormValues } from './phrase-form.schema'

export type PhraseFormProps = {
  onValidate?: (values: PhraseFormValues) => void | Promise<void>
}
