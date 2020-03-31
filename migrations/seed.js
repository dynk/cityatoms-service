/* eslint-disable import/no-extraneous-dependencies */
const csv = require('csvtojson')
const moment = require('moment')
const Queue = require('async/queue')
const rp = require('request-promise')
const fs = require('fs')

const { log: logInfo, error: logError } = console
const CITYATOM_SERVICE_URL = 'http://localhost:3000'
const CITYATOM_BACKOFFICE_HEADER = 'x-backoffice-auth-token'
const CITYATOM_BACKOFFICE_AUTH_TOKEN = 'test'
const AUDIT_HEADER = 'x-audit'
const AUDIT_ACTOR = 'migration:corona'
const CSV_FILE_PATH = './cityatom.csv'

const delay = (time = 3000) => new Promise(resolve => setTimeout(() => resolve(), time))

const PARALLEL_WORKER_COUNT = 10
const getPointsCSV = csvFilePath => csv()
  .fromFile(csvFilePath)


const createDatapoint = body => rp(`${CITYATOM_SERVICE_URL}/api/v1/backoffice/datapoints/`, {
  method: 'POST',
  json: true,
  body,
  headers: {
    [CITYATOM_BACKOFFICE_HEADER]: CITYATOM_BACKOFFICE_AUTH_TOKEN,
    [AUDIT_HEADER]: AUDIT_ACTOR,
  },
}).then(({ id }) => ({ id })).catch(error => Promise.reject({ error, body }))


const handleFSError = err => {
  if (err) logError(err)
}

const run = async () => {
  try {
    const rawPoints = await getPointsCSV(CSV_FILE_PATH)
    const points = rawPoints.map(({
      imei,
      lat,
      lon,
      time: time_utc,
      time2: time,
      throat,
      cough,
      fever,
      smell,
      breathing,
      pneumonia,
      c19,
      hospital,
      score,
    }) => ({
      imei,
      lat: parseFloat(lat),
      lon: parseFloat(lon),
      time: moment(time).toISOString(),
      time_utc: parseInt(time_utc, 10),
      symptom_scores: {
        throat: parseInt(throat, 10),
        cough: parseInt(cough, 10),
        fever: parseInt(fever, 10),
        smell: parseInt(smell, 10),
        breathing: parseInt(breathing, 10),
        pneumonia: parseInt(pneumonia, 10),
        c19: parseInt(c19, 10),
        hospital: parseInt(hospital, 10),
        score: parseInt(score, 10),
      },
    }))
    const success = []
    const fails = []
    const queue = Queue((update, callback) => {
      delay().then(() => createDatapoint(update)
        .then(result => callback({ result }))
        .catch(({ error, user }) => callback({ error, result: user })))
    }, PARALLEL_WORKER_COUNT)
    queue.push(points, ({ error, result }) => {
      if (error) {
        logError('ERROR !!! ', JSON.stringify(error))
        return fails.push({ error, result })
      }
      logInfo('succes ', result)
      return success.push(result)
    })
    await queue.drain()
    fs.writeFile(`${__dirname}/succes.txt`, JSON.stringify(success), handleFSError)
    fs.writeFile(`${__dirname}/fail.txt`, JSON.stringify(fails), handleFSError)
  } catch (e) {
    logError(e)
  }
}

run()
