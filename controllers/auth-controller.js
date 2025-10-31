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
