// src/routes/authRoutes.ts
import { Router } from "express";
import { register, login, me , logout} from "../../controllers/v1/authController";
import { requireAuth } from '../../middleware/authMiddleware'

const authRouter = Router();

authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.get("/me", me);
authRouter.post("/logout", requireAuth, logout);

export default authRouter;
