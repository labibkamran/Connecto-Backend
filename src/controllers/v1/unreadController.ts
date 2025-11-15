/*
	src/controllers/unreadController.ts
	Purpose: Handle HTTP requests for fetching unread message counts per room for the current user.
*/

import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { getUnreadSummaryForUser } from '../../services/roomUserStateService'

export async function getUnreadSummary(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const summary = await getUnreadSummaryForUser(req.user.userId)

		return res.json({ rooms: summary })
	} catch (err) {
		console.error('getUnreadSummary error:', err)
		return res.status(500).json({ error: 'Internal server error' })
	}
}
