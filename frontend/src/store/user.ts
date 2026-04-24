// Zustand 全局用户状态
import { create } from "zustand";
import * as flashcardsApi from "../lib/flashcardsApi";

export interface SessionUser {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
}

interface UserStore {
  user: SessionUser | null;
  loading: boolean;         // 初始化 session 检查时为 true
  onboarded: boolean | null; // null = 未知，true/false = 已知

  setUser: (user: SessionUser | null) => void;
  setLoading: (v: boolean) => void;
  setOnboarded: (v: boolean) => void;
  fetchSession: () => Promise<void>;
  signOut: () => Promise<void>;
}

export const useUserStore = create<UserStore>((set) => ({
  user: null,
  loading: true,
  onboarded: null,

  setUser: (user) => set({ user }),
  setLoading: (loading) => set({ loading }),
  setOnboarded: (onboarded) => set({ onboarded }),

  fetchSession: async () => {
    set({ loading: true });
    try {
      const res = await fetch("/auth/session", { credentials: "include" });
      if (!res.ok) { set({ user: null, loading: false }); return; }
      const data = await res.json();
      set({ user: data.user ?? null, loading: false });
    } catch {
      set({ user: null, loading: false });
    }
  },

  signOut: async () => {
    await fetch("/auth/signout", { method: "POST", credentials: "include" });
    // 清空云端缓存，避免切换账号后残留上一个账号的卡组数据
    flashcardsApi.resetCache();
    set({ user: null, onboarded: null });
  },
}));
