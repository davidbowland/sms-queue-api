import { addToQueue } from '@services/sqs'
import { message } from '../__mocks__'

const mockSendMessage = jest.fn()
jest.mock('aws-sdk', () => ({
  SQS: jest.fn(() => ({
    sendMessage: (...args) => ({ promise: () => mockSendMessage(...args) }),
  })),
}))

describe('sqs', () => {
  describe('addToQueue', () => {
    beforeAll(() => {
      mockSendMessage.mockResolvedValue(undefined)
    })

    test('expect message to be added to queue', async () => {
      await addToQueue(message)
      expect(mockSendMessage).toHaveBeenCalledWith({
        MessageBody: '{"contents":"Hello, SMS world!","messageType":"TRANSACTIONAL","to":"+15551234567"}',
        MessageGroupId: 'message-queue-id',
        QueueUrl: 'https://dbowland.com/sqsQueue',
      })
    })
  })
})
