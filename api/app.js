const SwaggerExpress = require('swagger-express-mw')
const App = require('express')

const logger = console
const app = App()

const linkSwagger = () => new Promise((accept, reject) => {
  const appConfig = {
    appRoot: `${__dirname}/../`,
    dependencies: { },
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
    return Promise.all([
      linkSwagger(),
    ]).then(t => t[0])
  },
  end: () => {
  },
}
