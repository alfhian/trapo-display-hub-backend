import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { pool } from '../config/db.js'

// LOGIN CONTROLLER
export const login = async (req, res) => {
  const { username, password } = req.body
  console.log('📥 Login payload:', req.body)

  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  try {
    // Cek user berdasarkan username
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    const user = result.rows[0]

    console.log(user);
    

    if (!user) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }

    console.log('🔍 email:', username)
    console.log('🔍 password (plain from req):', password)
    console.log('🔍 user.password (from db):', user?.password)

    // Bandingkan password dengan hash dari database
    const passwordMatch = await bcrypt.compare(password, user.password)
    if (!passwordMatch) {
      return res.status(401).json({ error: 'invalid_credentials' })
    }

    // Generate JWT Token
    const token = jwt.sign(
      {
        id: user.id,
        username: user.username,
        role: user.role,
      },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    )

    res.json({
      message: 'login_success',
      token,
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


// REGISTER CONTROLLER
export const register = async (req, res) => {
  const { username, password, role } = req.body
  console.log('📥 Register payload:', req.body)

  if (!username || !password) {
    return res.status(400).json({ error: 'missing_fields' })
  }

  try {
    // 🔍 Cek apakah username sudah terdaftar
    const existingUser = await pool.query('SELECT * FROM users WHERE username = $1', [username])
    if (existingUser.rows.length > 0) {
      return res.status(409).json({ error: 'username_already_exists' })
    }

    // 🔐 Hash password sebelum disimpan
    const saltRounds = 10
    const hashedPassword = await bcrypt.hash(password, saltRounds)

    // 🧩 Simpan user baru
    const insertResult = await pool.query(
      `INSERT INTO users (username, password, role)
       VALUES ($1, $2, $3)
       RETURNING username, password, role`,
      [username, hashedPassword, role || 'user']
    )

    const newUser = insertResult.rows[0]

    res.status(201).json({
      message: 'register_success',
      user: newUser,
    })
  } catch (err) {
    console.error('Register error:', err.message)
    res.status(500).json({ error: 'server_error' })
  }
}