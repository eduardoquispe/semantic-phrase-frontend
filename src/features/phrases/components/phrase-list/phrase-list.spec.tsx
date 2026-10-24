import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import type { PropsWithChildren, ReactElement } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { phraseService } from '../../services/phrases.service'
import { PhraseList } from './phrase-list.component'

const { usePhrasesList } = vi.hoisted(() => ({ usePhrasesList: vi.fn() }))
vi.mock('../../hooks/phrases-list.hook', () => ({ usePhrasesList }))
vi.mock('../../services/phrases.service', () => ({
  phraseService: { remove: vi.fn() },
}))

function axiosErrorWith(data: unknown) {
  return { isAxiosError: true, response: { data } }
}

beforeEach(() => vi.resetAllMocks())

function renderWithClient(ui: ReactElement) {
  const client = new QueryClient()
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return render(ui, { wrapper: Wrapper })
}

it('shows the returned phrases and total', () => {
  usePhrasesList.mockReturnValue({
    data: {
      data: [
        { id: '1', text: 'Hola mundo', createdAt: '22/10/2026' },
        { id: '2', text: 'Buenos días', createdAt: '21/10/2026' },
      ],
      meta: { page: 1, totalPages: 1, total: 2, limit: 20 },
    },
  })
  renderWithClient(<PhraseList />)

  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText('“Hola mundo”')).toBeInTheDocument()
  expect(screen.getByText('“Buenos días”')).toBeInTheDocument()
  expect(screen.getByText('2 frases')).toBeInTheDocument()
})

it('renders an empty list with no saved phrases', () => {
  usePhrasesList.mockReturnValue({
    data: { data: [], meta: { page: 1, totalPages: 0, total: 0, limit: 20 } },
  })
  renderWithClient(<PhraseList />)

  expect(screen.getByRole('list')).toBeEmptyDOMElement()
  expect(screen.getByText('0 frases')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
})

it('requests the next page when advancing', async () => {
  usePhrasesList.mockReturnValue({
    data: { data: [], meta: { page: 1, totalPages: 2, total: 21, limit: 20 } },
  })
  renderWithClient(<PhraseList />)

  await userEvent.setup().click(screen.getByRole('button', { name: /Siguiente/ }))
  expect(usePhrasesList).toHaveBeenLastCalledWith({ page: 2, limit: 20 })
})

it('shares a single confirm modal across items, scoped to the clicked phrase', async () => {
  usePhrasesList.mockReturnValue({
    data: {
      data: [
        { id: '1', text: 'Hola mundo', createdAt: '22/10/2026' },
        { id: '2', text: 'Buenos días', createdAt: '21/10/2026' },
      ],
      meta: { page: 1, totalPages: 1, total: 2, limit: 20 },
    },
  })
  renderWithClient(<PhraseList />)
  const user = userEvent.setup()

  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()

  await user.click(
    screen.getAllByRole('button', { name: 'Eliminar frase' })[0],
  )

  expect(screen.getAllByRole('dialog')).toHaveLength(1)
  expect(screen.getByText('¿Eliminar "Hola mundo"?')).toBeInTheDocument()
})

it('cancels without deleting and closes the modal', async () => {
  usePhrasesList.mockReturnValue({
    data: {
      data: [{ id: '1', text: 'Hola mundo', createdAt: '22/10/2026' }],
      meta: { page: 1, totalPages: 1, total: 1, limit: 20 },
    },
  })
  renderWithClient(<PhraseList />)
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Eliminar frase' }))
  await user.click(screen.getByRole('button', { name: 'Cancelar' }))

  expect(phraseService.remove).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
  expect(screen.getByText('“Hola mundo”')).toBeInTheDocument()
})

it('confirms, calls remove with the clicked phrase id and closes the modal on success', async () => {
  vi.mocked(phraseService.remove).mockResolvedValue(undefined)
  usePhrasesList.mockReturnValue({
    data: {
      data: [{ id: '1', text: 'Hola mundo', createdAt: '22/10/2026' }],
      meta: { page: 1, totalPages: 1, total: 1, limit: 20 },
    },
  })
  renderWithClient(<PhraseList />)
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Eliminar frase' }))
  await user.click(screen.getByRole('button', { name: 'Eliminar' }))

  expect(phraseService.remove).toHaveBeenCalledExactlyOnceWith('1')
  await waitFor(() => expect(screen.queryByRole('dialog')).not.toBeInTheDocument())
})

it('shows a generic error inside the modal and keeps it open for retry', async () => {
  vi.mocked(phraseService.remove).mockRejectedValueOnce(
    axiosErrorWith({ code: 'INTERNAL_ERROR', detail: 'Error interno.' }),
  )
  usePhrasesList.mockReturnValue({
    data: {
      data: [{ id: '1', text: 'Hola mundo', createdAt: '22/10/2026' }],
      meta: { page: 1, totalPages: 1, total: 1, limit: 20 },
    },
  })
  renderWithClient(<PhraseList />)
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Eliminar frase' }))
  await user.click(screen.getByRole('button', { name: 'Eliminar' }))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText('Error interno.')).toBeInTheDocument()
  expect(screen.getByText('“Hola mundo”')).toBeInTheDocument()
})

it('shows the not-found error inside the modal when the phrase no longer exists', async () => {
  vi.mocked(phraseService.remove).mockRejectedValueOnce(
    axiosErrorWith({ code: 'PHRASE_NOT_FOUND', detail: 'No existe.' }),
  )
  usePhrasesList.mockReturnValue({
    data: {
      data: [{ id: '1', text: 'Hola mundo', createdAt: '22/10/2026' }],
      meta: { page: 1, totalPages: 1, total: 1, limit: 20 },
    },
  })
  renderWithClient(<PhraseList />)
  const user = userEvent.setup()

  await user.click(screen.getByRole('button', { name: 'Eliminar frase' }))
  await user.click(screen.getByRole('button', { name: 'Eliminar' }))

  const dialog = await screen.findByRole('dialog')
  expect(within(dialog).getByText('No existe.')).toBeInTheDocument()

  await user.click(within(dialog).getByRole('button', { name: 'Cancelar' }))
  expect(screen.queryByRole('dialog')).not.toBeInTheDocument()
})
