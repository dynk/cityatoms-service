const pino = require('pino')

const env = process.env
module.exports = pino({ level: env.LOG_LEVEL || 'info' })
