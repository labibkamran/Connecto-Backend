/*
	src/routes/unreadRoutes.ts
	Purpose: Define HTTP routes for unread summary operations.
*/

import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware'
import { getUnreadSummary } from '../../controllers/v1/unreadController'

const router = Router()

router.get('/', requireAuth, getUnreadSummary)

export default router
