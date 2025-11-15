/*
	src/routes/roomRoutes.ts
	Purpose: Define HTTP routes for room-related operations, including listing rooms, DMs, group creation, and group admin actions.
*/

import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware'
import {
	createGroup,
	listMyRooms,
	startDm,
	addMember,
	removeMember,
	renameGroup,
} from '../../controllers/v1/roomController'

const router = Router()

router.get('/', requireAuth, listMyRooms)
router.post('/dm', requireAuth, startDm)
router.post('/group', requireAuth, createGroup)
router.post('/:roomId/members', requireAuth, addMember)
router.delete('/:roomId/members/:userId', requireAuth, removeMember)
router.patch('/:roomId', requireAuth, renameGroup)

export default router
