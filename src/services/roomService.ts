/*
	src/services/roomService.ts
	Purpose: Business logic for rooms, including listing rooms, starting DMs, creating groups, and group admin operations.
*/

import { Types } from 'mongoose'
import { Room, IRoom } from '../models/Room'
import { User } from '../models/User'

export async function getUserRooms(userId: string): Promise<IRoom[]> {
	return Room.find({ 'members.user': userId }).sort({ createdAt: -1 }).exec()
}

async function ensureUsersExist(userIds: string[]): Promise<void> {
	const count = await User.countDocuments({ _id: { $in: userIds } }).exec()
	if (count !== userIds.length) {
		throw new Error('One or more users do not exist')
	}
}

function ensureGroupAndAdmin(room: IRoom, currentUserId: string): void {
	if (room.type !== 'group') {
		throw new Error('Operation allowed only on group rooms')
	}
	const member = room.members.find((m) => m.user.toString() === currentUserId)
	if (!member) {
		throw new Error('Not a member of this room')
	}
	if (member.role !== 'admin') {
		throw new Error('Only admins can perform this action')
	}
}

export async function startDmRoom(
	currentUserId: string,
	targetUserId: string
): Promise<IRoom> {
	if (currentUserId === targetUserId) {
		throw new Error('Cannot start a DM with yourself')
	}

	await ensureUsersExist([currentUserId, targetUserId])

	const userA = new Types.ObjectId(currentUserId)
	const userB = new Types.ObjectId(targetUserId)

	const existing = await Room.findOne({
		type: 'dm',
		'members.user': { $all: [userA, userB] },
		$expr: { $eq: [{ $size: '$members' }, 2] },
	}).exec()

	if (existing) {
		return existing
	}

	const room = new Room({
		type: 'dm',
		createdBy: userA,
		members: [
			{ user: userA, role: 'member' },
			{ user: userB, role: 'member' },
		],
	})

	await room.save()
	return room
}

export async function createGroupRoom(
	currentUserId: string,
	name: string,
	otherMemberIds: string[] = []
): Promise<IRoom> {
	if (!name.trim()) {
		throw new Error('Group name is required')
	}

	const uniqueMembers = Array.from(new Set([currentUserId, ...otherMemberIds]))

	if (uniqueMembers.length < 2) {
		throw new Error('Group must have at least 2 members')
	}

	await ensureUsersExist(uniqueMembers)

	const currentUserObjectId = new Types.ObjectId(currentUserId)
	const memberObjectIds = uniqueMembers.map((id) => new Types.ObjectId(id))

	const members = memberObjectIds.map((id) => ({
		user: id,
		role: id.equals(currentUserObjectId) ? 'admin' : 'member',
	}))

	const room = new Room({
		name,
		type: 'group',
		createdBy: currentUserObjectId,
		members,
	})

	await room.save()
	return room
}

export async function addMemberToGroupRoom(
	currentUserId: string,
	roomId: string,
	newMemberUserId: string
): Promise<IRoom> {
	if (currentUserId === newMemberUserId) {
		throw new Error('User is already a member')
	}

	await ensureUsersExist([newMemberUserId])

	const room = await Room.findById(roomId).exec()
	if (!room) {
		throw new Error('Room not found')
	}

	ensureGroupAndAdmin(room, currentUserId)

	const already = room.members.find((m) => m.user.toString() === newMemberUserId)
	if (already) {
		throw new Error('User is already a member of this room')
	}

	room.members.push({
		user: new Types.ObjectId(newMemberUserId),
		role: 'member',
		joinedAt: new Date(),
	} as any)

	await room.save()
	return room
}

export async function removeMemberFromGroupRoom(
	currentUserId: string,
	roomId: string,
	memberUserId: string
): Promise<IRoom> {
	const room = await Room.findById(roomId).exec()
	if (!room) {
		throw new Error('Room not found')
	}

	ensureGroupAndAdmin(room, currentUserId)

	const memberIndex = room.members.findIndex((m) => m.user.toString() === memberUserId)
	if (memberIndex === -1) {
		throw new Error('User is not a member of this room')
	}

	const member = room.members[memberIndex]
	if (member.role === 'admin' && member.user.toString() === currentUserId) {
		throw new Error('Admin cannot remove themselves')
	}

	room.members.splice(memberIndex, 1)

	await room.save()
	return room
}

export async function renameGroupRoom(
	currentUserId: string,
	roomId: string,
	newName: string
): Promise<IRoom> {
	if (!newName.trim()) {
		throw new Error('Group name is required')
	}

	const room = await Room.findById(roomId).exec()
	if (!room) {
		throw new Error('Room not found')
	}

	ensureGroupAndAdmin(room, currentUserId)

	room.name = newName
	await room.save()
	return room
}
