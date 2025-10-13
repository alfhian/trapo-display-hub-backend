import 'dotenv/config';
import fs from 'fs';
import http from 'http';
import path from 'path';
import url from 'url';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import jwt from 'jsonwebtoken';
import pkg from 'pg';
import { Server } from 'socket.io';
import authRoutes from '../src/routes/auth.js';
import crypto from 'crypto';

const __dirname = path.dirname(url.fileURLToPath(import.meta.url));

const {
  PORT = 3000,
  DATABASE_URL = process.env.DATABASE_URL,
  CORS_ALLOWED_ORIGIN = 'https://uncombated-nonvasculose-vanita.ngrok-free.dev',
  JWT_PUBLIC_KEY_PATH = path.join(__dirname, 'keys', 'jwt_public.pem')
} = process.env;

const app = express();
app.use(helmet());
app.use(express.json({ limit: '256kb' }));
app.use(cors({ origin: CORS_ALLOWED_ORIGIN }));
app.use('/auth', authRoutes);

const { Pool } = pkg;
const pool = new Pool({ connectionString: DATABASE_URL, application_name: 'tvdash-api' //check pg_stat 
 });

// Boot-time probe (non-fatal, with retry)
(async () => {
  let attempts = 0;
  while (attempts < 5) {
    try {
      const r = await pool.query('select now() as ts, version() as v');
      console.log('[DB] Connected:', r.rows[0].ts, '|', r.rows[0].v.split('\n')[0]);
      return;
    } catch (err) {
      attempts++;
      console.error(`[DB] Connection failed (attempt ${attempts}/5):`, err.message);
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.warn('[DB] Still down after retries; continuing to serve HTTP. /health/db will show status.');
})();

// Cache in-memory untuk 1 node
const memCache = new Map(); // screenId -> payload

// ====== JWT keys ======
const privateKeyPath = path.join(__dirname, 'jwt_private.pem');          // in api/
const publicKeyPath  = path.join(__dirname, 'keys', 'jwt_public.pem');   // in api/keys/

let ADMIN_PRIVATE, ADMIN_PUBLIC;

try {
  ADMIN_PRIVATE = fs.readFileSync(privateKeyPath);
  ADMIN_PUBLIC  = fs.readFileSync(publicKeyPath);
  console.log('[JWT] Keys loaded.');
} catch (err) {
  console.error('[JWT] Failed to load key files:', err.message);
}

function shortHash(buf) {
  return crypto.createHash('sha256').update(buf).digest('hex').slice(0,16);
}
console.log('[JWT] private fingerprint:', shortHash(ADMIN_PRIVATE));
console.log('[JWT] public  fingerprint:', shortHash(ADMIN_PUBLIC));

app.set('jwt_keys', { ADMIN_PRIVATE, ADMIN_PUBLIC });

// Serve halaman TV
app.use('/screen', express.static(path.join(__dirname, '..', 'web')));

// serve the same HTML for any id
app.get('/screen/:id', (_req, res) => {
  res.sendFile(path.join(__dirname, '..', 'web', 'screen.html'));
});

// JWT admin middleware
function requireAdmin(req, res, next) {
  try {
    const auth = req.headers.authorization || '';
    const token = auth.startsWith('Bearer ') ? auth.slice(7) : null;
    if (!token) return res.status(401).json({ error: 'missing bearer token' });

    // Use the key stored on the app (already loaded at startup)
    const { ADMIN_PUBLIC } = req.app.get('jwt_keys') || {};
    if (!ADMIN_PUBLIC) return res.status(500).json({ error: 'server key missing' });

    const payload = jwt.verify(token, ADMIN_PUBLIC, { algorithms: ['RS256'] });
    if (payload.role !== 'admin') return res.status(403).json({ error: 'forbidden' });

    req.admin = payload;
    next();
  } catch (err) {
    console.error('[requireAdmin]', err.message);
    return res.status(401).json({ error: 'invalid token' });
  }
}

async function getLatestPayload(screenId) {
  if (memCache.has(screenId)) return memCache.get(screenId);
  const { rows } = await pool.query('select payload from screen_payloads where screen_id = $1', [screenId]);
  const payload = rows[0]?.payload || null;
  if (payload) memCache.set(screenId, payload);
  return payload;
}

async function persistPayload(screenId, payload, actor = 'admin') {
  await pool.query(`
    insert into screen_payloads (screen_id, payload, updated_at)
    values ($1, $2, now())
    on conflict (screen_id) do update set payload = excluded.payload, updated_at = now()
  `, [screenId, payload]);

  await pool.query(`
    insert into assignment_events (screen_id, payload, actor)
    values ($1, $2, $3)
  `, [screenId, payload, actor]);

  memCache.set(screenId, payload);
}

// TV cold-load
app.get('/screens/:id/current', async (req, res) => {
  try {
    const payload = await getLatestPayload(req.params.id);
    res.json({ screenId: req.params.id, payload, ts: Date.now() });
  } catch {
    res.status(500).json({ error: 'server_error' });
  }
});

// List all screens 
app.get('/screens', requireAdmin, async (_req, res) => {
  try {
    const { rows } = await pool.query('SELECT id, name FROM screens ORDER BY id');
    res.json(rows);
  } catch (e) {
    console.error('List screens error:', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});

app.get('/stats', requireAdmin, async (req, res) => {
  try {
    const r1 = await pool.query('SELECT COUNT(*) AS screens FROM screens');
    const r2 = await pool.query('SELECT COUNT(*) AS users FROM users');
    const r3 = await pool.query('SELECT COUNT(*) AS assignments FROM assignment_logs');
    const r4 = await pool.query('SELECT MAX(created_at) AS last_update FROM assignment_logs');

    res.json({
      screens: parseInt(r1.rows[0].screens),
      users: parseInt(r2.rows[0].users),
      assignments: parseInt(r3.rows[0].assignments),
      last_update: r4.rows[0].last_update
    });
  } catch (e) {
    res.status(500).json({ error: 'server_error' });
  }
});


// Admin assign
app.post('/screens/:id/assign', requireAdmin, async (req, res) => {
  const { customer, plate, eta, brand, type, service } = req.body || {};  
  if (!customer || !plate || !eta) {
    return res.status(400).json({ error: 'missing fields: customer, plate, eta' });
  }
  try {
    const payload = { customer, plate, eta, brand, type, service };
    await persistPayload(req.params.id, payload, req.admin?.sub || 'admin');
    io.to(`screen:${req.params.id}`).emit('screen:update', { screenId: req.params.id, payload });
    res.json({ ok: true });
    await pool.query(
    'INSERT INTO assignment_logs (screen_id, user_id, payload) VALUES ($1, $2, $3)',
    [req.params.id, req.admin?.sub || null, payload]
);
  } catch {
    res.status(500).json({ error: 'server_error' });
  }
});

const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: CORS_ALLOWED_ORIGIN, methods: ['GET', 'POST'] }
});

io.use(async (socket, next) => {
  try {
    const { screenId, token } = socket.handshake.auth || {};
    if (!screenId || !token) return next(new Error('missing screenId/token'));
    const { rows } = await pool.query(
      'select 1 from screen_tokens where screen_id = $1 and token = $2 and active = true',
      [screenId, token]
    );
    if (!rows.length) return next(new Error('unauthorized'));
    socket.data.screenId = screenId;
    socket.join(`screen:${screenId}`);
    next();
  } catch {
    next(new Error('auth_error'));
  }
});

io.on('connection', async (socket) => {
  const screenId = socket.data.screenId;
  const latest = await getLatestPayload(screenId);
  if (latest) socket.emit('screen:update', { screenId, payload: latest });
});

app.get('/health', (_req, res) => res.json({ ok: true }));

server.listen(PORT, () => console.log(`API+WEB listening on :${PORT}`));

//list tables
app.get('/debug/db-tables', async (_req, res) => {
  try {
    const r = await pool.query(`
      select table_name
      from information_schema.tables
      where table_schema='public'
      order by table_name
    `);
    res.json({ ok: true, tables: r.rows.map(x => x.table_name) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

//screen history
app.get('/screens/:id/history', requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { rows } = await pool.query(
      `SELECT id, payload, created_at
       FROM assignment_logs
       WHERE screen_id = $1
       ORDER BY created_at DESC
       LIMIT 50`, [id]
    );
    res.json(rows);
  } catch (e) {
    console.error('screen history error:', e.message);
    res.status(500).json({ error: 'server_error' });
  }
});


//aware health
app.get('/health/db', async (_req, res) => {
  try {
    const r = await pool.query('select now() as now, current_database() as db, current_user as usr');
    res.json({ ok: true, db: 'up', info: r.rows[0] });
  } catch (e) {
    res.status(500).json({ ok: false, db: 'down', error: e.message });
  }
});