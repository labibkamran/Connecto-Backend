/*
	src/ws/socketServer.ts
	Purpose: Initialize the Socket.IO server and register WebSocket event handlers.
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

export function initializeSocketServer(httpServer: http.Server): SocketIOServer {
	const io = new SocketIOServer(httpServer, {
		cors: {
			origin: '*',
		},
	})

	io.on('connection', (socket) => {
		console.log('socket connected:', socket.id)

		socket.on('join_room', async (roomId: string, userId: string) => {
			console.log(`User ${userId} joining room ${roomId}`)
			socket.join(roomId)
			await setUserOnline(userId)
			const recentMessages = await getRecentMessages(roomId)
			socket.emit('room_history', recentMessages)
		})

		socket.on(
			'send_message',
			async (payload: {
				roomId: string
				senderId: string
				content: string
			}) => {
				const { roomId, senderId, content } = payload

				const message: ChatMessage = {
					id: `${Date.now()}-${Math.random()}`,
					roomId,
					senderId,
					content,
					timestamp: Date.now(),
				}

				await addRecentMessage(message)

				io.to(roomId).emit('new_message', message)
			}
		)

		socket.on('typing', async (roomId: string, userId: string) => {
			console.log(`User ${userId} typing in room ${roomId}`)
			await setUserTyping(roomId, userId)
			socket.to(roomId).emit('user_typing', { roomId, userId })
		})

		socket.on('disconnect', () => {
			console.log('socket disconnected:', socket.id)
		})
	})

	return io
}

