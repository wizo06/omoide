const { readFileSync } = require('fs')
const { exec } = require('child_process')
const { ApiClient } = require('twitch')
const { ClientCredentialsAuthProvider } = require('twitch-auth')
const { EventSubListener, ReverseProxyAdapter } = require('twitch-eventsub')
const { NgrokAdapter } = require('twitch-eventsub-ngrok')
const { connect } = require('amqplib')
const logger = require('@wizo06/logger')

const { clientId, clientSecret, signature, userIds, hostName, port, rabbitmq } = require('@iarna/toml').parse(readFileSync('config/config.toml'))

const authProvider = new ClientCredentialsAuthProvider(clientId, clientSecret)
const apiClient = new ApiClient({ authProvider })

;(async () => {
  const conn = await connect(rabbitmq)
  const chan = await conn.createChannel()
  await chan.checkExchange(rabbitmq.exchange)

  if (process.argv[2] === 'dev') {
    await apiClient.helix.eventSub.deleteAllSubscriptions()
  }

  const listener = (process.argv[2] === 'dev')
    ? new EventSubListener(apiClient, new NgrokAdapter(), signature)
    : new EventSubListener(apiClient, new ReverseProxyAdapter({ hostName }), signature)

  (process.argv[2] === 'dev')
    ? await listener.listen()
    : await listener.listen(port)
    
  for (const userId of userIds) {
    await listener.subscribeToStreamOfflineEvents(userId, async (event) => {
      logger.info(`${event.broadcasterName}(${event.broadcasterId}) just went offline`)

      const vods = await apiClient.helix.videos.getVideosByUser(userId, { type: 'archive' })
      logger.info(vods.data[0]?.url)

      const message = {
        
      }

      chan.publish(
        rabbitmq.exchange,
        rabbitmq.routingKey,
        Buffer.from(JSON.stringify(message)),
        { persistent: true },
      )

      // if (vods.data[0]?.url) {
      //   exec(`${__dirname}/download.sh "${vods.data[0]?.url}"`, (err, stdout, stderr) => {
      //     if (err) return console.error(err)

      //     console.log(stdout)
      //   })
      // }
    })
    logger.info(`Listening to offline events for ${userId}`)
  }
})()
