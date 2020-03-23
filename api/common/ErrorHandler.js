const util = require('util')
const logger = require('./logger')

const idDict = 'abcdefghijklmnopqrstuvwxyz0123456789'

function createId() {
  let text = ''
  for (let i = 0; i < 10; i += 1) {
    text += idDict.charAt(Math.floor(Math.random() * idDict.length))
  }
  return text
}

module.exports = function create() {
  return (context, next) => {
    if (!util.isError(context.error)) {
      next()
      return
    }
    const err = context.error

    if (context.response && context.response.statusCode && context.response.statusCode >= 400) {
      context.statusCode = context.response.statusCode
    } else if (err.statusCode && err.statusCode >= 400) {
      context.statusCode = err.statusCode
      delete err.statusCode
    } else {
      context.statusCode = 500
    }

    delete context.error
    context.headers['Content-Type'] = 'application/json'

    err.ref = createId()
    logger.error(Object.assign(err,
      { Method: context.request.method, Url: context.request.originalUrl }))

    if (context.statusCode === 500) {
      next(null, JSON.stringify({ name: 'InternalServerError', ref: err.ref }))
      return
    }

    next(null, JSON.stringify(err))
  }
}
