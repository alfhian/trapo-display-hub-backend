import express from 'express'
import { listScreens, assignDisplay } from '../controllers/screen-controller.js'
import { requireAdmin } from '../middleware/auth.js'

const router = express.Router()

router.get('/screens', requireAdmin, listScreens)
router.post('/screens/:id/assign', requireAdmin, assignDisplay)

export default router
