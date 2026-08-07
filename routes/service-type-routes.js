import express from 'express'
import {
  listServiceTypes,
  addServiceType,
  editServiceType,
  removeServiceType,
} from '../controllers/service-type-controller.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// 🔹 GET all active service types (admin only)
router.get('/service-types', requireAdmin, listServiceTypes)

// 🔹 Create a new service type (admin only)
router.post('/service-types', requireAdmin, addServiceType)

// 🔹 Update an existing service type (admin only)
router.put('/service-types/:id', requireAdmin, editServiceType)

// 🔹 Deactivate (soft-delete) a service type (admin only)
router.delete('/service-types/:id', requireAdmin, removeServiceType)

export default router
