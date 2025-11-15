/*
	src/redisClient.ts
	Purpose: Initialize and export a Redis client with a helper to connect.
*/

import { createClient } from 'redis'

const redisUrl = process.env.REDIS_URL || 'redis://localhost:6379'

export const redisClient = createClient({
	url: redisUrl,
})

redisClient.on('error', (err) => {
	console.error('Redis Client Error', err)
})

export async function initRedis(): Promise<void> {
	await redisClient.connect()
	console.log('✅ Connected to Redis at', redisUrl)
}

