// src/services/roomService.ts
// Purpose: Business logic for rooms (listing user rooms, starting DMs, creating groups with admin/member roles).

import { Types } from "mongoose";
import { Room, IRoom } from "../models/Room";
import { User } from "../models/User";

export async function getUserRooms(userId: string): Promise<IRoom[]> {
  return Room.find({ "members.user": userId }).sort({ createdAt: -1 }).exec();
}

async function ensureUsersExist(userIds: string[]): Promise<void> {
  const count = await User.countDocuments({ _id: { $in: userIds } }).exec();
  if (count !== userIds.length) {
    throw new Error("One or more users do not exist");
  }
}

export async function startDmRoom(
  currentUserId: string,
  targetUserId: string
): Promise<IRoom> {
  if (currentUserId === targetUserId) {
    throw new Error("Cannot start a DM with yourself");
  }

  await ensureUsersExist([currentUserId, targetUserId]);

  const userA = new Types.ObjectId(currentUserId);
  const userB = new Types.ObjectId(targetUserId);

  const existing = await Room.findOne({
    type: "dm",
    "members.user": { $all: [userA, userB] },
    $expr: { $eq: [{ $size: "$members" }, 2] },
  }).exec();

  if (existing) {
    return existing;
  }

  const room = new Room({
    type: "dm",
    createdBy: userA,
    members: [
      { user: userA, role: "member" },
      { user: userB, role: "member" },
    ],
  });

  await room.save();
  return room;
}

export async function createGroupRoom(
  currentUserId: string,
  name: string,
  otherMemberIds: string[] = []
): Promise<IRoom> {
  if (!name.trim()) {
    throw new Error("Group name is required");
  }

  const uniqueMembers = Array.from(
    new Set([currentUserId, ...otherMemberIds])
  );

  if (uniqueMembers.length < 2) {
    throw new Error("Group must have at least 2 members");
  }

  await ensureUsersExist(uniqueMembers);

  const currentUserObjectId = new Types.ObjectId(currentUserId);
  const memberObjectIds = uniqueMembers.map((id) => new Types.ObjectId(id));

  const members = memberObjectIds.map((id) => ({
    user: id,
    role: id.equals(currentUserObjectId) ? "admin" : "member",
  }));

  const room = new Room({
    name,
    type: "group",
    createdBy: currentUserObjectId,
    members,
  });

  await room.save();
  return room;
}
