/* eslint-disable import/no-extraneous-dependencies */
/* eslint-disable prefer-arrow-callback */
require('../../../api/common/dot-env.js')
const should = require('should')
const request = require('supertest')
const { start, end } = require('../../../api/app')

let app
before(() => start().then(a => { app = a }))
after(() => end())

const BACKOFFICE_HEADER = 'x-backoffice-auth-token'
const BACKOFFICE_TOKEN = 'test'
const defaultDatapoint = {
  imei: '11111',
  lat: 20,
  lon: 20,
  time: '2019-05-07T15:22:08.300Z',
  symptom_scores: {
    cough: 1,
  },
}

describe('Backoffice', function () {
  describe('GET /backoffice/datapoints', function () {
    it('having no x-auth-token or x-cityatom-auth-token it should fail with 403', function (done) {
      request(app)
        .get('/api/v1/backoffice/datapoints')
        .set('Accept', 'application/json')
        .set('x-audit', 'test')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err) {
          should.not.exist(err)
          done()
        })
    })
  })
  describe('POST /backoffice/datapoints', function () {
    it('having no x-auth-token or x-cityatom-auth-token it should fail with 403', function (done) {
      request(app)
        .post('/api/v1/backoffice/datapoints')
        .set('Accept', 'application/json')
        .set('x-audit', 'test')
        .expect('Content-Type', /json/)
        .expect(403)
        .end(function (err) {
          should.not.exist(err)
          done()
        })
    })
    it('having no body it should fail with 400', function (done) {
      request(app)
        .post('/api/v1/backoffice/datapoints')
        .set('Accept', 'application/json')
        .set('x-audit', 'test')
        .set(BACKOFFICE_HEADER, BACKOFFICE_TOKEN)
        .expect('Content-Type', /json/)
        .expect(400)
        .end(function (err) {
          should.not.exist(err)
          done()
        })
    })

    it('it should post datapoint', function (done) {
      request(app)
        .post('/api/v1/backoffice/datapoints')
        .set('Accept', 'application/json')
        .set('x-audit', 'test')
        .set(BACKOFFICE_HEADER, BACKOFFICE_TOKEN)
        .send(defaultDatapoint)
        .expect('Content-Type', /json/)
        .expect(201)
        .end(function (err) {
          should.not.exist(err)
          done()
        })
    })
  })
})
