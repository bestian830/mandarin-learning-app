// requireAuth 中间件：验证 httpOnly cookie 里的 JWT，注入 req.user
import type { Request, Response, NextFunction } from "express";
import { verifyToken, COOKIE_NAME, type SessionUser } from "./index.js";

// 扩展 Express Request 类型
declare global {
  namespace Express {
    interface Request {
      user?: SessionUser;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (!token) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const user = verifyToken(token);
  if (!user) {
    res.clearCookie(COOKIE_NAME);
    res.status(401).json({ error: "Invalid session" });
    return;
  }

  req.user = user;
  next();
}

// 可选认证：不强制要求登录，有则注入
export function optionalAuth(req: Request, _res: Response, next: NextFunction) {
  const token = req.cookies?.[COOKIE_NAME];
  if (token) {
    const user = verifyToken(token);
    if (user) req.user = user;
  }
  next();
}
