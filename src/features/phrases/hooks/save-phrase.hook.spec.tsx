import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { phraseService } from '../services/phrases.service'
import { useSavePhrase } from './save-phrase.hook'

vi.mock('../services/phrases.service', () => ({ phraseService: { save: vi.fn() } }))

beforeEach(() => vi.resetAllMocks())

const request = { text: 'Hola mundo', validationId: 'validation-id', confirmed: true }

function setup() {
  const client = new QueryClient({
    defaultOptions: { mutations: { retry: 2, retryDelay: 0 } },
  })
  function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
  return { client, ...renderHook(useSavePhrase, { wrapper: Wrapper }) }
}

it('saves the phrase and invalidates cached phrase pages', async () => {
  const response = { id: 'phrase-id', text: request.text, createdAt: '22/10/2026' }
  vi.mocked(phraseService.save).mockResolvedValue(response)
  const { client, result } = setup()
  client.setQueryData(['phrases', { page: 1 }], { data: [] })
  client.setQueryData(['phrases', { page: 2 }], { data: [] })
  client.setQueryData(['other'], {})

  await act(async () => { await result.current.mutateAsync(request) })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual(response)
  expect(phraseService.save).toHaveBeenCalledExactlyOnceWith(request)
  expect(client.getQueryState(['phrases', { page: 1 }])?.isInvalidated).toBe(true)
  expect(client.getQueryState(['phrases', { page: 2 }])?.isInvalidated).toBe(true)
  expect(client.getQueryState(['other'])?.isInvalidated).toBe(false)
})

it('exposes save errors without retrying or invalidating the list', async () => {
  const error = new Error('Save failed')
  vi.mocked(phraseService.save).mockRejectedValue(error)
  const { client, result } = setup()
  client.setQueryData(['phrases'], { data: [] })

  act(() => result.current.mutate(request))

  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(result.current.error).toBe(error)
  expect(phraseService.save).toHaveBeenCalledTimes(1)
  expect(client.getQueryState(['phrases'])?.isInvalidated).toBe(false)
})
