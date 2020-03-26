const mongoose = require('mongoose')
const { bcryptTextAsync, bcryptCompareAsync } = require('./encryption')
const jwt = require('jsonwebtoken')
const config = require('../../../common/config')

const Schema = mongoose.Schema

const UserSchema = new Schema({
  email: {
    type: String,
    unique: true,
    required: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  is_confirmed: {
    type: Boolean,
    default: true,
  },
  first_name: {
    type: String,
    required: true,
    lowercase: true,
  },
  last_name: {
    type: String,
    required: true,
    lowercase: true,
  },
  country_code: {
    type: String,
  },
  tokens: [{
    access: {
      type: String,
      required: true,
    },
    token: {
      type: String,
      required: true,
    },
  }],
})

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret.tokens
    delete ret.__v
    delete ret._id
    delete ret.password
  },
})

UserSchema.methods.generateAuthToken = function () {
  const user = this
  const access = 'auth'
  const token = jwt.sign({ _id: user._id.toHexString(), access }, config.JWT_SECRET).toString()
  user.tokens.push({ access, token })
  return user.save().then(() => token)
}

UserSchema.methods.removeToken = function (token) {
  const user = this
  return user.update({
    $pull: {
      tokens: { token },
    },
  })
}

UserSchema.statics.findByToken = function (token) {
  const User = this
  let decoded
  try {
    decoded = jwt.verify(token, config.JWT_SECRET)
  } catch (e) {
    return Promise.reject()
  }
  return User.findOne({
    _id: decoded._id,
    'tokens.token': token,
    'tokens.access': 'auth',
  })
}


UserSchema.pre('save', function (next) {
  const user = this
  if (user.isModified('password')) {
    bcryptTextAsync(user.password).then(hash => {
      user.password = hash
      next()
    })
  } else {
    next()
  }
})

UserSchema.statics.findByCredentials = function (email, password) {
  const User = this
  return User.findOne({ email }).then(user => {
    if (!user) {
      return Promise.reject()
    }
    return bcryptCompareAsync(password, user.password).then(() => user)
  })
}

module.exports = mongoose.model('user', UserSchema)
