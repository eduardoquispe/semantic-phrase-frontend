import { beforeEach, describe, expect, it, vi } from 'vitest'
import { phraseData } from '../data/phrases.data'
import { PhraseMatchType } from '../interfaces/phrase-match-type.enum'
import { phraseService } from './phrases.service'

vi.mock('../data/phrases.data', () => ({
  phraseData: { save: vi.fn(), list: vi.fn(), validate: vi.fn() },
}))

const phrase = {
  id: 'phrase-id',
  text: 'Hola mundo',
  createdAt: '2026-10-22T19:00:00Z',
}

beforeEach(() => vi.resetAllMocks())

describe('phraseService', () => {
  it.each([undefined, true])('saves and maps a phrase with confirmed=%s', async confirmed => {
    const request = {
      text: phrase.text,
      validationId: 'validation-id',
      ...(confirmed === undefined ? {} : { confirmed }),
    }
    vi.mocked(phraseData.save).mockResolvedValue({ data: phrase })

    expect(await phraseService.save(request)).toEqual({
      data: {
        id: phrase.id,
        text: phrase.text,
        createdAt: new Intl.DateTimeFormat().format(new Date(phrase.createdAt)),
      },
    })
    expect(phraseData.save).toHaveBeenCalledExactlyOnceWith(request)
  })

  it('lists phrases with pagination and maps the response', async () => {
    const query = { page: 2, limit: 10 }
    const meta = { ...query, total: 11, totalPages: 2 }
    vi.mocked(phraseData.list).mockResolvedValue({ data: [phrase], meta })

    expect(await phraseService.list(query)).toEqual({
      data: [{
        id: phrase.id,
        text: phrase.text,
        createdAt: new Intl.DateTimeFormat().format(new Date(phrase.createdAt)),
      }],
      meta,
    })
    expect(phraseData.list).toHaveBeenCalledExactlyOnceWith(query)
  })

  it('validates a phrase and returns its match and confirmation requirement', async () => {
    const request = { text: ' Hola mundo ' }
    const response = {
      data: {
        validationId: 'validation-id',
        expiresAt: '2026-10-22T19:15:00Z',
        requiresConfirmation: true,
        match: {
          type: PhraseMatchType.VECTOR as const,
          phrase: { id: phrase.id, text: phrase.text },
          similarityScore: 0.92,
        },
      },
    }
    vi.mocked(phraseData.validate).mockResolvedValue(response)

    expect(await phraseService.validate(request)).toEqual(response)
    expect(phraseData.validate).toHaveBeenCalledExactlyOnceWith(request)
  })

  it('propagates save errors', async () => {
    const error = new Error('Save failed')
    vi.mocked(phraseData.save).mockRejectedValue(error)

    await expect(phraseService.save({ text: phrase.text, validationId: 'validation-id' }))
      .rejects.toBe(error)
  })

  it('propagates list errors', async () => {
    const error = new Error('List failed')
    vi.mocked(phraseData.list).mockRejectedValue(error)

    await expect(phraseService.list({ page: 1, limit: 10 })).rejects.toBe(error)
  })

  it('propagates validation errors', async () => {
    const error = new Error('Validation failed')
    vi.mocked(phraseData.validate).mockRejectedValue(error)

    await expect(phraseService.validate({ text: phrase.text })).rejects.toBe(error)
  })
})
