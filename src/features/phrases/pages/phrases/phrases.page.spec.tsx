import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { phraseService } from '../../services/phrases.service'
import { PhrasesPage } from './phrases.page'

vi.mock('../../services/phrases.service', () => ({
  phraseService: { list: vi.fn(), validate: vi.fn(), save: vi.fn() },
}))

const phrase = { id: 'phrase-id', text: 'Hola mundo', createdAt: '22/10/2026' }
const emptyList = {
  data: [],
  meta: { page: 1, limit: 20, total: 0, totalPages: 0 },
}
const populatedList = {
  data: [phrase],
  meta: { page: 1, limit: 20, total: 1, totalPages: 1 },
}

function renderPage() {
  const client = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  })

  return render(
    <QueryClientProvider client={client}>
      <PhrasesPage />
    </QueryClientProvider>,
  )
}

beforeEach(() => {
  vi.resetAllMocks()
  vi.mocked(phraseService.list).mockResolvedValue(emptyList)
})

describe('PhrasesPage', () => {
  it('shows the page heading, form and saved phrases', async () => {
    vi.mocked(phraseService.list).mockResolvedValue(populatedList)
    renderPage()

    expect(screen.getByRole('heading', { level: 1, name: 'Cada idea, una frase.' }))
      .toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Nueva frase' })).toBeInTheDocument()
    expect(screen.getByLabelText('Frase en español')).toBeInTheDocument()
    const list = screen.getByRole('region', { name: 'Frases guardadas' })
    expect(await within(list).findByText('“Hola mundo”')).toBeInTheDocument()
    expect(phraseService.list).toHaveBeenCalledWith({ page: 1, limit: 20 })
  })

  it('shows an empty list and keeps the form available', async () => {
    renderPage()

    expect(await screen.findByText('0 frases')).toBeInTheDocument()
    expect(screen.getByRole('list')).toBeEmptyDOMElement()
    expect(screen.getByRole('button', { name: 'Validar' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Guardar' })).toBeDisabled()
    expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
  })

  it('refreshes the list after validating and saving a phrase', async () => {
    const user = userEvent.setup()
    vi.mocked(phraseService.list)
      .mockResolvedValueOnce(emptyList)
      .mockResolvedValue(populatedList)
    vi.mocked(phraseService.validate).mockResolvedValue({
      data: {
        validationId: 'validation-id',
        expiresAt: '2026-10-22T19:15:00Z',
        requiresConfirmation: false,
        match: null,
      },
    })
    vi.mocked(phraseService.save).mockResolvedValue({ data: phrase })
    renderPage()
    await screen.findByText('0 frases')

    const input = screen.getByLabelText('Frase en español')
    await user.type(input, phrase.text)
    await user.click(screen.getByRole('button', { name: 'Validar' }))
    await screen.findByText('Frase validada')
    expect(phraseService.validate).toHaveBeenCalledExactlyOnceWith({ text: phrase.text })
    expect(phraseService.save).not.toHaveBeenCalled()
    await user.click(screen.getByRole('button', { name: 'Guardar' }))

    expect(await screen.findByText('Frase guardada')).toBeInTheDocument()
    expect(await screen.findByText('“Hola mundo”')).toBeInTheDocument()
    expect(screen.getByText('1 frases')).toBeInTheDocument()
    expect(input).toHaveValue('')
    expect(phraseService.save).toHaveBeenCalledExactlyOnceWith({
      text: phrase.text,
      validationId: 'validation-id',
    })
  })
})
