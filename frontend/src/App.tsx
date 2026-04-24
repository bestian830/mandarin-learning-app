// 应用根组件：路由 + session 初始化 + 登录保护
import { useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useUserStore } from "./store/user";
import * as flashcardsApi from "./lib/flashcardsApi";
import LoadingScreen from "./components/LoadingScreen";
import Home from "./pages/Home";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import OnboardingPage from "./pages/OnboardingPage";
import ProfilePage from "./pages/ProfilePage";

/** 需要登录才能访问的路由保护组件 */
function RequireAuth({ children }: { children: React.ReactNode }) {
  const user = useUserStore(s => s.user);
  if (!user) return <Navigate to="/auth/login" replace />;
  return <>{children}</>;
}

export default function App() {
  const loading = useUserStore((s) => s.loading);
  const user = useUserStore((s) => s.user);

  // 应用启动时检查一次 session（仅 mount 时运行，不依赖函数引用）
  useEffect(() => {
    useUserStore.getState().fetchSession();
  }, []);

  // 登录状态变化时同步云端单词本缓存：
  // - 登录 / session 恢复 → 预热 cache（Result.tsx 的 exists() 等同步调用才有数据）
  // - 登出 → 清空 cache，避免下次换账号时残留
  useEffect(() => {
    if (user) {
      flashcardsApi.reload().catch(err => console.error("[App] flashcards reload", err));
    } else {
      flashcardsApi.resetCache();
    }
  }, [user]);

  if (loading) return <LoadingScreen />;

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth/login" element={<LoginPage />} />
        <Route path="/auth/register" element={<RegisterPage />} />
        <Route path="/auth/onboarding" element={<OnboardingPage />} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        {/* 未知路由重定向首页（RequireAuth 会再次判断登录态） */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
