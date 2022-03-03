import { message } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { APIGatewayEvent } from '@types'
import { extractMessageFromEvent } from '@utils/events'

describe('event', () => {
  const event = eventJson as unknown as APIGatewayEvent

  describe('extractMessageFromEvent', () => {
    test.each([
      { body: JSON.stringify({ ...message, to: undefined }) },
      { body: JSON.stringify({ ...message, to: '+1-555-123-4567' }) },
      { body: JSON.stringify({ ...message, contents: undefined }) },
      { body: JSON.stringify({ ...message, messageType: 'fnord' }) },
    ])('expect reject for bad message', (tempEvent: unknown) => {
      expect(() => extractMessageFromEvent(tempEvent as APIGatewayEvent)).toThrow()
    })

    test('expect formatted message from event', () => {
      const result = extractMessageFromEvent(event)
      expect(result).toEqual({
        contents: 'Hello, SMS world!',
        messageType: 'TRANSACTIONAL',
        to: '+15551234567',
      })
    })

    test('expect formatted message from event when base64', () => {
      const tempEvent = {
        ...event,
        isBase64Encoded: true,
        body: Buffer.from(JSON.stringify(message)).toString('base64'),
      } as unknown as APIGatewayEvent
      const result = extractMessageFromEvent(tempEvent)
      expect(result).toEqual({
        contents: 'Hello, SMS world!',
        messageType: 'TRANSACTIONAL',
        to: '+15551234567',
      })
    })

    test('expect formatted message from reduced event', () => {
      const tempMessage = { ...message, messageType: undefined }
      const tempEvent = { ...event, body: JSON.stringify(tempMessage) } as unknown as APIGatewayEvent
      const result = extractMessageFromEvent(tempEvent)
      expect(result).toEqual({
        contents: 'Hello, SMS world!',
        messageType: undefined,
        to: '+15551234567',
      })
    })
  })
})
