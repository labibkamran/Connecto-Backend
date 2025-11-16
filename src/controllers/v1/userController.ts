/*
	src/controllers/userController.ts
	Purpose: Handle HTTP requests for listing and searching users to start new conversations or add to rooms.
*/

import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { listUsers } from '../../services/userService'

export async function listUsersForChat(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const search = (req.query.search as string | undefined) || undefined
		const limitParam = req.query.limit as string | undefined

		let limit: number | undefined
		if (limitParam) {
			const n = Number(limitParam)
			if (!isNaN(n)) {
				limit = n
			}
		}

		const users = await listUsers({
			excludeUserId: req.user.userId,
			search,
			limit,
		})

		const data = users.map((u) => ({
			id: String(u._id),
			name: u.name,
			email: u.email,
		}))

		return res.json({ users: data })
	} catch (err) {
		console.error('listUsersForChat error:', err)
		return res.status(500).json({ error: 'Internal server error' })
	}
}
