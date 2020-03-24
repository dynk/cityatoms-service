const bcrypt = require('bcryptjs')

function bcryptText(text) {
  const salt = bcrypt.genSaltSync(10)
  return bcrypt.hashSync(text, salt)
}

function bcryptTextAsync(text) {
  return new Promise(resolve => {
    bcrypt.genSalt(10, (err, salt) =>
      bcrypt.hash(text, salt,
        (_, hash) => resolve(hash)))
  })
}

function bcryptCompareAsync(password, userPassword) {
  return new Promise((resolve, reject) => {
    bcrypt.compare(password, userPassword, (err, res) => {
      if (res) {
        resolve(true)
      } else {
        reject(new Error('Password incorrect!'))
      }
    })
  })
}


module.exports = {
  bcryptText,
  bcryptTextAsync,
  bcryptCompareAsync,
}
