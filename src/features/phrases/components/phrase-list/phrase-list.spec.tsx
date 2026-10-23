import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { expect, it, vi } from 'vitest'
import { PhraseList } from './phrase-list.component'

const { usePhrasesList } = vi.hoisted(() => ({ usePhrasesList: vi.fn() }))
vi.mock('../../hooks/phrases-list.hook', () => ({ usePhrasesList }))

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
  render(<PhraseList />)

  expect(screen.getAllByRole('listitem')).toHaveLength(2)
  expect(screen.getByText('“Hola mundo”')).toBeInTheDocument()
  expect(screen.getByText('“Buenos días”')).toBeInTheDocument()
  expect(screen.getByText('2 frases')).toBeInTheDocument()
})

it('renders an empty list with no saved phrases', () => {
  usePhrasesList.mockReturnValue({
    data: { data: [], meta: { page: 1, totalPages: 0, total: 0, limit: 20 } },
  })
  render(<PhraseList />)

  expect(screen.getByRole('list')).toBeEmptyDOMElement()
  expect(screen.getByText('0 frases')).toBeInTheDocument()
  expect(screen.getByRole('button', { name: /Siguiente/ })).toBeDisabled()
})

it('requests the next page when advancing', async () => {
  usePhrasesList.mockReturnValue({
    data: { data: [], meta: { page: 1, totalPages: 2, total: 21, limit: 20 } },
  })
  render(<PhraseList />)

  await userEvent.setup().click(screen.getByRole('button', { name: /Siguiente/ }))
  expect(usePhrasesList).toHaveBeenLastCalledWith({ page: 2, limit: 20 })
})
