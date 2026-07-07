import { pool } from '../config/db.js'
import { io } from '../server.js'

const FALLBACK_ADMIN_ID = '00000000-0000-0000-0000-000000000000'
const uuidPattern = /^[0-9a-fA-F-]{36}$/

const normalizeAdminId = (adminId) =>
  adminId && uuidPattern.test(adminId) ? adminId : FALLBACK_ADMIN_ID

export const getAllScreens = async () => {
  const query = `
    SELECT
      a.id as screen_id,
      b.id,
      b.customer_name,
      b.brand,
      b.type,
      b.license_plate,
      b.year,
      b.service,
      b.estimated_time
    FROM screens AS a
    LEFT JOIN LATERAL (
      SELECT *
      FROM screen_display
      WHERE screen_id = a.id AND is_active = true
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    ) AS b ON true
    ORDER BY a.id
  `
  const { rows } = await pool.query(query)
  return rows
}

export const assignDisplayService = async ({
  screenId,
  customer_name,
  brand,
  type,
  year,
  license_plate,
  service,
  estimated_time,
  adminId,
}) => {
  const client = await pool.connect()
  const safeAdminId = normalizeAdminId(adminId)

  try {
    await client.query('BEGIN')

    const screenLock = await client.query(
      'SELECT id FROM screens WHERE id = $1::uuid FOR UPDATE',
      [screenId],
    )
    if (!screenLock.rows.length) throw new Error('Screen not found.')

    await client.query(
      `
        UPDATE screen_display
        SET is_active = false,
            updated_by = $2::uuid,
            updated_at = NOW()
        WHERE screen_id = $1::uuid
          AND is_active = true
      `,
      [screenId, safeAdminId],
    )

    const insertQuery = `
      INSERT INTO screen_display (
        screen_id,
        customer_name,
        brand,
        type,
        year,
        license_plate,
        service,
        estimated_time,
        is_active,
        created_by,
        created_at
      )
      VALUES (
        $1::uuid, $2::text, $3::text, $4::text, NULLIF($5, '')::int,
        $6::text, $7::text, $8::timestamptz,
        true, $9::uuid, NOW()
      )
      RETURNING *
    `

    const values = [
      screenId,
      customer_name,
      brand,
      type,
      year,
      license_plate,
      service,
      estimated_time,
      safeAdminId,
    ]

    const { rows } = await client.query(insertQuery, values)
    const result = rows[0]
    await client.query('COMMIT')

    io.to(`screen:${screenId}`).emit('screen:update', {
      screen_id: screenId,
      payload: result,
    })

    return result
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const removeDisplayService = async ({ targetId, adminId }) => {
  const client = await pool.connect()
  const safeAdminId = normalizeAdminId(adminId)

  try {
    await client.query('BEGIN')

    const screenResult = await client.query(
      `
        SELECT id
        FROM screens
        WHERE id = $1::uuid
        UNION
        SELECT screen_id AS id
        FROM screen_display
        WHERE id = $1::uuid
        LIMIT 1
      `,
      [targetId],
    )

    const screenId = screenResult.rows[0]?.id
    if (!screenId) throw new Error('Screen display not found.')

    await client.query('SELECT id FROM screens WHERE id = $1::uuid FOR UPDATE', [screenId])

    const { rows } = await client.query(
      `
        UPDATE screen_display
        SET is_active = false,
            updated_by = $2::uuid,
            updated_at = NOW()
        WHERE screen_id = $1::uuid
          AND is_active = true
        RETURNING *
      `,
      [screenId, safeAdminId],
    )

    await client.query('COMMIT')

    const result = rows[0] || { screen_id: screenId, is_active: false }
    io.to(`screen:${screenId}`).emit('screen:update', {
      screen_id: screenId,
      payload: { ...result, screen_id: screenId, is_active: false },
    })

    return { screen_id: screenId, affected: rows.length }
  } catch (error) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
  }
}

export const getScreenById = async (screenId) => {
  const query = `
    SELECT
      a.id as screen_id,
      b.id,
      b.customer_name,
      b.brand,
      b.type,
      b.license_plate,
      b.year,
      b.service,
      b.estimated_time,
      b.is_active
    FROM screens AS a
    LEFT JOIN LATERAL (
      SELECT *
      FROM screen_display
      WHERE screen_id = a.id AND is_active = true
      ORDER BY created_at DESC, id DESC
      LIMIT 1
    ) AS b ON true
    WHERE a.id = $1
    LIMIT 1
  `
  const { rows } = await pool.query(query, [screenId])
  return rows[0] || null
}
