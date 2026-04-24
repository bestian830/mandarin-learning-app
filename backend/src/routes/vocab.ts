// 单词本 + 拼音管理路由
import { Router, type Request, type Response, type NextFunction } from "express";
import { lookupWord } from "../lib/dictionary.js";
import { setPinyinOverride, getAllOverrides } from "../db/index.js";

const router = Router();

// ── 管理员鉴权中间件 ─────────────────────────────────────────────────────────
// 需在 .env 中配置 ADMIN_SECRET，PATCH /word/:word/pinyin 等写操作均需携带：
//   Authorization: Bearer <ADMIN_SECRET>
const ADMIN_SECRET = process.env.ADMIN_SECRET ?? "";

function requireAdmin(req: Request, res: Response, next: NextFunction): void {
  if (!ADMIN_SECRET) {
    res.status(403).json({ error: "ADMIN_SECRET not configured on server" });
    return;
  }
  const auth = req.headers.authorization ?? "";
  if (auth !== `Bearer ${ADMIN_SECRET}`) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }
  next();
}

// POST /api/translate-word — 查询词的简体中文释义（moedict API，免费无 Key）
// toLang 参数保留兼容，但已不再使用（改为中文释义）
router.post("/translate-word", async (req, res) => {
  const { word } = req.body as { word?: string; toLang?: string };

  if (!word) {
    res.status(400).json({ error: "word is required" });
    return;
  }

  const meaning = await lookupWord(word);
  res.json({ meaning });
});

// PATCH /api/word/:word/pinyin — 修正某个词的拼音（仅管理员）
router.patch("/word/:word/pinyin", requireAdmin, (req, res) => {
  const word = decodeURIComponent(String(req.params.word));
  const { pinyin } = req.body as { pinyin?: string };

  if (!pinyin) {
    res.status(400).json({ error: "pinyin is required" });
    return;
  }

  const updated = setPinyinOverride(word, pinyin);
  if (updated) {
    res.json({ ok: true, word, pinyin });
  } else {
    res.status(404).json({ error: "Word not found in database" });
  }
});

// GET /api/words/overrides — 查看所有已修正的拼音（公开只读，无需鉴权）
router.get("/words/overrides", (_req, res) => {
  res.json(getAllOverrides());
});

export default router;
