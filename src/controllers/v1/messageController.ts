/*
	src/controllers/messageController.ts
	Purpose: Handle HTTP requests for fetching room messages along with read metadata for the current user.
*/

import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/authMiddleware'
import { getRoomMessagesWithReadMetaForUser } from '../../services/messageService'

export async function getRoomMessages(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const roomId = req.params.roomId
		if (!roomId) {
			return res.status(400).json({ error: 'roomId is required' })
		}

		const beforeParam = req.query.before as string | undefined
		const limitParam = req.query.limit as string | undefined

		let beforeDate: Date | undefined
		if (beforeParam) {
			const d = new Date(beforeParam)
			if (!isNaN(d.getTime())) {
				beforeDate = d
			}
		}

		let limit: number | undefined
		if (limitParam) {
			const n = Number(limitParam)
			if (!isNaN(n)) {
				limit = n
			}
		}

		const items = await getRoomMessagesWithReadMetaForUser(
			req.user.userId,
			roomId,
			{
				before: beforeDate,
				limit,
			}
		)

		const data = items
			.map((item) => {
				const msg: any = item.message
				return {
					id: msg._id && typeof msg._id?.toString === 'function' ? msg._id.toString() : String(msg._id),
					roomId: msg.roomId && typeof msg.roomId?.toString === 'function' ? msg.roomId.toString() : String(msg.roomId),
					senderId: msg.senderId && typeof msg.senderId?.toString === 'function' ? msg.senderId.toString() : String(msg.senderId),
					content: msg.content,
					status: msg.status,
					createdAt: msg.createdAt instanceof Date ? msg.createdAt.toISOString() : String(msg.createdAt),
					isReadByMe: item.isReadByCurrentUser,
					readByCount: item.readByCount,
					isReadByOtherUser: item.isReadByOtherUser ?? null,
				}
			})
			.reverse()

		return res.json({ messages: data })
	} catch (err: any) {
		if (err.message === 'Not a member of this room') {
			return res.status(403).json({ error: err.message })
		}
		if (err.message === 'Room not found') {
			return res.status(404).json({ error: err.message })
		}
		console.error('getRoomMessages error:', err)
		return res.status(500).json({ error: 'Internal server error' })
	}
}
