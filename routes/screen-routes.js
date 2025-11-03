import express from 'express'
import {
  listScreens,
  getScreenById,   // 🔹 new controller
  assignDisplay,
  removeDisplay,
} from '../controllers/screen-controller.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()

// 🔹 GET all screens (admin only)
router.get('/screens', requireAdmin, listScreens)

// 🔹 GET single screen by ID (public — used for /display/:id)
router.get('/screens/:id', getScreenById)

// 🔹 Assign data to a display slot (admin only)
router.post('/screens/:id/assign', requireAdmin, assignDisplay)

// 🔹 Remove (deactivate) a display slot (admin only)
router.patch('/screens/:id/remove', requireAdmin, removeDisplay)

export default router
