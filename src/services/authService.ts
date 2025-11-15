/*
  src/services/authService.ts
  Purpose: Handle authentication logic including registration, login, and session management using Redis.
*/

import { CookieOptions } from 'express'
import { User, type IUser } from '../models/User'
import { hashPassword, verifyPassword } from '../utils/password'
import { createSession } from './cookieSessionService'

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'connecto_session'
const SESSION_COOKIE_MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000

const sessionCookieOptions: CookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  signed: true,
  maxAge: SESSION_COOKIE_MAX_AGE_MS,
}

export interface AuthCookie {
  name: string
  value: string
  options: CookieOptions
}

export interface AuthPayload {
  user: IUser
  sessionId: string
  cookie: AuthCookie
}

export async function registerUser(
  name: string,
  email: string,
  password: string
): Promise<IUser> {
  const existing = await User.findOne({ email })
  if (existing) {
    throw new Error('Email already in use')
  }

  const passwordHash = await hashPassword(password)

  const user = new User({
    name,
    email,
    passwordHash,
  })

  await user.save()
  return user
}

export async function loginUser(
  email: string,
  password: string
): Promise<AuthPayload> {
  const user = await User.findOne({ email })
  if (!user) {
    throw new Error('Invalid email or password')
  }

  const valid = await verifyPassword(user.passwordHash, password)
  if (!valid) {
    throw new Error('Invalid email or password')
  }

  const sessionId = await createSession((user._id as any).toString(), user.email)
  const cookie = buildSessionCookie(sessionId)

  return { user, sessionId, cookie }
}

function buildSessionCookie(sessionId: string): AuthCookie {
  return {
    name: SESSION_COOKIE_NAME,
    value: sessionId,
    options: sessionCookieOptions,
  }
}

export async function getCurrentUser(sessionId: string): Promise<IUser> {
  const { getSession } = await import('./cookieSessionService')
  const session = await getSession(sessionId)
  
  if (!session) {
    throw new Error('Invalid or expired session')
  }

  const user = await User.findById(session.userId)
  if (!user) {
    throw new Error('User not found')
  }

  return user
}
