import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import type { ValidatePhraseResponse } from '../../interfaces/phrase-validation.interfaces'
import { PhraseFormFeedback } from './phrase-form-feedback.component'

const response: ValidatePhraseResponse = {
  validationId: 'validation-id',
  expiresAt: '2026-10-22T19:15:00Z',
  requiresConfirmation: false,
  match: null,
}

it('renders nothing before a result', () => {
  const { container } = render(
    <PhraseFormFeedback
      response={undefined}
      validateError={null}
      saveError={null}
      isSaveSuccess={false}
    />,
  )
  expect(container).toBeEmptyDOMElement()
})

it('shows the validation result', () => {
  render(
    <PhraseFormFeedback
      response={response}
      validateError={null}
      saveError={null}
      isSaveSuccess={false}
    />,
  )
  expect(
    screen.getByRole('status', { name: 'No encontramos una posible coincidencia.' }),
  ).toBeInTheDocument()
})

it('shows save success instead of the previous validation', () => {
  render(
    <PhraseFormFeedback
      response={response}
      validateError={null}
      saveError={null}
      isSaveSuccess
    />,
  )
  expect(screen.getByRole('status', { name: 'Frase guardada' })).toBeInTheDocument()
  expect(screen.queryByText('No encontramos una posible coincidencia.')).not.toBeInTheDocument()
})

it('shows a validate error as a message, with no action button', () => {
  render(
    <PhraseFormFeedback
      response={undefined}
      validateError={new Error('Network error')}
      saveError={null}
      isSaveSuccess={false}
    />,
  )
  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent('Ocurrió un error. Inténtalo de nuevo.')
  expect(alert).toHaveTextContent('Tu texto sigue aquí. Intenta validarlo de nuevo.')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})

it('shows a save error as a message, taking priority over a stale validate error', () => {
  render(
    <PhraseFormFeedback
      response={response}
      validateError={new Error('stale')}
      saveError={new Error('Network error')}
      isSaveSuccess={false}
    />,
  )
  const alert = screen.getByRole('alert')
  expect(alert).toHaveTextContent('Ocurrió un error. Inténtalo de nuevo.')
  expect(alert).toHaveTextContent('Tu texto se conserva. Vuelve a intentar el guardado.')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
  expect(screen.queryByRole('button')).not.toBeInTheDocument()
})
