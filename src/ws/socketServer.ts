/*
	src/ws/socketServer.ts
	Purpose: Initialize the Socket.IO server and register authenticated WebSocket event handlers with room membership checks, message persistence, and unread summary using room-level read state.
*/

import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import { setUserOnline } from '../services/presenceService'
import {
	ChatMessage,
	addRecentMessage,
	getRecentMessages,
} from '../services/chatCacheService'
import { setUserTyping } from '../services/typingService'
import { getSession } from '../services/cookieSessionService'
import { Room } from '../models/Room'
import { Message } from '../models/Message'
import {
	getUnreadSummaryForUser,
	markRoomAsReadForUser,
} from '../services/roomUserStateService'
import { notifyRoomMembersOnNewMessage } from '../services/notificationService'

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'connecto_session'
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000'

function parseCookies(cookieHeader?: string): Record<string, string> {
	const result: Record<string, string> = {}
	if (!cookieHeader) return result
	const parts = cookieHeader.split(';')
	for (const part of parts) {
		const [rawKey, ...rest] = part.split('=')
		const key = rawKey.trim()
		const value = rest.join('=').trim()
		if (!key) continue
		result[key] = decodeURIComponent(value)
	}
	return result
}

function extractSessionIdFromCookies(cookieHeader?: string): string | null {
	const cookies = parseCookies(cookieHeader)
	const raw = cookies[SESSION_COOKIE_NAME]
	if (!raw) return null
	if (raw.startsWith('s:')) {
		const withoutPrefix = raw.slice(2)
		const dotIndex = withoutPrefix.lastIndexOf('.')
		if (dotIndex === -1) return withoutPrefix
		return withoutPrefix.slice(0, dotIndex)
	}
	return raw
}

async function isUserMemberOfRoom(userId: string, roomId: string): Promise<boolean> {
	const count = await Room.countDocuments({ _id: roomId, 'members.user': userId }).exec()
	return count > 0
}

export function initializeSocketServer(httpServer: http.Server): SocketIOServer {
	const io = new SocketIOServer(httpServer, {
		cors: {
			origin: CLIENT_ORIGIN,
			credentials: true,
		},
	})

	io.use(async (socket, next) => {
		try {
			const cookieHeader = socket.request.headers.cookie
			const sessionId = extractSessionIdFromCookies(cookieHeader)
			if (!sessionId) {
				return next(new Error('Unauthenticated'))
			}

			const session = await getSession(sessionId)
			if (!session) {
				return next(new Error('Unauthenticated'))
			}

			;(socket.data as any).user = {
				userId: session.userId,
				email: session.email,
			}

			return next()
		} catch (err) {
			return next(err as Error)
		}
	})

	io.on('connection', async (socket) => {
		const user = (socket.data as any).user as { userId: string; email: string } | undefined

		if (!user) {
			socket.disconnect()
			return io
		}

		try {
			const unread = await getUnreadSummaryForUser(user.userId)
			socket.emit('unread_summary', { rooms: unread })
		} catch {
		}

		socket.on('join_room', async (roomId: string) => {
			try {
				const isMember = await isUserMemberOfRoom(user.userId, roomId)
				if (!isMember) {
					socket.emit('room_error', { roomId, message: 'Not a member of this room' })
					return
				}

				socket.join(roomId)
				await setUserOnline(user.userId)
				const recentMessages = await getRecentMessages(roomId)
				socket.emit('room_history', recentMessages)
			} catch {
				socket.emit('room_error', { roomId, message: 'Failed to join room' })
			}
		})

		socket.on(
			'send_message',
			async (payload: { roomId: string; content: string }) => {
				const { roomId, content } = payload
				if (!roomId || !content) {
					return
				}

				try {
					const isMember = await isUserMemberOfRoom(user.userId, roomId)
					if (!isMember) {
						socket.emit('room_error', { roomId, message: 'Not a member of this room' })
						return
					}

					const messageDoc = new Message({
						roomId,
						senderId: user.userId,
						content,
						status: 'sent',
					})

					await messageDoc.save()

					const chatMessage: ChatMessage = {
						id: String(messageDoc._id),
						roomId,
						senderId: user.userId,
						content,
						timestamp: messageDoc.createdAt.getTime(),
					}

					await addRecentMessage(chatMessage)
					io.to(roomId).emit('new_message', chatMessage)
                    await notifyRoomMembersOnNewMessage(roomId, user.userId, content)
				} catch {
					socket.emit('room_error', { roomId, message: 'Failed to send message' })
				}
			}
		)

		socket.on('typing', async (roomId: string) => {
			if (!roomId) return
			try {
				const isMember = await isUserMemberOfRoom(user.userId, roomId)
				if (!isMember) {
					return
				}
				await setUserTyping(roomId, user.userId)
				socket.to(roomId).emit('user_typing', { roomId, userId: user.userId })
			} catch {
			}
		})

		socket.on('mark_read', async (roomId: string) => {
			if (!roomId) return
			try {
				const isMember = await isUserMemberOfRoom(user.userId, roomId)
				if (!isMember) {
					return
				}

				await markRoomAsReadForUser(user.userId, roomId)
				io.to(roomId).emit('messages_read', { roomId, userId: user.userId })

				try {
					const unread = await getUnreadSummaryForUser(user.userId)
					socket.emit('unread_summary', { rooms: unread })
				} catch {
				}
			} catch {
			}
		})

		socket.on('disconnect', () => {
		})
	})

	return io
}
