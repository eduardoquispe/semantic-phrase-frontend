import { http, HttpResponse } from 'msw'
import { setupServer } from 'msw/node'
import { afterAll, afterEach, beforeAll, expect, it } from 'vitest'
import { phraseData } from './phrases.data'

const server = setupServer()

beforeAll(() => server.listen())
afterEach(() => server.resetHandlers())
afterAll(() => server.close())

it.each([false, true])('posts the creation contract with confirmation=%s', async confirmed => {
  const input = {
    text: 'Hola mundo',
    validationId: '550e8400-e29b-41d4-a716-446655440000',
    ...(confirmed ? { confirmed: true } : {}),
  }
  const response = {
    data: { id: 'phrase-id', text: input.text, createdAt: '2026-10-22T19:00:00Z' },
  }
  let received: unknown
  server.use(http.post('http://localhost:3000/api/v1/phrases', async ({ request }) => {
    received = await request.json()
    return HttpResponse.json(response, { status: 201 })
  }))

  expect(await phraseData.save(input)).toEqual(response)
  expect(received).toEqual(input)
})
