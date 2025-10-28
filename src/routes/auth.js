import express from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import url from 'url';


const router = express.Router();
const { Pool } = pkg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });


// === (Optional fallback) load keys directly if app.get('jwt_keys') is unavailable ===
let PRIVATE_FALLBACK = null;
let PUBLIC_FALLBACK = null;
try {
  PRIVATE_FALLBACK = fs.readFileSync(
    path.join(__dirname, "..", "..", "api", "jwt_private.pem"),
    "utf8"
  );
  PUBLIC_FALLBACK = fs.readFileSync(
    path.join(__dirname, "..", "..", "api", "keys", "jwt_public.pem"),
    "utf8"
  );
  console.log("[AUTH] Local keypair loaded as fallback.");
} catch {}



//helper to sign a JWT using whichever private key is available
function signAccessToken(user, ADMIN_PRIVATE = PRIVATE_FALLBACK) {
  const payload = {
    sub: user.id,
    username: user.username,
    role: user.role || "user",
  };
  return jwt.sign(payload, ADMIN_PRIVATE, {
    algorithm: "RS256",
    expiresIn: "8h",
    issuer: "tvdash",
    audience: "tvdash-api",
  });
}

//register
router.post("/register", async (req, res) => {
  const { username, password, role = "user" } = req.body || {};
  if (!username || !password)
    return res.status(400).json({ error: "username/password required" });

  try {
    // ensure users table exists
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        username text UNIQUE NOT NULL,
        password_hash text NOT NULL,
        role text DEFAULT 'user',
        created_at timestamptz DEFAULT now()
      );
    `);

    const { rows: exists } = await pool.query(
      "SELECT 1 FROM users WHERE lower(username)=lower($1)",
      [username]
    );
    if (exists.length)
      return res.status(409).json({ error: "user_exists" });

    const hash = await bcrypt.hash(password, 10);
    const insert = await pool.query(
      "INSERT INTO users (username,password_hash,role) VALUES ($1,$2,$3) RETURNING id,username,role",
      [username, hash, role]
    );

        const user = insert.rows[0];
    // try to get the private key from main app if available
    const { ADMIN_PRIVATE } = req.app.get("jwt_keys") || {};
    const token = signAccessToken(user, ADMIN_PRIVATE);
    res.json({
      ok: true,
      user: { id: user.id, username: user.username, role: user.role },
      access_token: token,
      token_type: "Bearer",
    });
  } catch (e) {
    console.error("[register]", e.message);
    res.status(500).json({ error: "server_error" });
  }
});

router.post('/login', async (req, res) => {
  try {
  const { username, password } = req.body;

  /*basic check (fake user)
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

//verify current user
router.get("/me", async (req, res) => {
 try {
  const auth = req.headers.authorization || "";
  const token = aut.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({error: "missing bearer token" });

  const payload = jwt.verify(token, PublicKeyCredential, { algorithms: ["RS256"] });
  res.json({ sub: payload.sub, username: payload.username, role: payload.role });
 } catch (e) {
  res.status(401).json({ error: "invalid token" });
 }
})

export default router;
