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
  const { container } = render(<PhraseFormFeedback response={undefined} error={null} isSaveSuccess={false} />)
  expect(container).toBeEmptyDOMElement()
})

it('shows the validation result', () => {
  render(<PhraseFormFeedback response={response} error={null} isSaveSuccess={false} />)
  expect(screen.getByRole('status', { name: 'Frase validada' })).toBeInTheDocument()
})

it('shows save success instead of the previous validation', () => {
  render(<PhraseFormFeedback response={response} error={null} isSaveSuccess />)
  expect(screen.getByRole('status', { name: 'Frase guardada' })).toBeInTheDocument()
  expect(screen.queryByText('Frase validada')).not.toBeInTheDocument()
})

it('shows an error instead of success feedback', () => {
  render(<PhraseFormFeedback response={response} error={new Error('Network error')} isSaveSuccess />)
  expect(screen.getByRole('alert')).toHaveTextContent('Ocurrió un error. Inténtalo de nuevo.')
  expect(screen.queryByRole('status')).not.toBeInTheDocument()
})
