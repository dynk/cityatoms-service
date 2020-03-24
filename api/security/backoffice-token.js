
const config = require('../common/config')

const BASIC_AUTHORIZATION = config.BACKOFFICE_AUTH_TOKEN

const validator = token =>
  new Promise((accept, reject) => {
    if (token === BASIC_AUTHORIZATION) {
      return accept()
    }
    return reject(new Error('invalid auth token', 403))
  })

module.exports = validator
