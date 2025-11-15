// src/middleware/authMiddleware.ts
import { Request, Response, NextFunction } from "express";
import { getSession } from "../services/cookieSessionService";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || "connecto_session";

export interface AuthenticatedRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export async function requireAuth(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionId =
      req.signedCookies?.[SESSION_COOKIE_NAME] ||
      req.cookies?.[SESSION_COOKIE_NAME];

    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const session = await getSession(sessionId);

    if (!session) {
      return res.status(401).json({ error: "Session expired or invalid" });
    }

    // Attach user info to request
    req.user = {
      userId: session.userId,
      email: session.email,
    };

    next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    return res.status(500).json({ error: "Internal server error" });
  }
}
