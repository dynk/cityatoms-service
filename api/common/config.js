const { str, cleanEnv } = require('envalid')

const config = cleanEnv(process.env, {
  PORT: str(),
  AUTH_TOKEN: str(),
  BACKOFFICE_AUTH_TOKEN: str(),
  MONGO_URI: str(),
  JWT_SECRET: str(),
}, { strict: true })

Object.assign(process.env, config)

module.exports = config
