import { mocked } from 'jest-mock'

import { message } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { postItem } from '@handlers/post-item'
import * as sqs from '@services/sqs'
import { APIGatewayEvent } from '@types'
import * as events from '@utils/events'
import * as logging from '@utils/logging'
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
    it('should log event object without body', async () => {
      await postItem(event)

      expect(mocked(logging).log).toHaveBeenCalledWith(expect.anything(), { ...event, body: undefined })
    })

    it('should return BAD_REQUEST when extractMessageFromEvent throws', async () => {
      mocked(events).extractMessageFromEvent.mockImplementationOnce(() => {
        throw new Error('Bad request')
      })
      const result = await postItem(event)

      expect(result).toEqual(status.BAD_REQUEST)
    })

    it('should add message to queue', async () => {
      await postItem(event)

      expect(mocked(sqs).addToQueue).toHaveBeenCalledWith(message)
    })

    it('should return INTERNAL_SERVER_ERROR when queue error occurs', async () => {
      mocked(sqs).addToQueue.mockRejectedValueOnce(undefined)
      const result = await postItem(event)

      expect(result).toEqual(expect.objectContaining(status.INTERNAL_SERVER_ERROR))
    })

    it('should return NO_CONTENT on success', async () => {
      const result = await postItem(event)

      expect(result).toEqual(expect.objectContaining(status.NO_CONTENT))
    })
  })
})
