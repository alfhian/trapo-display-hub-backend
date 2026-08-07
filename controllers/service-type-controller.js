import {
  getAllServiceTypes,
  createServiceType,
  updateServiceType,
  deactivateServiceType,
} from '../services/service-type-service.js'

const isValidDuration = (value) => Number.isInteger(value) && value > 0

const validatePayload = (body) => {
  const { label, duration_minutes } = body || {}
  if (typeof label !== 'string' || !label.trim()) {
    return 'label is required'
  }
  if (!isValidDuration(duration_minutes)) {
    return 'duration_minutes must be a positive integer'
  }
  return null
}

export const listServiceTypes = async (req, res) => {
  try {
    const serviceTypes = await getAllServiceTypes()
    res.json(serviceTypes)
  } catch (error) {
    console.error('List service types error:', error)
    res.status(500).json({ error: 'server_error' })
  }
}

export const addServiceType = async (req, res) => {
  const validationError = validatePayload(req.body)
  if (validationError) {
    return res.status(400).json({ error: 'invalid_payload', message: validationError })
  }

  try {
    const { label, value, duration_minutes } = req.body
    const result = await createServiceType({ label, value, duration_minutes })
    return res.status(201).json({ ok: true, message: 'Service type created', data: result })
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ error: 'duplicate_value', message: 'A service with this value already exists.' })
    }
    console.error('❌ addServiceType error:', error)
    return res.status(500).json({ error: 'server_error', message: error.message || 'Internal server error' })
  }
}

export const editServiceType = async (req, res) => {
  const validationError = validatePayload(req.body)
  if (validationError) {
    return res.status(400).json({ error: 'invalid_payload', message: validationError })
  }

  try {
    const { id } = req.params
    const { label, value, duration_minutes } = req.body
    const result = await updateServiceType(id, { label, value, duration_minutes })
    if (!result) return res.status(404).json({ error: 'not_found' })
    return res.json({ ok: true, message: 'Service type updated', data: result })
  } catch (error) {
    if (error.status === 409) {
      return res.status(409).json({ error: 'duplicate_value', message: 'A service with this value already exists.' })
    }
    console.error('❌ editServiceType error:', error)
    return res.status(500).json({ error: 'server_error', message: error.message || 'Internal server error' })
  }
}

export const removeServiceType = async (req, res) => {
  try {
    const { id } = req.params
    const result = await deactivateServiceType(id)
    if (!result) return res.status(404).json({ error: 'not_found' })
    return res.json({ ok: true, message: 'Service type deactivated', data: result })
  } catch (error) {
    console.error('❌ removeServiceType error:', error)
    return res.status(500).json({ error: 'server_error', message: error.message || 'Internal server error' })
  }
}
