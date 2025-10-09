const router = require('express').Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

router.post('/login', async (req, res) => {
  const { username, password } = req.body;

  // basic check (fake user for now)
  if (username !== 'admin' || password !== 'secret') {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const { ADMIN_PRIVATE } = req.app.get('jwt_keys');
  const token = jwt.sign(
    { sub: 'admin-1', role: 'admin' },
    ADMIN_PRIVATE,
    { algorithm: 'RS256', expiresIn: '8h' }
  );

  res.json({ token, expiresIn: '8h' });
});

module.exports = router;
