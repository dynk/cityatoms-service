/* eslint-disable max-len */
/* eslint-disable import/no-extraneous-dependencies */
const hooks = require('hooks')
const rp = require('request-promise')
const should = require('should')
const YAML = require('yamljs')
const uuid = require('uuid')

const AUTH_TOKEN_HEADER_NAME = 'x-auth-token'
const AUTH_TOKEN_HEADER_VALUE = process.env.AUTH_TOKEN || 'test'

const CITYATOMS_AUTH_TOKEN_HEADER_NAME = 'x-cityatom-auth-token'
const CITYATOMS_AUTH_TOKEN_HEADER_VALUE = process.env.AUTH_TOKEN || 'test'

const BACKOFFICE_AUTH_TOKEN_HEADER_NAME = 'x-backoffice-auth-token'
const BACKOFFICE_AUTH_TOKEN_HEADER_VALUE = process.env.BACKOFFICE_AUTH_TOKEN || 'test'

const { endpoint, only } = YAML.load(`${__dirname}/../../dredd.yml`)

const createdDatapointsIds = []
const createdUsers = []

const defaultInstanceId = '12345'

const createUser = (instance_id = uuid()) =>
  rp(`${endpoint}/api/v1/me/users`, {
    method: 'POST',
    json: true,
    body: { instance_id },
    headers: {
      [CITYATOMS_AUTH_TOKEN_HEADER_NAME]: CITYATOMS_AUTH_TOKEN_HEADER_VALUE,
      'x-audit': `createUser ${instance_id}`,
    },
  })
    .then(res => {
      createdUsers.push(res.id)
      return res
    })

const createDatapoint = body =>
  rp(`${endpoint}/api/v1/backoffice/datapoints`, {
    method: 'POST',
    json: true,
    body,
    headers: {
      [BACKOFFICE_AUTH_TOKEN_HEADER_VALUE]: BACKOFFICE_AUTH_TOKEN_HEADER_NAME,
      'x-audit': `createDatapoint ${body.instance_id}`,
    },
  })
    .then(res => {
      createdDatapointsIds.push(res.id)
      return res
    })

const needToSkip = transaction => {
  if (only && only.length > 0 && only.indexOf(transaction.name) === -1) {
    return true
  }
  if ((transaction.test && transaction.test.status === 'fail')
    || transaction.skip) {
    return true
  }
  return false
}

hooks.before('/api/v1/me/users > GET > 200', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    transaction.request.headers[AUTH_TOKEN_HEADER_NAME] = instance_id
    transaction.request.headers[CITYATOMS_AUTH_TOKEN_HEADER_NAME] = CITYATOMS_AUTH_TOKEN_HEADER_VALUE
    transaction.request.headers['x-audit'] = '/api/v1/me/users > GET > 200'
    done()
  })
})

hooks.before('/api/v1/me/users > POST > 201', transaction => {
  transaction.request.headers[CITYATOMS_AUTH_TOKEN_HEADER_NAME] = CITYATOMS_AUTH_TOKEN_HEADER_VALUE
  const body = JSON.parse(transaction.request.body)
  transaction.request.body = JSON.stringify({ ...body, instance_id: uuid() })
  transaction.request.headers['x-audit'] = '/api/v1/me/users > POST > 201'
})

hooks.before('/api/v1/me/users > PUT > 200', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    transaction.request.headers[AUTH_TOKEN_HEADER_NAME] = instance_id
    transaction.request.headers[CITYATOMS_AUTH_TOKEN_HEADER_NAME] = CITYATOMS_AUTH_TOKEN_HEADER_VALUE
    const body = JSON.parse(transaction.request.body)
    transaction.request.body = JSON.stringify({ ...body, first_name: 'put_name' })
    transaction.request.headers['x-audit'] = '/api/v1/me/users > PUT > 200'
    done()
  })
})

hooks.before('/api/v1/me/datapoints > POST > 201', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    transaction.request.headers[AUTH_TOKEN_HEADER_NAME] = instance_id
    transaction.request.headers[CITYATOMS_AUTH_TOKEN_HEADER_NAME] = CITYATOMS_AUTH_TOKEN_HEADER_VALUE
    transaction.request.headers['x-audit'] = '/api/v1/me/datapoints > POST > 201'
    done()
  })
})

