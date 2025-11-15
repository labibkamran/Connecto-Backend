/*
	src/models/PushSubscription.ts
	Purpose: Store web push subscriptions for users to enable push notifications.
*/

import { Schema, model, Document, Types } from 'mongoose'

export interface IPushSubscription extends Document {
	userId: Types.ObjectId
	endpoint: string
	p256dh: string
	auth: string
	createdAt: Date
}

const pushSubscriptionSchema = new Schema<IPushSubscription>(
	{
		userId: {
			type: Schema.Types.ObjectId,
			ref: 'User',
			required: true,
		},
		endpoint: {
			type: String,
			required: true,
		},
		p256dh: {
			type: String,
			required: true,
		},
		auth: {
			type: String,
			required: true,
		},
	},
	{
		timestamps: { createdAt: true, updatedAt: false },
	}
)

pushSubscriptionSchema.index({ userId: 1 })

export const PushSubscription = model<IPushSubscription>(
	'PushSubscription',
	pushSubscriptionSchema
)
