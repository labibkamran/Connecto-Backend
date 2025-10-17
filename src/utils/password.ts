/*
  src/utils/password.ts
  Purpose: Provide password hashing and verification utilities using argon2.
*/

import argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password)
}

export async function verifyPassword(hash: string, password: string): Promise<boolean> {
  try {
    return await argon2.verify(hash, password)
  } catch (err) {
    return false
  }
}

export default { hashPassword, verifyPassword }
