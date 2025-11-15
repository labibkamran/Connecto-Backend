// src/controllers/roomController.ts
import { Response } from "express";
import { AuthenticatedRequest } from "../../middleware/authMiddleware";
import { createGroupRoom, getUserRooms, startDmRoom } from "../../services/roomService";

export async function listMyRooms(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const rooms = await getUserRooms(req.user.userId);
    res.json({ rooms });
  } catch (err) {
    console.error("listMyRooms error:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function startDm(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ error: "targetUserId is required" });
    }

    const room = await startDmRoom(req.user.userId, targetUserId);
    res.status(201).json({ room });
  } catch (err: any) {
    console.error("startDm error:", err);
    res
      .status(err.message === "Cannot start a DM with yourself" ? 400 : 500)
      .json({ error: err.message || "Internal server error" });
  }
}

export async function createGroup(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const { name, memberIds } = req.body;

    if (!name) {
      return res.status(400).json({ error: "name is required" });
    }

    const room = await createGroupRoom(
      req.user.userId,
      name,
      Array.isArray(memberIds) ? memberIds : []
    );

    res.status(201).json({ room });
  } catch (err: any) {
    console.error("createGroup error:", err);
    res.status(500).json({ error: err.message || "Internal server error" });
  }
}
