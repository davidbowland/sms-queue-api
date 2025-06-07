import { message } from '../__mocks__'
import eventJson from '@events/post-item.json'
import { APIGatewayEvent } from '@types'
import { extractMessageFromEvent } from '@utils/events'

describe('event', () => {
  const event = eventJson as unknown as APIGatewayEvent

  describe('extractMessageFromEvent', () => {
    it.each([
      { body: JSON.stringify({ ...message, to: undefined }) },
      { body: JSON.stringify({ ...message, to: '+1-555-123-4567' }) },
      { body: JSON.stringify({ ...message, contents: undefined }) },
      { body: JSON.stringify({ ...message, messageType: 'fnord' }) },
    ])('should reject bad message', (tempEvent: unknown) => {
      expect(() => extractMessageFromEvent(tempEvent as APIGatewayEvent)).toThrow()
    })

    it('should return formatted message from event', () => {
      const result = extractMessageFromEvent(event)

      expect(result).toEqual({
        contents: 'Hello, SMS world!',
        messageType: 'TRANSACTIONAL',
        to: '+15551234567',
      })
    })

    it('should handle base64 encoded event', () => {
      const tempEvent = {
        ...event,
        body: Buffer.from(JSON.stringify(message)).toString('base64'),
        isBase64Encoded: true,
      } as unknown as APIGatewayEvent
      const result = extractMessageFromEvent(tempEvent)

      expect(result).toEqual({
        contents: 'Hello, SMS world!',
        messageType: 'TRANSACTIONAL',
        to: '+15551234567',
      })
    })

    it('should handle event with optional fields missing', () => {
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
