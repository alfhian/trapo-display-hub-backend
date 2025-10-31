import { pool } from '../config/db.js'

const screenId = ["00000000-0000-0000-0000-000000000002",
"00000000-0000-0000-0000-000000000001",
"00000000-0000-0000-0000-000000000003",
"00000000-0000-0000-0000-000000000004"];

export const getAllScreens = async () => {
	try {
    const query = `SELECT a.id, b.customer_name, b.brand, b.type, b.license_plate, b.year, b.service, b.etc
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
 * Assign customer payload to a screen and log the event
 */
export const assignDisplayService = async ({
  screenId,
  customerName,
  licensePlate,
  eta,
  brand,
  type,
  service,
  adminId,
}) => {
  const payload = { customerName, licensePlate, eta, brand, type, service }

  try {
    // 1️⃣ Simpan payload ke table screens (atau ke payload table tergantung desain DB)
    const updateQuery = `
      UPDATE screens 
      SET payload = $1, updated_at = NOW(), updated_by = $2
      WHERE id = $3
      RETURNING id, name
    `
    const { rows } = await pool.query(updateQuery, [payload, adminId, screenId])

    // 2️⃣ Broadcast ke socket room
    if (io) {
      io.to(`screen:${screenId}`).emit('screen:update', { screenId, payload })
    }

    // 3️⃣ Simpan log
    const insertLog = `
      INSERT INTO logs (screen_id, user_id, payload, created_at)
      VALUES ($1, $2, $3, NOW())
    `
    await pool.query(insertLog, [screenId, adminId, payload])

    return rows[0]
  } catch (error) {
    console.error('assignDisplayService error:', error)
    throw error
  }
}