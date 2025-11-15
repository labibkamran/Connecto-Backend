// src/controllers/authController.ts
import { Request, Response } from "express";
import { loginUser, registerUser, getCurrentUser } from "../../services/authService";

const SESSION_COOKIE_NAME = process.env.SESSION_COOKIE_NAME || 'connecto_session';

export async function register(req: Request, res: Response) {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ error: "name, email and password are required" });
    }

    const user = await registerUser(name, email, password);

    const { passwordHash, ...userData } = user.toObject();

    res.status(201).json({ user: userData });
  } catch (err: any) {
    console.error("Register error:", err);
    if (err.message === "Email already in use") {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const { user, sessionId, cookie } = await loginUser(email, password);

    const { passwordHash, ...userData } = user.toObject();

    res.cookie(cookie.name, cookie.value, cookie.options);

    res.json({ user: userData, sessionId });
  } catch (err: any) {
    console.error("Login error:", err);
    if (err.message === "Invalid email or password") {
      return res.status(401).json({ error: err.message });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const sessionId = req.signedCookies[SESSION_COOKIE_NAME];

    if (!sessionId) {
      return res.status(401).json({ error: "Not authenticated" });
    }

    const user = await getCurrentUser(sessionId);

    const { passwordHash, ...userData } = user.toObject();

    res.json({ user: userData });
  } catch (err: any) {
    console.error("Me error:", err);
    if (err.message === "Invalid or expired session" || err.message === "User not found") {
      return res.status(401).json({ error: "Not authenticated" });
    }
    res.status(500).json({ error: "Internal server error" });
  }
}
