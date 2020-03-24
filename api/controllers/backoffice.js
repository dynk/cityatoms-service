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
        const user_id = req.swagger.params.userId.value
        const body = req.swagger.params.body.value
        const datapoint = await DatapointModel.create({ user_id, ...body })
        res.status(201).json(datapoint.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
  }
}
