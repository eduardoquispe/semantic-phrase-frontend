import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { phraseService } from '../services/phrases.service'
import { useDeletePhrase } from './delete-phrase.hook'

vi.mock('../services/phrases.service', () => ({ phraseService: { remove: vi.fn() } }))

beforeEach(() => vi.resetAllMocks())

function axiosErrorWith(data: unknown) {
  return { isAxiosError: true, response: { data } }
}

function setup(onDeleted?: () => void) {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: 2, retryDelay: 0 } },
  })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return {
    client,
    ...renderHook(() => useDeletePhrase('phrase-id', { onDeleted }), { wrapper: Wrapper }),
  }
}

it('confirms, calls remove once and invalidates the phrases cache on success', async () => {
  vi.mocked(phraseService.remove).mockResolvedValue(undefined)
  const onDeleted = vi.fn()
  const { client, result } = setup(onDeleted)
  client.setQueryData(['phrases', { page: 1 }], { data: [] })

  act(() => result.current.confirm())

  await waitFor(() => expect(onDeleted).toHaveBeenCalledOnce())
  expect(phraseService.remove).toHaveBeenCalledExactlyOnceWith('phrase-id')
  expect(client.getQueryState(['phrases', { page: 1 }])?.isInvalidated).toBe(true)
})

it('reset clears a previous error', async () => {
  const error = axiosErrorWith({ code: 'INTERNAL_ERROR', detail: 'Falló' })
  vi.mocked(phraseService.remove).mockRejectedValueOnce(error)
  const { result } = setup()

  act(() => result.current.confirm())
  await waitFor(() => expect(result.current.error).toBe('Falló'))

  act(() => result.current.reset())

  await waitFor(() => expect(result.current.error).toBeUndefined())
})

it('sets an error and does not invalidate on a generic failure, allowing retry', async () => {
  const error = axiosErrorWith({ code: 'INTERNAL_ERROR', detail: 'Falló' })
  vi.mocked(phraseService.remove).mockRejectedValueOnce(error)
  const { client, result } = setup()
  client.setQueryData(['phrases'], { data: [] })

  act(() => result.current.confirm())

  await waitFor(() => expect(result.current.error).toBe('Falló'))
  expect(client.getQueryState(['phrases'])?.isInvalidated).toBe(false)

  vi.mocked(phraseService.remove).mockResolvedValueOnce(undefined)
  act(() => result.current.reset())
  act(() => result.current.confirm())

  await waitFor(() => expect(result.current.error).toBeUndefined())
  expect(phraseService.remove).toHaveBeenCalledTimes(2)
})

it('surfaces the error and invalidates the phrases cache when the phrase no longer exists', async () => {
  const error = axiosErrorWith({ code: 'PHRASE_NOT_FOUND', detail: 'No existe' })
  vi.mocked(phraseService.remove).mockRejectedValueOnce(error)
  const { client, result } = setup()
  client.setQueryData(['phrases'], { data: [] })

  act(() => result.current.confirm())

  await waitFor(() => expect(result.current.error).toBe('No existe'))
  expect(client.getQueryState(['phrases'])?.isInvalidated).toBe(true)
})
