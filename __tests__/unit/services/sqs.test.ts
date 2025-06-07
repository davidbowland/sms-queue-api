import { message } from '../__mocks__'
import { addToQueue } from '@services/sqs'

const mockSend = jest.fn()
jest.mock('@aws-sdk/client-sqs', () => ({
  SendMessageCommand: jest.fn().mockImplementation((x) => x),
  SQSClient: jest.fn(() => ({
    send: (...args) => mockSend(...args),
  })),
}))
jest.mock('@utils/logging', () => ({
  xrayCapture: jest.fn().mockImplementation((x) => x),
}))

describe('sqs', () => {
  describe('addToQueue', () => {
    beforeAll(() => {
      mockSend.mockResolvedValue(undefined)
    })

    it('should add message to queue', async () => {
      await addToQueue(message)

      expect(mockSend).toHaveBeenCalledWith({
        MessageBody: '{"contents":"Hello, SMS world!","messageType":"TRANSACTIONAL","to":"+15551234567"}',
        MessageGroupId: 'message-queue-id',
        QueueUrl: 'https://dbowland.com/sqsQueue',
      })
    })
  })
})
