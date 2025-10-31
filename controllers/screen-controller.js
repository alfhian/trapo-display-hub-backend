import { getAllScreens, assignDisplayService  } from '../services/screen-service.js'

export const listScreens = async (req, res) => {
  try {
    const screens = await getAllScreens()
    res.json(screens)
  } catch (e) {
    console.error('List screens error:', e)
    res.status(500).json({ error: 'server_error' })
  }
}

export const assignDisplay = async (req, res) => {
  const { id } = req.params
  const { customerName, licensePlate, eta, brand, type, service } = req.body || {}

  if (!customerName || !licensePlate || !eta) {
    return res.status(400).json({
      error: 'missing_fields',
      message: 'customerName, licensePlate, and eta are required',
    })
  }

  try {
    const adminId = req.user?.id || 'admin'
    const result = await assignDisplayService({
      screenId: id,
      customerName,
      licensePlate,
      eta,
      brand,
      type,
      service,
      adminId,
    })

    return res.status(200).json({
      ok: true,
      message: 'Display assigned successfully',
      data: result,
    })
  } catch (error) {
    console.error('❌ assignDisplay error:', error)
    return res.status(500).json({ error: 'server_error', message: error.message })
  }
}