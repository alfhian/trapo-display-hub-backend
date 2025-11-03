import express from 'express'
import http from 'http'
import { Server } from 'socket.io'
import cors from 'cors'
import screenRoutes from './routes/screen-routes.js'
import loginRoutes from './routes/auth-routes.js'

const app = express()
const server = http.createServer(app)

export const io = new Server(server, {
  cors: {
    origin: [
      'http://localhost:5173',
      'http://127.0.0.1:5173',
      'https://uncombated-nonvasculose-vanita.ngrok-free.dev'
    ],
    methods: ['GET', 'POST', 'PATCH'],
    credentials: true,
  },
})

app.use(cors())
app.use(express.json())

// ⚠️ API routes di bawah ini
app.use('/api/auth', loginRoutes)
app.use('/api', screenRoutes)

// ⚙️ Socket event
io.on('connection', (socket) => {
  console.log('🟢 Socket connected:', socket.id)

  socket.on('join_screen', (screenId) => {
    socket.join(`screen:${screenId}`)
    console.log(`📺 ${socket.id} joined room: screen:${screenId}`)
  })

  socket.on('disconnect', () => {
    console.log(`🔴 Socket disconnected: ${socket.id}`)
  })
})

io.engine.on('connection', (rawSocket) => {
  console.log('🌐 Engine.io handshake from:', rawSocket.request.headers.origin)
})

const PORT = process.env.PORT || 3000
server.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`))
