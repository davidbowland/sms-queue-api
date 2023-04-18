import * as AWSXRay from 'aws-xray-sdk-core'
import { log, logError, xrayCapture } from '@utils/logging'
import { mocked } from 'jest-mock'
import { SQSClient } from '@aws-sdk/client-sqs'

jest.mock('aws-xray-sdk-core')

describe('logging', () => {
  const consoleError = console.error
  const consoleLog = console.log

  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  afterAll(() => {
    console.error = consoleError
    console.log = consoleLog
  })

  describe('log', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message',
      async (value) => {
        const message = `Log message for value ${JSON.stringify(value)}`
        await log(message)

        expect(console.log).toHaveBeenCalledWith(message)
      }
    )
  })

  describe('logError', () => {
    test.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'expect logFunc to have been called with message',
      async (value) => {
        const message = `Error message for value ${JSON.stringify(value)}`
        const error = new Error(message)
        await logError(error)

        expect(console.error).toHaveBeenCalledWith(error)
      }
    )
  })

  describe('xrayCapture', () => {
    const capturedSqs = 'captured-sqs' as unknown as SQSClient
    const sqs = 'sqs'

    beforeAll(() => {
      mocked(AWSXRay).captureAWSv3Client.mockReturnValue(capturedSqs)
    })

    test('expect AWSXRay.captureAWSv3Client when x-ray is enabled (not running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      const result = xrayCapture(sqs)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledWith(sqs)
      expect(result).toEqual(capturedSqs)
    })

    test('expect same object when x-ray is disabled (running locally)', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      const result = xrayCapture(sqs)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledTimes(0)
      expect(result).toEqual(sqs)
    })
  })
})
