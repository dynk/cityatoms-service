const util = require('util')
const logger = require('./logger')


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

    err.ref = err.message
    logger.error(Object.assign(err,
      { Method: context.request.method, Url: context.request.originalUrl }))

    if (context.statusCode === 500) {
      next(null, JSON.stringify({ name: 'InternalServerError', ref: err.ref }))
      return
    }

    next(null, JSON.stringify(err))
  }
}
