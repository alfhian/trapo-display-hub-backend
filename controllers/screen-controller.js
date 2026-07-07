import { getAllScreens, assignDisplayService, removeDisplayService, getScreenById as getScreenData  } from '../services/screen-service.js'

export const listScreens = async (req, res) => {
  try {
    const screens = await getAllScreens()
    res.json(screens)
  } catch (e) {
    console.error('List screens error:', e)
    res.status(500).json({ error: 'server_error' })
  }
}


/**
 * Assign or update screen display
 * Accepts exact payload from frontend (snake_case)
 */
export const assignDisplay = async (req, res) => {
  const { id } = req.params
  const {
    customer_name,
    brand,
    type,
    year,
    license_plate,
    service,
    estimated_time,
  } = req.body || {}

  try {
    const adminId = req.user?.id || 'admin'

    const result = await assignDisplayService({
      screenId: id,
      customer_name,
      brand,
      type,
      year,
      license_plate,
      service,
      estimated_time,
      adminId,
    })

    return res.status(201).json({
      ok: true,
      message: 'Display assigned successfully',
      data: result,
    })
  } catch (error) {
    console.error('❌ assignDisplay error:', error)
    return res.status(500).json({
      error: 'server_error',
      message: error.message || 'Internal server error',
    })
  }
}


export const removeDisplay = async (req, res) => {
  const { id } = req.params

  try {
    const adminId = req.user?.id || '00000000-0000-0000-0000-000000000000'

    const result = await removeDisplayService({ targetId: id, adminId })

    return res.status(200).json({
      ok: true,
      message: 'Screen displays deactivated successfully',
      data: result,
    })
  } catch (error) {
    console.error('❌ removeDisplay error:', error)
    return res.status(500).json({
      error: 'server_error',
      message: error.message || 'Failed to deactivate display',
    })
  }
}


export const getScreenById = async (req, res) => {
  try {
    const { id } = req.params
    const data = await getScreenData(id)
    if (!data) return res.status(404).json({ error: 'not_found' })
    res.json(data)
  } catch (error) {
    console.error('getScreenById error:', error)
    res.status(500).json({ error: 'server_error' })
  }
}
