/*
	src/app.ts
	Purpose: Configure and export the Express application used by the server.
*/

import express, { Express } from 'express'
import swaggerRouter from './docs/swagger'

const app: Express = express()

app.use(express.json())

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

app.use('/docs', swaggerRouter)

export default app

