import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { act, renderHook, waitFor } from '@testing-library/react'
import type { PropsWithChildren } from 'react'
import { beforeEach, expect, it, vi } from 'vitest'
import { phraseService } from '../services/phrases.service'
import { useValidatePhrase } from './validate-phrase.hook'

vi.mock('../services/phrases.service', () => ({ phraseService: { validate: vi.fn() } }))

beforeEach(() => vi.resetAllMocks())

function createWrapper() {
  const client = new QueryClient({ defaultOptions: { mutations: { retry: false } } })
  return function Wrapper({ children }: PropsWithChildren) {
    return <QueryClientProvider client={client}>{children}</QueryClientProvider>
  }
}

it('validates the submitted text and exposes the response', async () => {
  const response = {
    data: {
      validationId: 'validation-id', expiresAt: '2026-10-22T19:15:00Z',
      requiresConfirmation: false, match: null,
    },
  }
  vi.mocked(phraseService.validate).mockResolvedValue(response)
  const { result } = renderHook(useValidatePhrase, { wrapper: createWrapper() })

  await act(async () => { await result.current.mutateAsync({ text: 'Hola mundo' }) })

  await waitFor(() => expect(result.current.isSuccess).toBe(true))
  expect(result.current.data).toEqual(response)
  expect(phraseService.validate).toHaveBeenCalledExactlyOnceWith({ text: 'Hola mundo' })
})

it('exposes validation errors', async () => {
  const error = new Error('Validation failed')
  vi.mocked(phraseService.validate).mockRejectedValue(error)
  const { result } = renderHook(useValidatePhrase, { wrapper: createWrapper() })

  act(() => result.current.mutate({ text: 'Hola mundo' }))

  await waitFor(() => expect(result.current.isError).toBe(true))
  expect(result.current.error).toBe(error)
})
