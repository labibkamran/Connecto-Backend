/*
	src/models/MessageReceipt.ts
	Purpose: Track per-user message delivery and read status for messages in rooms.
*/

import { Schema, model, Document, Types } from 'mongoose'

export type ReceiptStatus = 'delivered' | 'read'

export interface IMessageReceipt extends Document {
	messageId: Types.ObjectId
	userId: Types.ObjectId
	status: ReceiptStatus
	updatedAt: Date
}

const messageReceiptSchema = new Schema<IMessageReceipt>(
	{
		messageId: {
			type: Schema.Types.ObjectId,
			ref: 'Message',
			required: true,
		},
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		status: {
			type: String,
			enum: ['delivered', 'read'],
			required: true,
		},
	},
	{
		timestamps: { createdAt: false, updatedAt: true },
	}
)

messageReceiptSchema.index({ messageId: 1, userId: 1 }, { unique: true })
messageReceiptSchema.index({ userId: 1, updatedAt: -1 })

export const MessageReceipt = model<IMessageReceipt>(
	'MessageReceipt',
	messageReceiptSchema
)
