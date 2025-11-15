/*
	src/services/roomUserStateService.ts
	Purpose: Manage per-user per-room read state and compute unread message counts.
*/

import { Types } from 'mongoose'
import { Room } from '../models/Room'
import { Message } from '../models/Message'
import { RoomUserState } from '../models/RoomUserState'

export interface UnreadRoomSummary {
	roomId: string
	unreadCount: number
}

export async function markRoomAsReadForUser(
	userId: string,
	roomId: string
): Promise<void> {
	await RoomUserState.updateOne(
		{
			userId: new Types.ObjectId(userId),
			roomId: new Types.ObjectId(roomId),
		},
		{
			$set: {
				lastReadAt: new Date(),
			},
		},
		{
			upsert: true,
		}
	).exec()
}

export async function getUnreadSummaryForUser(
	userId: string
): Promise<UnreadRoomSummary[]> {
	const rooms = await Room.find({ 'members.user': userId })
		.select('_id')
		.exec()

	if (rooms.length === 0) {
		return []
	}

	const roomIds = rooms.map((r) => r._id)

	const pipeline = [
		{
			$match: {
				roomId: { $in: roomIds },
			},
		},
		{
			$lookup: {
				from: RoomUserState.collection.name,
				let: { roomId: '$roomId' },
				pipeline: [
					{
						$match: {
							$expr: {
								$and: [
									{ $eq: ['$roomId', '$$roomId'] },
									{ $eq: ['$userId', new Types.ObjectId(userId)] },
								],
							},
						},
					},
				],
				as: 'state',
			},
		},
		{
			$addFields: {
				lastReadAt: { $arrayElemAt: ['$state.lastReadAt', 0] },
			},
		},
		{
			$match: {
				$or: [
					{ lastReadAt: { $exists: false } },
					{
						$expr: {
							$gt: ['$createdAt', '$lastReadAt'],
						},
					},
				],
			},
		},
		{
			$group: {
				_id: '$roomId',
				unreadCount: { $sum: 1 },
			},
		},
	]

	const result = await Message.aggregate(pipeline).exec()

	return result.map((r: any) => ({
		roomId: r._id.toString(),
		unreadCount: r.unreadCount,
	}))
}
