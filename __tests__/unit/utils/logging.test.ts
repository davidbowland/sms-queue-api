import { SQSClient } from '@aws-sdk/client-sqs'
import * as AWSXRay from 'aws-xray-sdk-core'
import { mocked } from 'jest-mock'

import { log, logError, xrayCapture } from '@utils/logging'

jest.mock('aws-xray-sdk-core')

describe('logging', () => {
  beforeAll(() => {
    console.error = jest.fn()
    console.log = jest.fn()
  })

  describe('log', () => {
    it.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'should call console.log with message for %p',
      async (value) => {
        const message = `Log message for value ${JSON.stringify(value)}`
        await log(message)

        expect(console.log).toHaveBeenCalledWith(message)
      },
    )
  })

  describe('logError', () => {
    it.each(['Hello', 0, null, undefined, { a: 1, b: 2 }])(
      'should call console.error with error for %p',
      async (value) => {
        const message = `Error message for value ${JSON.stringify(value)}`
        const error = new Error(message)
        await logError(error)

        expect(console.error).toHaveBeenCalledWith(error)
      },
    )
  })

  describe('xrayCapture', () => {
    const capturedSqs = 'captured-sqs' as unknown as SQSClient
    const sqs = 'sqs'

    beforeAll(() => {
      mocked(AWSXRay).captureAWSv3Client.mockReturnValue(capturedSqs)
    })

    it('should use AWSXRay.captureAWSv3Client when x-ray is enabled', () => {
      process.env.AWS_SAM_LOCAL = 'false'
      const result = xrayCapture(sqs)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledWith(sqs)
      expect(result).toEqual(capturedSqs)
    })

    it('should return same object when running locally', () => {
      process.env.AWS_SAM_LOCAL = 'true'
      const result = xrayCapture(sqs)

      expect(mocked(AWSXRay).captureAWSv3Client).toHaveBeenCalledTimes(0)
      expect(result).toEqual(sqs)
    })
  })
})
