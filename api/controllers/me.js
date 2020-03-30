const moment = require('moment')

const buildQuery = ({ imei, time }) => ({
  ...(time ? {
    time: {
      $gt: moment(time).subtract(5, 'minute').toDate(),
      $lt: moment(time).add(5, 'minute').toDate(),
    } } : null),
  imei,
})
module.exports = ({ mongoose }) => {
  const UserModel = mongoose.model('user')
  const DatapointModel = mongoose.model('datapoint')
  return {
    mePostUser: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const user = await UserModel.create(body)
        res.status(201).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    meGet: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const user = await UserModel.findByToken(token)
        res.status(200).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    meLogin: async (req, res, next) => {
      try {
        const { imei, password } = req.swagger.params.body.value
        const user = await UserModel.findByCredentials(imei, password)
        const token = await user.generateAuthToken()
        res.status(200).json({ token })
        next()
      } catch (e) {
        next(e)
      }
    },
    mePut: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const { _id: id } = await UserModel.findByToken(token)
        const body = req.swagger.params.body.value
        const user = await UserModel.update(id, body)
        res.status(201).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    mePostDatapoint: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const { imei } = await UserModel.findByToken(token)
        const body = req.swagger.params.body.value
        const datapoint = await DatapointModel.create({ imei: imei || body.imei, ...body })
        res.status(201).json(datapoint.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    meGetDatapoints: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const { imei } = await UserModel.findByToken(token)
        const lat = parseFloat(req.swagger.params.lat.value)
        const lon = parseFloat(req.swagger.params.lon.value)
        const radius = parseFloat(req.swagger.params.radius.value)
        const time = req.swagger.params.time.value
        const query = buildQuery({ time, imei })
        let datapoints
        if (lat && lon) {
          datapoints = await DatapointModel.aggregate([
            {
              $geoNear: {
                near: { type: 'Point', coordinates: [lat, lon] },
                distanceField: 'dist.calculated',
                maxDistance: radius || 30,
                query,
                includeLocs: 'dist.location',
                spherical: true,
              },
            },
          ])
        } else {
          datapoints = await DatapointModel.find(query)
        }
        res.status(200).json(datapoints)
        next()
      } catch (e) {
        next(e)
      }
    },
  }
}
