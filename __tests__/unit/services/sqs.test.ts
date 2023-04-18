import { addToQueue } from '@services/sqs'
import { message } from '../__mocks__'

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

    test('expect message to be added to queue', async () => {
      await addToQueue(message)

      expect(mockSend).toHaveBeenCalledWith({
        MessageBody: '{"contents":"Hello, SMS world!","messageType":"TRANSACTIONAL","to":"+15551234567"}',
        MessageGroupId: 'message-queue-id',
        QueueUrl: 'https://dbowland.com/sqsQueue',
      })
    })
  })
})
