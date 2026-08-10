import 'dotenv/config'
import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import screenRoutes from './routes/screen-routes.js'
import loginRoutes from './routes/auth-routes.js'
import serviceTypeRoutes from './routes/service-type-routes.js'

const app = express()
const server = http.createServer(app)

const allowedOrigins = [
  ...(process.env.FRONTEND_ORIGIN || '').split(','),
  ...(process.env.CORS_ALLOWED_ORIGIN || '').split(','),
]
  .map((origin) => origin.trim())
  .filter(Boolean)

const corsOptions = {
  origin(origin, callback) {
    if (!origin || allowedOrigins.length === 0 || allowedOrigins.includes(origin)) {
      callback(null, true)
      return
    }
    callback(new Error('Not allowed by CORS'))
  },
  methods: ['GET', 'POST', 'PATCH', 'OPTIONS'],
  credentials: true,
}

export const io = new Server(server, {
  cors: corsOptions,
})

app.use(cors(corsOptions))
app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', loginRoutes)
app.use('/api', screenRoutes)
app.use('/api', serviceTypeRoutes)

io.on('connection', (socket) => {
  console.info('Socket connected:', socket.id)

  socket.on('join_screen', (screenId) => {
    socket.join(`screen:${screenId}`)
    console.info(`${socket.id} joined room screen:${screenId}`)
  })

  socket.on('disconnect', () => {
    console.info('Socket disconnected:', socket.id)
  })
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.info(`Server running on port ${PORT}`))
