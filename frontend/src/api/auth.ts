// 认证 API 封装：register / signIn / signOut / onboard / getStudentCore / patchStudentCore
import type { SessionUser } from "../store/user";

// 所有请求都携带 cookie（credentials: include）
async function apiFetch(path: string, init?: RequestInit) {
  const res = await fetch(path, { credentials: "include", ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error ?? `Request failed: ${res.status}`);
  }
  return data;
}

// ─── 认证 ─────────────────────────────────────────────────
export async function register(email: string, password: string, name: string): Promise<SessionUser> {
  const data = await apiFetch("/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, name }),
  });
  return data.user;
}

export async function signIn(email: string, password: string): Promise<SessionUser> {
  const data = await apiFetch("/auth/signin", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  return data.user;
}

export async function signOut(): Promise<void> {
  await apiFetch("/auth/signout", { method: "POST" });
}

// ─── 学生档案 ─────────────────────────────────────────────
export interface StudentCore {
  userId: string;
  nativeLanguage: string | null;   // 未完成 onboarding 时为 null
  uiLanguage: string;
  hskLevelSelf: number;
  learningGoals: string[];         // 学习目的标签数组
  conversationStyle: string;
  createdAt: string;
  updatedAt: string;
}

export async function getStudentCore(): Promise<StudentCore> {
  return apiFetch("/api/student/core");
}

export async function patchStudentCore(data: Partial<Omit<StudentCore, "userId" | "createdAt" | "updatedAt">>): Promise<StudentCore> {
  return apiFetch("/api/student/core", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function onboard(data: {
  nativeLanguage: string;
  hskLevelSelf?: number;
  learningGoals?: string[];
}): Promise<{ ok: boolean; core: StudentCore }> {
  return apiFetch("/api/student/onboard", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
}

export async function patchName(name: string): Promise<SessionUser> {
  return apiFetch("/api/student/name", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
}

// ─── Word Book 云同步（登录后把 localStorage 卡组合并到云端） ──
export interface SyncDecksResult {
  ok: boolean;
  merged?: { newDecks: number; newCards: number; skipped: number };
  skipped?: boolean; // 向后兼容旧返回格式
}

export async function syncDecks(decks: unknown[]): Promise<SyncDecksResult> {
  return apiFetch("/api/decks/sync", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ decks }),
  });
}
