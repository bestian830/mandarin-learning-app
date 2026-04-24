// Auth 服务：密码哈希、JWT 签发、用户注册/登录逻辑
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../db/client.js";

const JWT_SECRET = process.env.AUTH_SECRET ?? "dev-secret-change-in-prod";
const JWT_EXPIRES = "30d";
const COOKIE_NAME = "mm_session";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

// ─── 密码工具 ─────────────────────────────────────────────
export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 12);
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}

// ─── JWT 工具 ─────────────────────────────────────────────
export function signToken(user: SessionUser): string {
  return jwt.sign(user, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export function verifyToken(token: string): SessionUser | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionUser;
  } catch {
    return null;
  }
}

export { COOKIE_NAME };

// ─── 注册 ─────────────────────────────────────────────────
export async function registerWithEmail(
  email: string,
  password: string,
  name: string
): Promise<{ user: SessionUser; token: string }> {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error("EMAIL_EXISTS");

  const passwordHash = await hashPassword(password);

  // 事务：建 user + student_core
  const user = await prisma.$transaction(async (tx) => {
    const newUser = await tx.user.create({
      data: { email, name, passwordHash },
    });
    await tx.studentCore.create({
      data: { userId: newUser.id },
    });
    return newUser;
  });

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
  return { user: sessionUser, token: signToken(sessionUser) };
}

// ─── 登录 ─────────────────────────────────────────────────
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ user: SessionUser; token: string }> {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash) throw new Error("INVALID_CREDENTIALS");

  const ok = await verifyPassword(password, user.passwordHash);
  if (!ok) throw new Error("INVALID_CREDENTIALS");

  // 更新最后登录时间
  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() },
  });

  const sessionUser: SessionUser = {
    id: user.id,
    email: user.email,
    name: user.name,
    image: user.image,
  };
  return { user: sessionUser, token: signToken(sessionUser) };
}
