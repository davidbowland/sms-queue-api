import { SQS } from 'aws-sdk'

import { sqsMessageGroupId, sqsQueueUrl } from '../config'
import { SMSMessage } from '../types'

const sqs = new SQS({ apiVersion: '2012-11-05' })

/* Message queue */

export const addToQueue = (message: SMSMessage): Promise<SQS.SendMessageResult> =>
  sqs
    .sendMessage({
      MessageBody: JSON.stringify(message),
      MessageGroupId: sqsMessageGroupId,
      QueueUrl: sqsQueueUrl,
    })
    .promise()
