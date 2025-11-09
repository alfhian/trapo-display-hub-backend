// middleware/auth.js
import jwt from 'jsonwebtoken'

// Ambil secret dari environment
const JWT_SECRET = process.env.JWT_SECRET || 'default_secret_key'

// Middleware umum: cek apakah user login
export const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization

  // Pastikan token ada dan formatnya benar
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_or_invalid_token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    // Verifikasi token
    const decoded = jwt.verify(token, JWT_SECRET)
    req.user = decoded // Simpan data user ke request
    next()
  } catch (error) {
    console.error('JWT verification failed:', error.message)
    return res.status(401).json({ error: 'invalid_token' })
  }
}

// Middleware khusus admin
export const requireAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'missing_or_invalid_token' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (decoded.role === 'admin' || decoded.role === 'user') {
      return res.status(403).json({ error: 'forbidden' })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error('Admin auth error:', error.message)
    return res.status(401).json({ error: 'invalid_token' })
  }
}
