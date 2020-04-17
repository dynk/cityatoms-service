const moment = require('moment')
const pool = require('../helpers/database/postgres')

const buildQuery = ({ instance_id, time, created_at }) => ({
  ...(time ? {
    time: {
      $gt: moment(time).subtract(5, 'minute').toDate(),
      $lt: moment(time).add(5, 'minute').toDate(),
    } } : null),
  instance_id,
  ...(created_at ? { created_at: { $gte: created_at } } : null),
})
module.exports = ({ mongoose, Pool }) => {
  const UserModel = mongoose.model('user')
  const DatapointModel = mongoose.model('datapoint')
  const authenticate = async instance_id => {
    // const user = await UserModel.findByToken
    const user = await UserModel.findOne({ instance_id })
    if (!user) {
      return Promise.reject(Object.assign(new Error('User was not found'), { statusCode: 404 }))
    }
    return user
  }
  const checkIfUserExists = async instance_id => {
    const user = await UserModel.findOne({ instance_id: instance_id })
    if (user) {
      return Promise.reject(Object.assign(new Error(`User instance_id: ${instance_id} already taken`), { statusCode: 409 }))
    }
    return user
  }
  return {
    mePostUser: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const { instance_id } = body
        await checkIfUserExists(instance_id)
        const user = await UserModel.create({ ...body, instance_id: body.instance_id })
        res.status(201).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    meGet: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const user = await authenticate(token)
        res.status(200).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    // meLogin: async (req, res, next) => {
    //   try {
    //     const { instance_id, password } = req.swagger.params.body.value
    //     const user = await UserModel.findByCredentials(instance_id, password)
    //     const token = await user.generateAuthToken()
    //     res.status(200).json({ token })
    //     next()
    //   } catch (e) {
    //     next(e)
    //   }
    // },
    mePut: async (req, res, next) => {
      try {
        const instance_id = req.swagger.params['x-auth-token'].value
        const { _id } = await authenticate(instance_id)
        const body = req.swagger.params.body.value
        await UserModel.update({ _id }, { ...body, instance_id: instance_id })
        res.status(200).json({ id: _id })
        next()
      } catch (e) {
        next(e)
      }
    },
    mePostDatapoint: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const { instance_id } = await authenticate(token)
        const body = req.swagger.params.body.value
        const datapoint = await DatapointModel.create({ instance_id: instance_id || body.instance_id, ...body })
        res.status(201).json(datapoint.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    meBatchPostDatapoint: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const { instance_id } = await authenticate(token)
        const new_datapoints = req.swagger.params.body.value
        const datapoint = await DatapointModel.insertMany(new_datapoints.map(d => ({ ...d, instance_id })))
        res.status(201).json(datapoint.map(d => d.toJSON()))
        next()
      } catch (e) {
        next(e)
      }
    },
    meGetDatapoints: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const { instance_id } = await authenticate(token)
        const lat = parseFloat(req.swagger.params.lat.value)
        const lon = parseFloat(req.swagger.params.lon.value)
        const radius = parseFloat(req.swagger.params.radius.value)
        const time = req.swagger.params.time.value
        const created_at = req.swagger.params.created_at.value
        const query = buildQuery({ time, instance_id, created_at })
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
    meGetCount: async (req, res, next) => {
      try {
        const token = req.swagger.params['x-auth-token'].value
        const {instance_id} = await authenticate(token)
      
        const tableName = `instance_id${instance_id}`
        pool.query(`SELECT * FROM "${tableName}"`, (err, queryRes) => {
          
          if(err) {
            if( err.code == '42P01') {
              // Error code 42P01 means that table doesnot exist
              // It will give an error in the scenario when user has not come into contact w/anyone and as such that table won't exist
              // May change in future version if Python script is modified
              res.status(200).json({data: []})
              
            } else {
              next(err)
            }
          }
          else {
            res.status(200).json({ data: queryRes.rows }) 
          }
          next()
        })
        
        
      } catch(e) {
        next(e)
      }
    }
  }
}
