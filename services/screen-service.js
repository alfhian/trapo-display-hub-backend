import { pool } from '../config/db.js'
import { io } from '../server.js'

const screenId = ["00000000-0000-0000-0000-000000000002",
"00000000-0000-0000-0000-000000000001",
"00000000-0000-0000-0000-000000000003",
"00000000-0000-0000-0000-000000000004"];

export const getAllScreens = async () => {
	try {
    const query = `SELECT a.id as screen_id, b.id, b.customer_name, b.brand, b.type, b.license_plate, b.year, b.service, b.estimated_time
    FROM screens AS a
    LEFT JOIN screen_display AS b ON b.screen_id=a.id AND b.is_active=true
    ORDER BY a.id
    `
    const { rows } = await pool.query(query, []);
    return rows;
  } catch (e) {
    console.error('List screens error:', e.message);
    res.status(500).json({ error: 'server_error' });
  }
}


/**
 * Handle logic for assigning screen payload to database
 * and broadcasting updates via Socket.io
 */
// services/screen-service.js
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
  try {
    const safeAdminId =
      adminId && /^[0-9a-fA-F-]{36}$/.test(adminId)
        ? adminId
        : '00000000-0000-0000-0000-000000000000'

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
        true, -- ✅ selalu aktif kalau di-assign
        $9::uuid, NOW()
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
    const { rows } = await pool.query(insertQuery, values)
    const result = rows[0]

    // ✅ Emit ke dashboard
    io.to(`screen:${screenId}`).emit('screen:update', {
      screen_id: screenId,
      payload: result,
    })

    return result
  } catch (error) {
    console.error('❌ assignDisplayService error:', error)
    throw new Error('Failed to assign display: ' + error.message)
  }
}


export const removeDisplayService = async ({ screenDisplayId, adminId }) => {
  try {
    console.log('🧩 removeDisplayService called for:', screenDisplayId)

    // 1️⃣ Update is_active = false
    const updateQuery = `
      UPDATE screen_display
      SET is_active = false,
          updated_by = $2::uuid,
          updated_at = NOW()
      WHERE id = $1::uuid
      RETURNING *
    `
    const { rows } = await pool.query(updateQuery, [screenDisplayId, adminId])
    if (!rows.length) throw new Error('Screen display not found.')

    const result = rows[0]
    const screen_id = result.screen_id // ✅ ambil screen_id dari hasil query

    console.log('📤 Emitting update for:', screen_id)

    // 2️⃣ Emit ke semua client yang join screen room itu
    io.to(`screen:${screen_id}`).emit('screen:update', {
      screen_id, // pakai key ini supaya konsisten di frontend
      payload: { ...result, is_active: false },
    })

    return result
  } catch (error) {
    console.error('❌ removeDisplayService error:', error)
    throw new Error('Failed to deactivate display: ' + error.message)
  }
}


export const getScreenById = async (screenId) => {
  try {
    const query = `
      SELECT a.id as screen_id, b.id, b.customer_name, b.brand, b.type, b.license_plate, 
             b.year, b.service, b.estimated_time, b.is_active
      FROM screens AS a
      LEFT JOIN screen_display AS b ON b.screen_id = a.id 
        AND b.is_active = true
      WHERE a.id = $1
      LIMIT 1
    `
    const { rows } = await pool.query(query, [screenId])
    return rows[0] || null
  } catch (err) {
    console.error('getScreenById error:', err)
    throw err
  }
}