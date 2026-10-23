// @vitest-environment jsdom
import { act, cleanup, render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { PhraseForm } from './phrase-form.component'

afterEach(cleanup)

describe('PhraseForm', () => {
  it('shows schema errors and focuses the invalid input', async () => {
    const user = userEvent.setup()
    const onValidate = vi.fn()
    render(<PhraseForm onValidate={onValidate} />)

    await user.click(screen.getByRole('button', { name: 'Validar' }))

    expect((await screen.findByRole('alert')).textContent).toBe('Ingresa una frase.')
    expect(screen.getByLabelText('Frase en español').getAttribute('aria-invalid')).toBe('true')
    expect(document.activeElement).toBe(screen.getByLabelText('Frase en español'))
    expect(onValidate).not.toHaveBeenCalled()
  })

  it('counts trimmed characters and submits the schema output with Enter', async () => {
    const user = userEvent.setup()
    const onValidate = vi.fn()
    render(<PhraseForm onValidate={onValidate} />)

    await user.type(screen.getByLabelText('Frase en español'), '  Hola mundo  ')
    expect(screen.getByText('10 / 280')).toBeTruthy()
    await user.keyboard('{Enter}')

    await waitFor(() => expect(onValidate).toHaveBeenCalledExactlyOnceWith({ text: 'Hola mundo' }))
    expect((screen.getByRole('button', { name: 'Guardar' }) as HTMLButtonElement).disabled).toBe(true)
  })

  it('rejects invalid characters and prevents another submit while pending', async () => {
    const user = userEvent.setup()
    let finishValidation!: () => void
    const onValidate = vi.fn(() => new Promise<void>(resolve => { finishValidation = resolve }))
    render(<PhraseForm onValidate={onValidate} />)
    const input = screen.getByLabelText('Frase en español')
    const submit = screen.getByRole('button', { name: 'Validar' }) as HTMLButtonElement

    await user.type(input, 'Hola!')
    await user.click(submit)
    expect((await screen.findByRole('alert')).textContent).toContain('Usa solo letras')
    expect(onValidate).not.toHaveBeenCalled()

    await user.clear(input)
    await user.type(input, 'Hola')
    await user.click(submit)
    await waitFor(() => expect(submit.disabled).toBe(true))
    await user.click(submit)
    expect(onValidate).toHaveBeenCalledTimes(1)
    expect((input as HTMLInputElement).value).toBe('Hola')

    await act(async () => { finishValidation() })
    await waitFor(() => expect(submit.disabled).toBe(false))
  })
})
