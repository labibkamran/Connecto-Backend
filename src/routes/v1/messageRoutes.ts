/*
	src/routes/messageRoutes.ts
	Purpose: Define HTTP routes for message-related operations such as fetching room history.
*/

import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware'
import { getRoomMessages } from '../../controllers/v1/messageController'

const router = Router()

router.get('/:roomId', requireAuth, getRoomMessages)

export default router
