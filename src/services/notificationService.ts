/*
	src/services/notificationService.ts
	Purpose: Decide which users to notify about new messages and trigger push notifications for offline users.
*/

import { Room } from '../models/Room'
import { isUserOnline } from './presenceService'
import { sendPushToUser } from './pushService'

export async function notifyRoomMembersOnNewMessage(
	roomId: string,
	senderId: string,
	content: string
): Promise<void> {
	const room = await Room.findById(roomId).select('members.user type name').exec()
	if (!room) {
		return
	}

	for (const member of room.members) {
		const memberId = member.user.toString()
		if (memberId === senderId) continue

		const online = await isUserOnline(memberId)
		if (online) continue

		const payload = {
			type: 'new_message',
			roomId,
			roomName: room.name || undefined,
			fromUserId: senderId,
			body: content,
		}

		await sendPushToUser(memberId, payload)
	}
}
