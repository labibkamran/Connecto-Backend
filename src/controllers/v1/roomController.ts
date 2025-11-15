/*
	src/controllers/roomController.ts
	Purpose: Handle HTTP requests related to rooms, including listing rooms, DMs, group creation, and group admin actions.
*/

import { Response } from 'express'
import { AuthenticatedRequest } from '../../middleware/authMiddleware'
import {
	createGroupRoom,
	getUserRooms,
	startDmRoom,
	addMemberToGroupRoom,
	removeMemberFromGroupRoom,
	renameGroupRoom,
} from '../../services/roomService'

export async function listMyRooms(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const rooms = await getUserRooms(req.user.userId)
		res.json({ rooms })
	} catch (err) {
		console.error('listMyRooms error:', err)
		res.status(500).json({ error: 'Internal server error' })
	}
}

export async function startDm(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const { targetUserId } = req.body
		if (!targetUserId) {
			return res.status(400).json({ error: 'targetUserId is required' })
		}

		const room = await startDmRoom(req.user.userId, targetUserId)
		res.status(201).json({ room })
	} catch (err: any) {
		console.error('startDm error:', err)
		res.status(400).json({ error: err.message || 'Internal server error' })
	}
}

export async function createGroup(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const { name, memberIds } = req.body
		if (!name) {
			return res.status(400).json({ error: 'name is required' })
		}

		const room = await createGroupRoom(
			req.user.userId,
			name,
			Array.isArray(memberIds) ? memberIds : []
		)

		res.status(201).json({ room })
	} catch (err: any) {
		console.error('createGroup error:', err)
		res.status(400).json({ error: err.message || 'Internal server error' })
	}
}

export async function addMember(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const roomId = req.params.roomId
		const { userId } = req.body

		if (!roomId || !userId) {
			return res.status(400).json({ error: 'roomId and userId are required' })
		}

		const room = await addMemberToGroupRoom(req.user.userId, roomId, userId)
		res.json({ room })
	} catch (err: any) {
		console.error('addMember error:', err)
		res.status(400).json({ error: err.message || 'Internal server error' })
	}
}

export async function removeMember(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const roomId = req.params.roomId
		const memberUserId = req.params.userId

		if (!roomId || !memberUserId) {
			return res.status(400).json({ error: 'roomId and userId are required' })
		}

		const room = await removeMemberFromGroupRoom(
			req.user.userId,
			roomId,
			memberUserId
		)
		res.json({ room })
	} catch (err: any) {
		console.error('removeMember error:', err)
		res.status(400).json({ error: err.message || 'Internal server error' })
	}
}

export async function renameGroup(req: AuthenticatedRequest, res: Response) {
	try {
		if (!req.user) {
			return res.status(401).json({ error: 'Not authenticated' })
		}

		const roomId = req.params.roomId
		const { name } = req.body

		if (!roomId || !name) {
			return res.status(400).json({ error: 'roomId and name are required' })
		}

		const room = await renameGroupRoom(req.user.userId, roomId, name)
		res.json({ room })
	} catch (err: any) {
		console.error('renameGroup error:', err)
		res.status(400).json({ error: err.message || 'Internal server error' })
	}
}
