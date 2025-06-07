import { addToQueue } from '../services/sqs'
import { APIGatewayEvent, APIGatewayProxyResult, SMSMessage } from '../types'
import { extractMessageFromEvent } from '../utils/events'
import { log, logError } from '../utils/logging'
import status from '../utils/status'

const processSMS = async (message: SMSMessage): Promise<APIGatewayProxyResult> => {
  try {
    await addToQueue(message)
    return status.NO_CONTENT
  } catch (error) {
    logError(error)
    return status.INTERNAL_SERVER_ERROR
  }
}

export const postItem = async (event: APIGatewayEvent): Promise<APIGatewayProxyResult> => {
  log('Received event', { ...event, body: undefined })
  try {
    const sms = extractMessageFromEvent(event)
    return await processSMS(sms)
  } catch (error: any) {
    return { ...status.BAD_REQUEST, body: JSON.stringify({ message: error.message }) }
  }
}
