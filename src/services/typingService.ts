// src/services/typingService.ts
import { redisClient } from "../redisClient";

const TYPING_TTL_SECONDS = 3;

function typingKey(roomId: string, userId: string) {
  return `typing:${roomId}:${userId}`;
}


export async function setUserTyping(roomId: string, userId: string): Promise<void> {
  await redisClient.set(typingKey(roomId, userId), "1", {
    EX: TYPING_TTL_SECONDS, 
  });
}

export async function getTypingUsers(roomId: string): Promise<string[]> {
  const pattern = `typing:${roomId}:*`;
  const keys = await redisClient.keys(pattern);
  return keys.map((key) => key.split(":")[2]);
}
