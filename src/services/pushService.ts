/*
	src/services/pushService.ts
	Purpose: Send web push notifications to users based on their stored subscriptions.
*/

import webpush from 'web-push'
import { PushSubscription } from '../models/PushSubscription'

const VAPID_PUBLIC_KEY = process.env.VAPID_PUBLIC_KEY || ''
const VAPID_PRIVATE_KEY = process.env.VAPID_PRIVATE_KEY || ''
const VAPID_SUBJECT = process.env.VAPID_SUBJECT || 'mailto:admin@example.com'

if (VAPID_PUBLIC_KEY && VAPID_PRIVATE_KEY) {
	webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY)
}

export async function sendPushToUser(
	userId: string,
	payload: Record<string, any>
): Promise<void> {
	const subs = await PushSubscription.find({ userId }).exec()
	if (!subs.length) return

	const data = JSON.stringify(payload)

	await Promise.all(
		subs.map(async (sub) => {
			try {
				await webpush.sendNotification(
					{
						endpoint: sub.endpoint,
						keys: {
							p256dh: sub.p256dh,
							auth: sub.auth,
						},
					},
					data
				)
			} catch {
			}
		})
	)
}
