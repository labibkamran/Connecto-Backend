// src/routes/roomRoutes.ts
import { Router } from "express";
import {
  createGroup,
  listMyRooms,
  startDm,
} from "../../controllers/v1/roomController";
import { requireAuth } from "../../middleware/authMiddleware";

const roomRouter = Router();

roomRouter.get("/", requireAuth, listMyRooms);
roomRouter.post("/dm", requireAuth, startDm);
roomRouter.post("/group", requireAuth, createGroup);

export default roomRouter;
