import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcrypt';
import pkg from 'pg';

const router = express.Router();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

router.post('/login', async (req, res) => {
  try {
  const { username, password } = req.body;

  /* basic check (fake user)
  if (username !== 'admin' || password !== 'secret') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }*/

  //empty username and pass
  if (!username || !password) {
      return res.status(400).json({ error: 'username and password required' });
    }

  // find the user in DB
  const { rows } = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  const user = rows[0];

  //wrong credential
  if (!user) {
      return res.status(401).json({ error: 'invalid credentials' });
    }

  // check password
  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: 'invalid credentials' });
  }

  // generate JWT token
  const { ADMIN_PRIVATE } = req.app.get('jwt_keys');
  if (!ADMIN_PRIVATE) {
    return res.status(500).json({ error: 'server key missing' });
  }

  const token = jwt.sign(
    {
        sub: user.id,
        username: user.username,
        role: user.role
      },
      ADMIN_PRIVATE,
      { algorithm: 'RS256', expiresIn: '8h' }
    );

    res.json({
        token,
        expiresIn: '8h',
        user: { username: user.username, role: user.role }
    });

    res.json({ token, expiresIn: '8h' });
  } catch (err) {
    console.error('[AUTH ERROR]', err.message);
    res.status(500).json({ error: 'server_error' });
  }
});

export default router;
