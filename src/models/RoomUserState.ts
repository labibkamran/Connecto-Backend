/*
	src/models/RoomUserState.ts
	Purpose: Track per-user per-room last read time for computing unread message counts efficiently.
*/

import { Schema, model, Document, Types } from 'mongoose'

export interface IRoomUserState extends Document {
	userId: Types.ObjectId
	roomId: Types.ObjectId
	lastReadAt: Date
}

const roomUserStateSchema = new Schema<IRoomUserState>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		roomId: {
			type: Schema.Types.ObjectId,
			ref: 'Room',
			required: true,
		},
		lastReadAt: {
			type: Date,
			required: true,
		},
	},
	{
		timestamps: false,
	}
)

roomUserStateSchema.index({ userId: 1, roomId: 1 }, { unique: true })

export const RoomUserState = model<IRoomUserState>(
	'RoomUserState',
	roomUserStateSchema
)
