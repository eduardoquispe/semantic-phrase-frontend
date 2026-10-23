import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { phraseService } from '../services/phrases.service'
import { usePhrasesList } from './phrases-list.hook'

vi.mock('../services/phrases.service', () => ({ phraseService: { list: vi.fn() } }))

beforeEach(() => vi.resetAllMocks())

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

it('loads phrases with default pagination', async () => {
  const response = { data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } }
  vi.mocked(phraseService.list).mockResolvedValue(response)
  const { result } = renderHook(() => usePhrasesList({}), { wrapper: createWrapper() })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual(response)
  expect(phraseService.list).toHaveBeenCalledExactlyOnceWith({ page: 1, limit: 20 })
})

it('fetches the new page when pagination changes', async () => {
  vi.mocked(phraseService.list).mockResolvedValue({
    data: [], meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
  })
  const { result, rerender } = renderHook(({ page }) => usePhrasesList({ page, limit: 10 }), {
    initialProps: { page: 1 }, wrapper: createWrapper(),
  })
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  rerender({ page: 2 })

  await waitFor(() => expect(phraseService.list).toHaveBeenLastCalledWith({ page: 2, limit: 10 }))
  await waitFor(() => expect(result.current.isSuccess).toBe(true))
})

it('exposes list errors', async () => {
  const error = new Error('List failed')
  vi.mocked(phraseService.list).mockRejectedValue(error)
  const { result } = renderHook(() => usePhrasesList({}), { wrapper: createWrapper() })

  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(result.current.error).toBe(error)
})
