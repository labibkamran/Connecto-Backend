/*
  src/config/db.ts
  Purpose: Provide a function to connect to MongoDB using Mongoose and the MONGO_URI environment variable.
*/

import mongoose from 'mongoose'

export async function connectToDatabase(): Promise<typeof mongoose> {
  const uri = process.env.MONGO_URI
  if (!uri) {
    throw new Error('MONGO_URI is not defined in environment')
  }
  await mongoose.connect(uri)

  try {
    const parsed = new URL(uri.replace('mongodb+srv://', 'mongodb+srv://'))
    const hosts = parsed.host
    const dbName = parsed.pathname && parsed.pathname !== '/' ? parsed.pathname.slice(1) : ''
    console.log(`Connected to MongoDB host(s): ${hosts}${dbName ? `, database: ${dbName}` : ''}`)
  } catch (err) {
    console.log('Connected to MongoDB')
  }

  return mongoose
}

export default connectToDatabase
