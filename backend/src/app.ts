// Express 应用入口：注册中间件和路由，启动服务
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import searchRouter    from "./routes/search.js";
import ttsRouter       from "./routes/tts.js";
import statsRouter     from "./routes/stats.js";
import i18nRouter      from "./routes/i18n.js";
import pronounceRouter from "./routes/pronounce.js";
import vocabRouter     from "./routes/vocab.js";
import authRouter      from "./routes/auth.js";
import studentRouter   from "./routes/student.js";
import decksRouter     from "./routes/decks.js";

const app = express();
const PORT = process.env.PORT || 3001;

// 允许前端 dev server 跨域请求，且允许携带 cookie
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}));
app.use(express.json());
app.use(cookieParser());

// ─── 认证路由（无需登录） ─────────────────────────────────
app.use("/auth", authRouter);

// ─── 业务路由（已有功能） ─────────────────────────────────
app.use("/api", searchRouter);
app.use("/api", ttsRouter);
app.use("/api", statsRouter);
app.use("/api", i18nRouter);
app.use("/api", pronounceRouter);
app.use("/api", vocabRouter);

// ─── 用户相关路由（需登录） ───────────────────────────────
app.use("/api/student", studentRouter);
app.use("/api/decks", decksRouter);

// 健康检查
app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

app.listen(PORT, () => {
  console.log(`Backend running on http://localhost:${PORT}`);
});

export default app;
