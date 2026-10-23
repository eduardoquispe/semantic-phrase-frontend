import { describe, expect, it } from 'vitest'
import type { ValidatePhraseResponseDTO } from '../dto/phrase.dto'
import { PhraseMatchType } from '../interfaces/phrase-match-type.enum'
import {
  toPhraseList,
  toPhraseListItemData,
  toPhraseListQuery,
  toValidatePhraseRequestDTO,
  toValidatePhraseResponse,
} from './phrases.mapper'

const phrase = {
  id: 'phrase-id',
  text: 'Hola mundo',
  createdAt: '2026-10-22T19:00:00Z',
}

describe('phrasesMapper', () => {
  it('converts the phrase date to the local display format', () => {
    expect(toPhraseListItemData(phrase)).toEqual({
      id: phrase.id,
      text: phrase.text,
      createdAt: new Intl.DateTimeFormat().format(new Date(phrase.createdAt)),
    })
  })

  it('maps list items and preserves pagination', () => {
    const meta = { page: 1, limit: 10, total: 1, totalPages: 1 }

    expect(toPhraseList({ data: [phrase], meta })).toEqual({
      data: [{
        id: phrase.id,
        text: phrase.text,
        createdAt: new Intl.DateTimeFormat().format(new Date(phrase.createdAt)),
      }],
      meta,
    })
  })

  it('handles an empty list', () => {
    const response = {
      data: [],
      meta: { page: 1, limit: 10, total: 0, totalPages: 0 },
    }

    expect(toPhraseList(response)).toEqual(response)
  })

  it('maps pagination query parameters', () => {
    expect(toPhraseListQuery({ page: 2, limit: 10 })).toEqual({
      page: 2,
      limit: 10,
    })
  })

  it('preserves the original validation text', () => {
    expect(toValidatePhraseRequestDTO({ text: ' Hola mundo ' }))
      .toEqual({ text: ' Hola mundo ' })
  })

  it.each<ValidatePhraseResponseDTO['data']['match']>([
    null,
    {
      type: PhraseMatchType.VECTOR,
      phrase: { id: phrase.id, text: phrase.text },
      similarityScore: 0.92,
    },
    {
      type: PhraseMatchType.TEXTUAL_EXACT,
      phrase: { id: phrase.id, text: phrase.text },
      similarityScore: null,
    },
  ])('maps a validation response with match %j', match => {
    const response: ValidatePhraseResponseDTO = {
      data: {
        validationId: 'validation-id',
        expiresAt: '2026-10-22T19:15:00Z',
        requiresConfirmation: match !== null,
        match,
      },
    }

    expect(toValidatePhraseResponse(response)).toEqual(response.data)
  })
})
