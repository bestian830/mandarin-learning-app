// 认证路由：register / signin / signout / session
import { Router } from "express";
import type { Request, Response } from "express";
import {
  registerWithEmail,
  signInWithEmail,
  verifyToken,
  COOKIE_NAME,
} from "../auth/index.js";

const router = Router();

// cookie 设置：30 天，httpOnly，SameSite=Lax
const COOKIE_OPTS = {
  httpOnly: true,
  sameSite: "lax" as const,
  secure: process.env.NODE_ENV === "production",
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 天
  path: "/",
};

// ─── POST /auth/register ──────────────────────────────────
router.post("/register", async (req: Request, res: Response) => {
  const { email, password, name } = req.body ?? {};

  if (!email || !password || !name) {
    res.status(400).json({ error: "email, password, name are required" });
    return;
  }
  if (password.length < 8) {
    res.status(400).json({ error: "Password must be at least 8 characters" });
    return;
  }

  try {
    const { user, token } = await registerWithEmail(email.trim().toLowerCase(), password, name.trim());
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    res.status(201).json({ user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Registration failed";
    if (msg === "EMAIL_EXISTS") {
      res.status(409).json({ error: "Email already registered" });
    } else {
      console.error("[register]", err);
      res.status(500).json({ error: "Registration failed" });
    }
  }
});

// ─── POST /auth/signin ───────────────────────────────────
router.post("/signin", async (req: Request, res: Response) => {
  const { email, password } = req.body ?? {};

  if (!email || !password) {
    res.status(400).json({ error: "email and password are required" });
    return;
  }

  try {
    const { user, token } = await signInWithEmail(email.trim().toLowerCase(), password);
    res.cookie(COOKIE_NAME, token, COOKIE_OPTS);
    res.json({ user });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "";
    if (msg === "INVALID_CREDENTIALS") {
      res.status(401).json({ error: "Invalid email or password" });
    } else {
      console.error("[signin]", err);
      res.status(500).json({ error: "Sign in failed" });
    }
  }
});

// ─── POST /auth/signout ──────────────────────────────────
router.post("/signout", (_req: Request, res: Response) => {
  res.clearCookie(COOKIE_NAME, { path: "/" });
  res.json({ ok: true });
});

// ─── GET /auth/session ───────────────────────────────────
router.get("/session", (req: Request, res: Response) => {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.json({ user: null });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.clearCookie(COOKIE_NAME, { path: "/" });
    res.json({ user: null });
    return;
  }

  res.json({ user });
});

export default router;
