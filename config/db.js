import pkg from 'pg'
const { Pool } = pkg

console.log('🔍 DATABASE_URL:', process.env.DATABASE_URL)

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: false // optional jika pakai service seperti Supabase/Render
})
