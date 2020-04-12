const Pool = require('pg').Pool
const config = require('../../common/config')

const pool = new Pool({
    user: config.POSTGRES_USER,
    host: config.POSTGRES_URI,
    database: config.POSTGRES_DB_NAME,
    password: config.POSTGRES_PWD,
    port: 5432,
})

module.exports = pool
