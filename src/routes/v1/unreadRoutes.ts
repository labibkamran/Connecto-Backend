/*
	src/routes/unreadRoutes.ts
	Purpose: Define HTTP routes for unread summary operations.
*/

import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware'
import { getUnreadSummary } from '../../controllers/v1/unreadController'

const unreadRouter = Router()

unreadRouter.get('/', requireAuth, getUnreadSummary)

export default unreadRouter
