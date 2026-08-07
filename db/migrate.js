// db/migrate.js
//
// Minimal SQL migration runner. No new dependency beyond what's already
// installed (pg, plus built-in fs/path/url).
//
// Convention: files in db/migrations/ are named with a zero-padded numeric
// prefix (0001_, 0002_, ...) and applied in plain lexicographic filename
// order. Each file is applied inside its own transaction and recorded in
// the schema_migrations table so it is never re-applied.
//
// Known limitations (deliberate, keeping this tool minimal):
// - No down/rollback migrations.
// - No checksum/drift detection on already-applied files — if a file that
//   was already applied is edited afterwards, the runner will not notice.
// - Statements that require running outside a transaction (e.g.
//   `CREATE INDEX CONCURRENTLY`) are not supported by this runner; none of
//   the current migrations need that.
//
// Usage: npm run migrate

import { readdirSync, readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import path from 'path'
import { pool } from '../config/db.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const MIGRATIONS_DIR = path.join(__dirname, 'migrations')

const ensureMigrationsTable = async (client) => {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      id serial PRIMARY KEY,
      name text NOT NULL UNIQUE,
      applied_at timestamptz NOT NULL DEFAULT now()
    )
  `)
}

const getAppliedNames = async (client) => {
  const { rows } = await client.query('SELECT name FROM schema_migrations')
  return new Set(rows.map((row) => row.name))
}

const getMigrationFiles = () =>
  readdirSync(MIGRATIONS_DIR)
    .filter((file) => file.endsWith('.sql'))
    .sort()

const runMigrations = async () => {
  const client = await pool.connect()

  try {
    await ensureMigrationsTable(client)
    const applied = await getAppliedNames(client)
    const files = getMigrationFiles()
    const pending = files.filter((file) => !applied.has(file))

    if (pending.length === 0) {
      console.info('No pending migrations.')
      return
    }

    for (const file of files) {
      if (applied.has(file)) {
        console.info(`skip (already applied): ${file}`)
        continue
      }

      const sql = readFileSync(path.join(MIGRATIONS_DIR, file), 'utf8')
      console.info(`applying: ${file}`)

      try {
        await client.query('BEGIN')
        // Plain string (no `values` array) uses pg's simple query protocol,
        // which allows a single call to run multiple `;`-separated statements.
        await client.query(sql)
        await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [file])
        await client.query('COMMIT')
        console.info(`applied: ${file}`)
      } catch (error) {
        await client.query('ROLLBACK')
        console.error(`FAILED: ${file}`)
        console.error(error)
        process.exitCode = 1
        return
      }
    }
  } finally {
    client.release()
    await pool.end()
  }
}

runMigrations()
