const AuthTokenValidator = require('./auth-token')
const BackofficeAuthTokenValidator = require('./backoffice-token')
const logger = require('../common/logger')

module.exports = () => ({
  BackofficeAuthToken: (req, secDef, apiKey, cb) => {
    if (!req.headers['x-audit']) {
      // return cb(new Error('audit header has not been sent'))
      logger.warn(`audit header has not been sent, ${req.method} > ${req.url}`)
    }

    return BackofficeAuthTokenValidator(apiKey)
      .then(() => cb())
      .catch(e => cb(e))
  },
  AuthToken: (req, secDef, apiKey, cb) => {
    if (!req.headers['x-audit']) {
      // return cb(new Error('audit header has not been sent'))
      logger.warn(`audit header has not been sent, ${req.method} > ${req.url}`)
    }

    return AuthTokenValidator(apiKey)
      .then(() => cb())
      .catch(e => cb(e))
  },
})
