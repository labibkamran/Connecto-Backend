/*
	src/services/userService.ts
	Purpose: Provide user lookup operations for listing and searching users for starting DMs or adding to rooms.
*/

import { User, IUser } from '../models/User'

interface ListUsersOptions {
	excludeUserId?: string
	search?: string
	limit?: number
}

export async function listUsers(options: ListUsersOptions = {}): Promise<IUser[]> {
	const query: Record<string, any> = {}

	if (options.excludeUserId) {
		query._id = { $ne: options.excludeUserId }
	}

	if (options.search && options.search.trim()) {
		const s = options.search.trim()
		query.$or = [
			{ name: { $regex: s, $options: 'i' } },
			{ email: { $regex: s, $options: 'i' } },
		]
	}

	const limit = options.limit && options.limit > 0 ? Math.min(options.limit, 50) : 20

	return User.find(query).sort({ createdAt: -1 }).limit(limit).exec()
}
