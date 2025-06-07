import { APIGatewayEvent, SMSMessage } from '../types'

/* SMSMessage */

const formatSMS = (message: SMSMessage): SMSMessage => {
  if (!message.to) {
    throw new Error('to missing from request')
  } else if (message.to.match(/^\+1\d{10}$/) === null) {
    throw new Error('to must be in the format +10000000000')
  } else if (!message.contents) {
    throw new Error('contents missing from request')
  } else if (message.messageType && ['TRANSACTIONAL', 'PROMOTIONAL'].every((item) => message.messageType != item)) {
    throw new Error('type must be either TRANSACTIONAL or PROMOTIONAL when present')
  }
  return {
    contents: message.contents,
    messageType: message.messageType,
    to: message.to,
  }
}

/* Event */

const parseEventBody = (event: APIGatewayEvent): SMSMessage =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string),
  )

export const extractMessageFromEvent = (event: APIGatewayEvent): SMSMessage => formatSMS(parseEventBody(event))
