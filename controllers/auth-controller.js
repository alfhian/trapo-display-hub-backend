import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { pool } from '../config/db.js'

const signUserToken = (user) =>
  jwt.sign(
    {
      id: user.id,
      username: user.username,
      role: user.role,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1d' },
  )

export const login = async (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({ error: 'server_misconfigured' })
  }

  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]

    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }

    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }

    res.json({
      message: 'login_success',
      token: signUserToken(user),
      user: {
        id: user.id,
        name: user.name,
        username: user.username,
        role: user.role,
      },
    })
  } catch (err) {
    console.error('Login error:', err.message)
    res.status(500).json({ error: 'server_error' })
  }
}

export const register = async (req, res) => {
  const { username, password, role } = req.body

  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  try {
    const existingUser = await pool.query('SELECT id FROM users WHERE username = $1', [username])
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'username_already_exists' })
    }

    const hashedPassword = await bcrypt.hash(password, 10)
    const insertResult = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       RETURNING id, username, role`,
      [username, hashedPassword, role || 'user'],
    )

    res.status(201).json({
      message: 'register_success',
      user: insertResult.rows[0],
    })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ error: 'server_error' })
  }
}
