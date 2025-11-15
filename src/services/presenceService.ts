// src/services/presenceService.ts
import { redisClient } from "../redisClient";

const PRESENCE_TTL_SECONDS = 10;

export async function setUserOnline(userId: string): Promise<void> {
  await redisClient.set(`presence:${userId}`, "online", {
    EX: PRESENCE_TTL_SECONDS,
  });
}

export async function getUserPresence(userId: string): Promise<"online" | "offline"> {
  const val = await redisClient.get(`presence:${userId}`);
  return val === "online" ? "online" : "offline";
}
