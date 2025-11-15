/*
	src/services/messageService.ts
	Purpose: Business logic for fetching room messages from MongoDB with membership checks and per-message read metadata using room-level read state, including DM double-tick support.
*/

import { Types } from 'mongoose'
import { Message, IMessage } from '../models/Message'
import { Room } from '../models/Room'
import { RoomUserState } from '../models/RoomUserState'

interface GetRoomMessagesOptions {
	limit?: number
	before?: Date
}

export interface RoomMessageWithReadMeta {
	message: IMessage
	isReadByCurrentUser: boolean
	readByCount: number
	isReadByOtherUser?: boolean
}

export async function getRoomMessagesWithReadMetaForUser(
	userId: string,
	roomId: string,
	options: GetRoomMessagesOptions = {}
): Promise<RoomMessageWithReadMeta[]> {
	const room = await Room.findById(roomId).select('members.user type').exec()
	if (!room) {
		throw new Error('Room not found')
	}

	const isMember = room.members.some((m) => m.user.toString() === userId)
	if (!isMember) {
		throw new Error('Not a member of this room')
	}

	const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 100) : 50

	const query: Record<string, any> = { roomId: new Types.ObjectId(roomId) }

	if (options.before) {
		query.createdAt = { $lt: options.before }
	}

	const messages = await Message.find(query)
		.sort({ createdAt: -1 })
		.limit(limit)
		.exec()

	if (messages.length === 0) {
		return []
	}

	const memberIds = room.members.map((m) => m.user as Types.ObjectId)

	const states = await RoomUserState.find({
		roomId: new Types.ObjectId(roomId),
		userId: { $in: memberIds },
	}).exec()

	const stateByUserId = new Map<string, Date>()
	for (const s of states) {
		stateByUserId.set(s.userId.toString(), s.lastReadAt)
	}

	const currentUserLastRead = stateByUserId.get(userId)

	const isDm = room.type === 'dm' && room.members.length === 2
	let otherUserId: string | null = null
	if (isDm) {
		const other = room.members.find((m) => m.user.toString() !== userId)
		if (other) {
			otherUserId = other.user.toString()
		}
	}
	const otherUserLastRead = otherUserId ? stateByUserId.get(otherUserId) : undefined

	const result: RoomMessageWithReadMeta[] = messages.map((msg) => {
		const createdAt = msg.createdAt

		const isReadByCurrentUser =
			currentUserLastRead !== undefined && currentUserLastRead >= createdAt

		let readByCount = 0
		for (const [uid, lastRead] of stateByUserId.entries()) {
			if (lastRead >= createdAt) {
				readByCount += 1
			}
		}

		const isReadByOtherUser =
			isDm && otherUserLastRead !== undefined && otherUserLastRead >= createdAt

		return {
			message: msg,
			isReadByCurrentUser,
			readByCount,
			isReadByOtherUser,
		}
	})

	return result
}
