// src/services/sessionService.ts
import { randomUUID } from "crypto";
import { redisClient } from "../redisClient";

const SESSION_PREFIX = "session:";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7;

export interface SessionData {
  userId: string;
  email: string;
  createdAt: number;
}

export async function createSession(userId: string, email: string): Promise<string> {
  const sessionId = randomUUID();

  const session: SessionData = {
    userId,
    email,
    createdAt: Date.now(),
  };

  await redisClient.set(
    SESSION_PREFIX + sessionId,
    JSON.stringify(session),
    { EX: SESSION_TTL_SECONDS }
  );

  return sessionId;
}

export async function getSession(sessionId: string): Promise<SessionData | null> {
  const data = await redisClient.get(SESSION_PREFIX + sessionId);
  if (!data) return null;
  return JSON.parse(data) as SessionData;
}

export async function deleteSession(sessionId: string): Promise<void> {
  await redisClient.del(SESSION_PREFIX + sessionId);
}
