// GET /api/stats/top?limit=5&lang=en
// 返回词频最高的 N 个中文词（多字，count>1），并翻译为目标语言以供首页 chip 展示
//
// GET /api/stats/all?limit=30&offset=0
// 返回词库（count>1），分页，按查询次数降序，含 hsk_level / hsk_pos

import { Router } from "express";
import { getTopWords, getAllWordsPaged, searchWords, getWordsByLevel, getWordCountByLevel } from "../db/index.js";
import { translateTexts } from "../lib/translate.js";

const router = Router();

// 中文变体（大小写均兼容）
const ZH_LANGS = new Set(["zh", "zh-hans", "zh-hant", "zh-cn", "zh-tw", "zh-Hans", "zh-Hant"]);

router.get("/stats/top", async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 5, 20);
  const lang = ((req.query.lang as string) ?? "en").toLowerCase();

  const rows = getTopWords(limit);
  if (!rows.length) {
    res.json([]);
    return;
  }

  // 中文界面直接返回原词
  if (ZH_LANGS.has(lang)) {
    res.json(rows.map(r => ({ word: r.word, display: r.word, count: r.count, hsk_level: r.hsk_level })));
    return;
  }

  // 其他语言：批量调用 Azure 翻译
  const words = rows.map(r => r.word);
  const displayed = await translateTexts(words, lang);
  res.json(words.map((w, i) => ({
    word: w,
    display: displayed[i] ?? w,
    count: rows[i].count,
    hsk_level: rows[i].hsk_level,
  })));
});

// 词库面板：分页加载 / 模糊搜索
router.get("/stats/all", (req, res) => {
  const limit = Math.min(parseInt(req.query.limit as string) || 30, 100);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);
  const search = ((req.query.search as string) ?? "").trim();

  if (search) {
    // 模糊搜索模式：按相似度排序，不用 offset
    const rows = searchWords(search, limit);
    res.json(rows);
  } else {
    // 普通分页浏览
    const rows = getAllWordsPaged(limit, offset);
    res.json(rows);
  }
});

// HSK 分级词库：按等级分页查询
router.get("/stats/hsk", (req, res) => {
  const level = ((req.query.level as string) ?? "1").trim();
  const limit = Math.min(parseInt(req.query.limit as string) || 50, 200);
  const offset = Math.max(parseInt(req.query.offset as string) || 0, 0);

  const words = getWordsByLevel(level, limit, offset);
  const total = getWordCountByLevel(level);
  res.json({ words, total });
});

export default router;
