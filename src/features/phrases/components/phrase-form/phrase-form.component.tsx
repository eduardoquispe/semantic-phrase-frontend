import { zodResolver } from '@hookform/resolvers/zod'
import { useForm, useWatch } from 'react-hook-form'
import { Button } from '../../../../shared/components/ui/button'
import { Input } from '../../../../shared/components/ui/input'
import { phraseFormSchema } from './phrase-form.schema'
import type { PhraseFormValues } from './phrase-form.schema'
import { PhraseValidationFeedback } from '../phrase-validation-feedback'
import { useValidatePhrase } from '../../hooks/validate-phrase.hook'

export function PhraseForm() {
  const {
    register,
    control,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<PhraseFormValues>({
    resolver: zodResolver(phraseFormSchema),
    defaultValues: { text: '' },
    mode: 'onChange',
  })
  const {
    mutateAsync: validatePhrase,
    data: response,
    isPending,
    isError,
    reset,
  } = useValidatePhrase()
  const isValidating = isSubmitting || isPending

  const text = useWatch({ control, name: 'text' })

  const onSubmit = async (values: PhraseFormValues) => {
    if (isValidating) return

    reset()
    try {
      await validatePhrase({ text: values.text })
    } catch {
      // The mutation exposes the error through isError for inline feedback.
    }
  }

  return (
    <section
      aria-labelledby='compose-title'
      className='min-w-0 overflow-hidden rounded-2xl border border-border bg-white'
    >
      <div className='border-b border-divider px-5 py-4 sm:px-6 sm:py-5'>
        <h2 id='compose-title' className='text-lg font-bold tracking-[-0.02em]'>
          Nueva frase
        </h2>
        <p className='mt-1 text-sm leading-6 text-muted'>
          La validación revisa frases guardadas; no guarda la nueva frase.
        </p>
      </div>
      <form
        noValidate
        onSubmit={handleSubmit(onSubmit)}
        aria-busy={isValidating}
        className='px-5 py-5 sm:px-6 sm:py-6'
      >
        <label htmlFor='phrase' className='block text-sm font-semibold'>
          Frase en español
        </label>
        <Input
          {...register('text', { onChange: () => reset() })}
          id='phrase'
          type='text'
          autoComplete='off'
          placeholder='Escribe una frase corta'
          aria-invalid={Boolean(errors.text)}
          aria-describedby={
            errors.text ? 'phrase-help phrase-error' : 'phrase-help'
          }
          readOnly={isValidating}
          className='mt-2'
        />
        <div className='mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-xs text-caption'>
          <span id='phrase-help'>
            Una línea · De 1 a 280 caracteres · Al menos una palabra
          </span>
          <span className='tabular-nums'>
            {Array.from(text.trim()).length} / 280
          </span>
        </div>
        <div className='mt-2 min-h-5 text-sm text-danger'>
          {errors.text && (
            <p id='phrase-error' role='alert'>
              {errors.text.message}
            </p>
          )}
        </div>
        <div className='mt-4 flex flex-col-reverse gap-2 sm:flex-row sm:items-center'>
          <Button type='submit' disabled={isValidating}>
            <span className='inline-grid'>
              <span className='invisible col-start-1 row-start-1' aria-hidden='true'>
                Validando…
              </span>
              <span className='col-start-1 row-start-1' aria-live='polite'>
                {isValidating ? 'Validando…' : 'Validar'}
              </span>
            </span>
          </Button>
          <Button type='button' variant='save' disabled>
            Guardar
          </Button>
        </div>
      </form>
      {(response || isError) && (
        <div className='border-t border-divider px-5 py-4 sm:px-6 sm:py-5'>
          <PhraseValidationFeedback response={response} isError={isError} />
        </div>
      )}
    </section>
  )
}
