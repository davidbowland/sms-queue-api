import { APIGatewayEvent, SMSMessage } from '../types'

/* SMSMessage */

const isValidSmsMessage = (message: SMSMessage): Promise<SMSMessage> =>
  Promise.resolve()
    .then(() => message.to ?? Promise.reject('Missing to value'))
    .then(() =>
      message.to.match(/^\+\d{11}$/) ? message : Promise.reject('To value must be in the format +10000000000')
    )
    .then(() => message.contents ?? Promise.reject('Missing subject value'))
    .then(() =>
      message.messageType && ['TRANSACTIONAL', 'PROMOTIONAL'].every((item) => message.messageType != item)
        ? Promise.reject('Message type must be either TRANSACTIONAL or PROMOTIONAL when present')
        : message
    )
    .then(() => message)

const formatEmail = (message: SMSMessage): Promise<SMSMessage> =>
  isValidSmsMessage(message).then(() => ({
    to: message.to,
    contents: message.contents,
    messageType: message.messageType,
  }))

/* Event */

const parseEventBody = (event: APIGatewayEvent): Promise<SMSMessage> =>
  Promise.resolve(
    JSON.parse(
      event.isBase64Encoded && event.body ? Buffer.from(event.body, 'base64').toString('utf8') : (event.body as string)
    )
  )

export const extractMessageFromEvent = (event: APIGatewayEvent): Promise<SMSMessage> =>
  parseEventBody(event).then(formatEmail)
