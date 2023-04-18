import { SendMessageCommand, SendMessageResult, SQSClient } from '@aws-sdk/client-sqs'

import { sqsMessageGroupId, sqsQueueUrl } from '../config'
import { SMSMessage } from '../types'
import { xrayCapture } from '../utils/logging'

const sqs = xrayCapture(new SQSClient({ apiVersion: '2012-11-05' }))

/* Message queue */

export const addToQueue = async (message: SMSMessage): Promise<SendMessageResult> => {
  const command = new SendMessageCommand({
    MessageBody: JSON.stringify(message),
    MessageGroupId: sqsMessageGroupId,
    QueueUrl: sqsQueueUrl,
  })
  return sqs.send(command)
}
