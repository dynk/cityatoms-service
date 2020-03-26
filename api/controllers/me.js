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
        // const user = await UserModel.findByToken({ _id })
        res.status(200).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    meLogin: async (req, res, next) => {
      try {
        const { email, password } = req.swagger.params.body.value
        const user = await UserModel.findByCredentials(email, password)
        const token = await user.generateAuthToken()
        res.status(200).json({ token, user })
        next()
      } catch (e) {
        next(e)
      }
    },
    mePut: async (req, res, next) => {
      try {
        const body = req.swagger.params.body.value
        const user = await UserModel.update(body)
        res.status(201).json(user.toJSON())
        next()
      } catch (e) {
        next(e)
      }
    },
    mePostDatapoint: async (req, res, next) => {
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
