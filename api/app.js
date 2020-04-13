const SwaggerExpress = require('swagger-express-mw')
const App = require('express')
const mongoose = require('mongoose')
const Pool = require('pg').Pool
const config = require('./common/config')
const logger = require('./common/logger')
require('./helpers/database/models')
const SecurityHandlers = require('./security')

const app = App()

const linkSwagger = () => new Promise((accept, reject) => {
  const appConfig = {
    appRoot: `${__dirname}/../`,
    swaggerSecurityHandlers: SecurityHandlers(),
    dependencies: { mongoose, Pool  },
  }
  SwaggerExpress.create(appConfig, (err, swaggerExpress) => {
    if (err) {
      logger.error('Error: failed to start server: ', err)
      reject(err)
      return
    }
    swaggerExpress.register(app)
    accept(app)
  })
})

module.exports = {
  app,
  start: async () => {
    const options = {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000,
    }
    mongoose.Promise = global.Promise
    return Promise.all([
      linkSwagger(),
      mongoose.connect(config.MONGO_URI, options)
        .then(() => logger.info(`Connected to database: ${config.MONGO_URI}`))
        .catch(e => logger.error('Error connecting to database!', e)),
    ]).then(t => t[0])
  },
  end: () => {
    mongoose.models = {}
    mongoose.modelSchemas = {}
    return mongoose.disconnect()
  },
}
