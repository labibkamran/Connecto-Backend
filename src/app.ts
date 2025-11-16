/*
	src/app.ts
	Purpose: Configure and export the Express application used by the server.
*/

import express, { Express } from 'express'
import swaggerRouter from './docs/swagger'
import cors from "cors";
import cookieParser from "cookie-parser";
import { getUserPresence } from './services/presenceService'
import { getTypingUsers } from './services/typingService'
import authRouter from './routes/v1/authRoutes'
import roomRouter from './routes/v1/roomRoutes'
import userRouter from './routes/v1/userRoutes'
import unreadRouter from './routes/v1/unreadRoutes';
import messageRouter from './routes/v1/messageRoutes';




const app: Express = express()
const COOKIE_SECRET = process.env.COOKIE_SECRET || "dev-cookie-secret-change-me";

app.use(express.json())
app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));


app.use(cookieParser(COOKIE_SECRET));

app.get('/', (_req, res) => {
		res.status(200).send(`
			<!doctype html>
			<html lang="en">
				<head>
					<meta charset="utf-8" />
					<meta name="viewport" content="width=device-width, initial-scale=1" />
					<title>Backend Status</title>
					<style>
						body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial; background:#f6f9fc; color:#111; display:flex; align-items:center; justify-content:center; height:100vh; margin:0 }
						.card { background:#fff; padding:24px 28px; border-radius:10px; box-shadow:0 6px 18px rgba(17,24,39,0.08); max-width:720px; width:100% }
						h1 { margin:0 0 8px 0; font-size:20px }
						p { margin:0; color:#374151 }
						.meta { margin-top:12px; font-size:13px; color:#6b7280 }
					</style>
				</head>
				<body>
					<div class="card">
						<h1>Backend is running</h1>
						<p>The API server is up and responding to requests.</p>
						<div class="meta">Visit <code>/health</code> for a JSON health check.</div>
					</div>
				</body>
			</html>
		`)
})

app.get('/health', (_req, res) => {
	res.status(200).json({ status: 'ok' })
})

app.get('/presence/:userId', async (req, res) => {
	const userId = req.params.userId
	try {
		const status = await getUserPresence(userId)
		res.json({ userId, status })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Failed to get presence' })
	}
})

app.get('/typing/:roomId', async (req, res) => {
	const roomId = req.params.roomId
	try {
		const userIds = await getTypingUsers(roomId)
		res.json({ roomId, typingUsers: userIds })
	} catch (err) {
		console.error(err)
		res.status(500).json({ error: 'Failed to get typing users' })
	}
})

app.use('/api/auth', authRouter)
app.use('/api/rooms', roomRouter)
app.use('/api/messages', messageRouter)
app.use('/docs', swaggerRouter)
app.use('/api/users', userRouter)
app.use('/api/unread', unreadRouter)

export default app

