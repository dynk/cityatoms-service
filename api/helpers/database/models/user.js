const mongoose = require('mongoose')
const { bcryptTextAsync, bcryptCompareAsync } = require('./encryption')

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
})

UserSchema.set('toJSON', {
  transform: (doc, ret) => {
    ret.id = ret._id
    delete ret.__v
    delete ret._id
    delete ret.password
  },
})

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
