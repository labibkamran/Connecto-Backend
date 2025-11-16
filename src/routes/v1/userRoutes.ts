/*
	src/routes/userRoutes.ts
	Purpose: Define HTTP routes for listing and searching users for chat and group membership.
*/

import { Router } from 'express'
import { requireAuth } from '../../middleware/authMiddleware'
import { listUsersForChat } from '../../controllers/v1/userController'

const userRouter = Router()

userRouter.get('/', requireAuth, listUsersForChat)

export default userRouter
