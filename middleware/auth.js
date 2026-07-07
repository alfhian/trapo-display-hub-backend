import jwt from 'jsonwebtoken'

const getJwtSecret = () => {
  if (!process.env.JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured')
  }
  return process.env.JWT_SECRET
}

const getBearerToken = (req) => {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null
  return authHeader.split(' ')[1]
}

export const requireAuth = (req, res, next) => {
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'missing_or_invalid_token' })
  }

  try {
    req.user = jwt.verify(token, getJwtSecret())
    next()
  } catch (error) {
    console.error('JWT verification failed:', error.message)
    return res.status(401).json({ error: 'invalid_token' })
  }
}

export const requireAdmin = (req, res, next) => {
  const token = getBearerToken(req)
  if (!token) {
    return res.status(401).json({ error: 'missing_or_invalid_token' })
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret())
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'forbidden' })
    }

    req.user = decoded
    next()
  } catch (error) {
    console.error('Admin auth error:', error.message)
    return res.status(401).json({ error: 'invalid_token' })
  }
}
