/*
	src/server.ts
	Purpose: Create and start the HTTP server using the configured Express app.
*/

import http from 'http'
import dotenv from 'dotenv'
import app from './app'
import connectToDatabase from './config/db'

dotenv.config()

const PORT = process.env.PORT ? Number(process.env.PORT) : 3000

async function start(): Promise<void> {
	await connectToDatabase()
	const server = http.createServer(app)
	server.listen(PORT, () => {
		console.log(`Server listening on port ${PORT}`)
	})
}

start().catch((err) => {
	console.error('Failed to start server:', err)
	process.exit(1)
})

export default null
