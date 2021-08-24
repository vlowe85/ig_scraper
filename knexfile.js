require('dotenv').config()

module.exports = {
  production: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      timezone     : 'Z',
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    pool: {
      min: 2,
      max: 10,
    }
  },
  development: {
    client: 'mysql2',
    connection: {
      host: process.env.DB_HOST,
      timezone     : 'Z',
      database: process.env.DB_NAME,
      user: process.env.DB_USERNAME,
      password: process.env.DB_PASSWORD
    },
    migrations: {
      directory: __dirname + '/db/migrations'
    },
    pool: {
      min: 2,
      max: 10,
    }
  }


    


}