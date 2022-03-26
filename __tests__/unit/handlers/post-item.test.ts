import { mocked } from 'jest-mock'

import * as events from '@utils/events'
import * as logging from '@utils/logging'
import * as sqs from '@services/sqs'
import { APIGatewayEvent } from '@types'
import eventJson from '@events/post-item.json'
import { message } from '../__mocks__'
import { postItem } from '@handlers/post-item'

import status from '@utils/status'

jest.mock('@services/sqs')
jest.mock('@utils/events')
jest.mock('@utils/logging')

describe('post-item', () => {
  const event = eventJson as unknown as APIGatewayEvent

  beforeAll(() => {
    mocked(events).extractMessageFromEvent.mockReturnValue(message)
    mocked(sqs).addToQueue.mockResolvedValue(undefined)
  })

  describe('postItem', () => {
    test('expect event object logged without body', async () => {
      await postItem(event)
      expect(mocked(logging).log).toHaveBeenCalledWith(expect.anything(), { ...event, body: undefined })
    })

    test('expect BAD_REQUEST when extractMessageFromEvent throws', async () => {
      mocked(events).extractMessageFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await postItem(event)
      expect(result).toEqual(status.BAD_REQUEST)
    })

    test('expect message added to queue', async () => {
      await postItem(event)
      expect(mocked(sqs).addToQueue).toHaveBeenCalledWith(message)
    })

    test('expect INTERNAL_SERVER_ERROR when queue error', async () => {
      mocked(sqs).addToQueue.mockRejectedValueOnce(undefined)
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    test('expect NO_CONTENT when success', async () => {
      const result = await postItem(event)
      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })
  })
})
