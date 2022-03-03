import { APIGatewayEvent, SMSMessage } from '../types'

/* SMSMessage */

const formatEmail = (message: SMSMessage): SMSMessage => {
  if (!message.to) {
    throw new Error('Missing to value')
  } else if (message.to.match(/^\+1\d{10}$/) === null) {
    throw new Error('To value must be in the format +10000000000')
  } else if (!message.contents) {
    throw new Error('Missing contents value')
  } else if (message.messageType && ['TRANSACTIONAL', 'PROMOTIONAL'].every((item) => message.messageType != item)) {
    throw new Error('Message type must be either TRANSACTIONAL or PROMOTIONAL when present')
  }
  return {
    to: message.to,
    contents: message.contents,
    messageType: message.messageType,
  }
}

/* Event */

const parseEventBody = (event: APIGatewayEvent): SMSMessage =>
  JSON.parse(
    event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
  )

export const extractMessageFromEvent = (event: APIGatewayEvent): SMSMessage => formatEmail(parseEventBody(event))
