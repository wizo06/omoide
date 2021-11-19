const { readFileSync } = require('fs')
const { ApiClient } = require('@twurple/api')
const { ClientCredentialsAuthProvider } = require('@twurple/auth')
const { EventSubListener, ReverseProxyAdapter } = require('@twurple/eventsub')
const { NgrokAdapter } = require('@twurple/eventsub-ngrok')
const { connect } = require('amqplib')
const logger = require('@wizo06/logger')

const { clientId, clientSecret, secret, userIds, hostName, port, rabbitmq } = require('@iarna/toml').parse(readFileSync('config/config.toml'))

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)
const apiClient = new ApiClient({ authProvider })

;(async () => {
  try {
    const conn = await connect(rabbitmq)
    const chan = await conn.createChannel()
    await chan.checkExchange(rabbitmq.exchange)
  
    if (process.argv[2] === 'dev') {
      await apiClient.eventSub.deleteAllSubscriptions()
    }
  
    const adapter = (process.argv[2] === 'dev')
      ? new NgrokAdapter()
      : new ReverseProxyAdapter({ hostName })
    
    const listener = new EventSubListener({ apiClient, adapter, secret })
  
    (process.argv[2] === 'dev')
      ? await listener.listen()
      : await listener.listen(port)
      
    for (const userId of userIds) {
      await listener.subscribeToStreamOfflineEvents(userId, async (event) => {
        logger.info(`${event.broadcasterName}(${event.broadcasterId}) just went offline`)
  
        const vods = await apiClient.videos.getVideosByUser(userId, { type: 'archive' })
        logger.info(vods.data[0]?.url)
  
        const message = {
          url: vods.data[0]?.url,
          userId,
        }
  
        chan.publish(
          rabbitmq.exchange,
          rabbitmq.routingKey,
          Buffer.from(JSON.stringify(message)),
          { persistent: true },
        )
        logger.success(`Published message to RabbitMQ`)
      })
  
      logger.info(`Listening to offline events for ${userId}`)
    }
  }
  catch (e) {
    console.error(e)
  }
})()
