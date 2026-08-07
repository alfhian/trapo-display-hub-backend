import { pool } from '../config/db.js'

const UNIQUE_VIOLATION = '23505'

const tagDuplicateError = (error) => {
  if (error.code === UNIQUE_VIOLATION) {
    error.status = 409
  }
  return error
}

export const getAllServiceTypes = async ({ includeInactive = false } = {}) => {
  const query = includeInactive
    ? 'SELECT * FROM service_types ORDER BY label'
    : 'SELECT * FROM service_types WHERE is_active = true ORDER BY label'
  const { rows } = await pool.query(query)
  return rows
}

export const createServiceType = async ({ label, value, duration_minutes }) => {
  const finalValue = (value && value.trim()) || label.trim()

  try {
    const { rows } = await pool.query(
      `
        INSERT INTO service_types (label, value, duration_minutes)
        VALUES ($1, $2, $3)
        RETURNING *
      `,
      [label.trim(), finalValue, duration_minutes],
    )
    return rows[0]
  } catch (error) {
    throw tagDuplicateError(error)
  }
}

export const updateServiceType = async (id, { label, value, duration_minutes }) => {
  const finalValue = (value && value.trim()) || label.trim()

  try {
    const { rows } = await pool.query(
      `
        UPDATE service_types
        SET label = $2,
            value = $3,
            duration_minutes = $4,
            updated_at = now()
        WHERE id = $1::uuid AND is_active = true
        RETURNING *
      `,
      [id, label.trim(), finalValue, duration_minutes],
    )
    return rows[0] || null
  } catch (error) {
    throw tagDuplicateError(error)
  }
}

export const deactivateServiceType = async (id) => {
  const { rows } = await pool.query(
    `
      UPDATE service_types
      SET is_active = false,
          updated_at = now()
      WHERE id = $1::uuid AND is_active = true
      RETURNING *
    `,
    [id],
  )
  return rows[0] || null
}
