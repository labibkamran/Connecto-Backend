// src/routes/authRoutes.ts
import { Router } from "express";
import { register, login, me } from "../../controllers/v1/authController";

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", me);

export default authRouter;
