/*
	src/services/chatCacheService.ts
	Purpose: Provide Redis-backed helpers for storing and retrieving recent chat messages per room.
*/

import { redisClient } from '../redisClient'

export type ChatMessage = {
	id: string
	roomId: string
	senderId: string
	content: string
	timestamp: number
}

const RECENT_MESSAGES_LIMIT = 50

function recentMessagesKey(roomId: string): string {
	return `chat:room:${roomId}:recent`
}

export async function addRecentMessage(message: ChatMessage): Promise<void> {
	const key = recentMessagesKey(message.roomId)
	const value = JSON.stringify(message)
	await redisClient.lPush(key, value)
	await redisClient.lTrim(key, 0, RECENT_MESSAGES_LIMIT - 1)
}

export async function getRecentMessages(roomId: string): Promise<ChatMessage[]> {
	const key = recentMessagesKey(roomId)
	const values = await redisClient.lRange(key, 0, RECENT_MESSAGES_LIMIT - 1)
	return values.map((v) => JSON.parse(v) as ChatMessage).reverse()
}