hooks.before('/api/v1/me/datapoints > GET > 200', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    transaction.request.headers[AUTH_TOKEN_HEADER_NAME] = instance_id
    transaction.request.headers[CITYATOMS_AUTH_TOKEN_HEADER_NAME] = CITYATOMS_AUTH_TOKEN_HEADER_VALUE
    transaction.request.headers['x-audit'] = '/api/v1/me/datapoints > POST > 201'
    done()
  })
})

hooks.before('/api/v1/me/batch/datapoints > POST > 201', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    transaction.request.headers[AUTH_TOKEN_HEADER_NAME] = instance_id
    transaction.request.headers[CITYATOMS_AUTH_TOKEN_HEADER_NAME] = CITYATOMS_AUTH_TOKEN_HEADER_VALUE
    const body = JSON.parse(transaction.request.body)
    transaction.request.body = JSON.stringify([{ ...body, lat: 20, lon: 20, time: '2020-01-01T00:00:00.123Z', instance_id, symptom_scores: { cough: 1 } }])
    transaction.request.headers['x-audit'] = '/api/v1/me/batch/datapoints > POST > 201'
    done()
  })
})

hooks.before('/api/v1/backoffice/users > GET > 200', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    transaction.request.headers[BACKOFFICE_AUTH_TOKEN_HEADER_NAME] = BACKOFFICE_AUTH_TOKEN_HEADER_VALUE
    transaction.request.headers['x-audit'] = '/api/v1/backoffice/users > GET > 200'
    done()
  })
})

hooks.before('/api/v1/backoffice/users > POST > 201', (transaction, done) => {
  const instance_id = uuid()
  const body = JSON.parse(transaction.request.body)
  transaction.request.body = JSON.stringify({ ...body, instance_id })
  transaction.request.headers[BACKOFFICE_AUTH_TOKEN_HEADER_NAME] = BACKOFFICE_AUTH_TOKEN_HEADER_VALUE
  transaction.request.headers['x-audit'] = '/api/v1/backoffice/users > POST > 201'
  done()
})

hooks.before('/api/v1/backoffice/users/{userId} > GET > 200', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(user => {
    transaction.request.headers[BACKOFFICE_AUTH_TOKEN_HEADER_NAME] = BACKOFFICE_AUTH_TOKEN_HEADER_VALUE
    transaction.fullPath = transaction.fullPath.replace('USERID', user.id)
    transaction.request.headers['x-audit'] = '/api/v1/backoffice/users > GET > 200'
    done()
  })
})

hooks.before('/api/v1/backoffice/users/{userId} > PUT > 200', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(user => {
    transaction.request.headers[BACKOFFICE_AUTH_TOKEN_HEADER_NAME] = BACKOFFICE_AUTH_TOKEN_HEADER_VALUE
    transaction.fullPath = transaction.fullPath.replace('USERID', user.id)
    const body = JSON.parse(transaction.request.body)
    transaction.request.body = JSON.stringify({ ...body, instance_id, first_name: 'someName' })
    transaction.request.headers['x-audit'] = '/api/v1/backoffice/users > PUT > 200'
    done()
  })
})


hooks.before('/api/v1/backoffice/datapoints > GET > 200', (transaction, done) => {
  transaction.request.headers[BACKOFFICE_AUTH_TOKEN_HEADER_NAME] = BACKOFFICE_AUTH_TOKEN_HEADER_VALUE
  transaction.request.headers['x-audit'] = '/api/v1/backoffice/datapoints > GET > 200'
  done()
})

hooks.before('/api/v1/backoffice/datapoints > POST > 201', (transaction, done) => {
  const instance_id = uuid()
  return createUser(instance_id).then(() => {
    const body = JSON.parse(transaction.request.body)
    transaction.request.body = JSON.stringify({ ...body, lat: 20, lon: 20, time: '2020-01-01T00:00:00.123Z', instance_id, symptom_scores: { cough: 1 } })
    transaction.request.headers[BACKOFFICE_AUTH_TOKEN_HEADER_NAME] = BACKOFFICE_AUTH_TOKEN_HEADER_VALUE
    transaction.request.headers['x-audit'] = '/api/v1/backoffice/datapoints > POST > 201'
    done()
  })
})
