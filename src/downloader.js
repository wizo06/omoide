const { readFileSync, mkdirSync, rmSync } = require('fs')
const { connect } = require('amqplib')
const { execSync } = require('child_process')
const logger = require('@wizo06/logger')

const { rabbitmq } = require('@iarna/toml').parse(readFileSync('config/config.toml'))

const download = (job) => {
  // mkdir temp
  mkdirSync(`temp`, { recursive: true })

  // youtube-dl -f best -o 'temp/%(upload_date)s_%(id)s_%(title)s.%(ext)s' "job.url"
  execSync(`youtube-dl -f best -o 'temp/%(upload_date)s_%(id)s_%(title)s.%(ext)s' "${job.url}"`)

  // rclone copy temp/* job.rcloneTarget
  execSync(`rclone copy temp/* "${job.rcloneTarget}"`)

  // rm -rf temp
  rmSync(`temp`, { recursive: true, force: true });

  return Promise.resolve()
}

;(async () => {
  const conn = await connect(rabbitmq)
  const chan = await conn.createChannel()
  await chan.checkExchange(rabbitmq.exchange)

  chan.consume(rabbitmq.queue, async msg => {
    try {
      const job = JSON.parse(msg.content)
      
      await download(job)

      await chan.ack(msg)
    }
    catch (e) {
      logger.error(e)

      await chan.nack(msg, false, true)
    }
  })
})
