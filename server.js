import dotenv from 'dotenv'
dotenv.config()

// import modul lain SETELAH dotenv selesai
const startServer = async () => {
  const express = (await import('express')).default
  const cors = (await import('cors')).default
  const screenRoutes = (await import('./routes/screen-routes.js')).default
  const loginRoutes = (await import('./routes/auth-routes.js')).default

  const app = express()
  app.use(cors({
    origin: ['http://localhost:5173', 'http://103.75.26.86:5173'],
    credentials: true,
  }))
  app.use(express.json())

  app.use('/api/auth', loginRoutes)
  app.use('/api', screenRoutes)

  const PORT = process.env.PORT || 3000
  console.log('🌐 DATABASE_URL:', process.env.DATABASE_URL)
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
}

startServer()
