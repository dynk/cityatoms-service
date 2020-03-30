const moment = require('moment')

module.exports = ({ mongoose }) => {
  const UserModel = mongoose.model('user')
  const DatapointModel = mongoose.model('datapoint')
  return {
    backofficePostUser: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const user = await UserModel.create(body)
        res.status(201).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    backofficeGetUsers: async (req, res, next) => {
      try {
        const users = await UserModel.find({})
        res.status(200).json(users.map(u => u.toJSON()))
        next()
      } catch (e) {
        next(e)
      }
    },
    backofficeGetUserById: async (req, res, next) => {
      try {
        const _id = req.swagger.params.userId.value
        const user = await UserModel.findOne({ _id })
        res.status(200).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    backofficePutUser: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const user = await UserModel.update(body)
        res.status(201).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    backofficePostDatapoint: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const location = {
          type: 'Point',
          coordinates: [body.lat, body.lon],
        }
        const datapoint = await DatapointModel.create({ ...body, location })
        res.status(201).json(datapoint.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    backofficeGetDatapoints: async (req, res, next) => {
      try {
        const lat = parseFloat(req.swagger.params.lat.value)
        const lon = parseFloat(req.swagger.params.lon.value)
        const radius = parseFloat(req.swagger.params.radius.value)
        const rawTime = req.swagger.params.time.value
        let datapoints
        if (lat && lon && radius) {
          const afterTime = moment(rawTime).add(5, 'minute').toDate()
          const beforeTime = moment(rawTime).subtract(5, 'minute').toDate()
          datapoints = await DatapointModel.aggregate([
            {
              $geoNear: {
                near: { type: 'Point', coordinates: [lat, lon] },
                distanceField: 'dist.calculated',
                maxDistance: radius,
                query: {
                  time: {
                    $gt: beforeTime,
                    $lt: afterTime,
                  },
                },
                includeLocs: 'dist.location',
                spherical: true,
              },
            },
          ])
        } else {
          datapoints = await DatapointModel.find({})
        }
        res.status(200).json(datapoints)
        next()
      } catch (e) {
        next(e)
      }
    },
  }
}
