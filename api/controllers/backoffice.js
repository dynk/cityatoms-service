const moment = require('moment')

const buildQuery = ({ instance_id, time, created_at }) => ({
  ...(time ? {
    time: {
      $gt: moment(time).subtract(5, 'minute').toDate(),
      $lt: moment(time).add(5, 'minute').toDate(),
    } } : null),
  ...(instance_id ? { instance_id } : null),
  ...(created_at ? { created_at: { $gte: created_at } } : null),
})
module.exports = ({ mongoose }) => {
  const UserModel = mongoose.model('user')
  const DatapointModel = mongoose.model('datapoint')
  return {
    backofficePostUser: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const user = await UserModel.create({ ...body, instance_id: body.instance_id })
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
        const _id = req.swagger.params.userId.value
        await UserModel.update({ _id }, { ...body, instance_id: body.instance_id })
        res.status(200).json({ id: _id })
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
        const datapoint = await DatapointModel.create({ ...body, instance_id: body.instance_id, location })
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
        const created_at = req.swagger.params.created_at.value
        const time = req.swagger.params.time.value
        const instance_id = req.swagger.params.instance_id.value
        const query = buildQuery({ instance_id, time, created_at })
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
