const config = require('./common/config')
const logger = require('./common/logger')
const { start } = require('./app')

start()
  .then(app => {
    logger.info(`service has started at port: ${config.PORT}`)
    app.listen(config.PORT)
  })
  .catch(e => {
    logger.error(e)
  })
