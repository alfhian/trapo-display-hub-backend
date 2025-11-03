import pkg from 'pg'
import dotenv from 'dotenv'
dotenv.config()

const { Pool } = pkg

export const pool = new Pool({
  user: 'tvdash',
  host: '127.0.0.1',
  database: 'tvdash',
  password: 'superSecret!', // <--- langsung isi string aslinya
  port: 5432,
})
