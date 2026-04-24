// POST /api/search — 英文输入 → 简体 + 繁体 + 拼音
import { Router, Request, Response } from "express";
import { translateToZh, transliterateZh } from "../lib/translate.js";
import { toTraditional } from "../lib/traditional.js";
import { toPinyin, toPinyinChars, alignAzurePinyin } from "../lib/pinyin.js";
import { segmentText } from "../lib/segment.js";
import { upsertWords, getPinyinOverrides } from "../db/index.js";
import type { SearchResult, ErrorResponse } from "../types/index.js";

const router = Router();

router.post(
  "/search",
  async (
    req: Request<{}, SearchResult | ErrorResponse, { query?: string }>,
    res: Response<SearchResult | ErrorResponse>
  ) => {
    const query = req.body?.query?.trim();
    if (!query) {
      res.status(400).json({ error: "query is required" });
      return;
    }

    try {
      const { text: simplified, sourceLang, pinyinStr: pinyinFromTranslate } = await translateToZh(query);
      // 翻译接口对中文输入不返回 transliteration，单独调用转写接口补全
      const pinyinStr = pinyinFromTranslate ?? await transliterateZh(simplified);
      const traditional = toTraditional(simplified);
      const pinyin = pinyinStr ?? toPinyin(simplified);
      // 优先使用 Azure 拼音（多音字准确），token 不匹配时 fallback 到本地 pinyin-pro
      const chars = (pinyinStr ? alignAzurePinyin(simplified, pinyinStr) : null)
        ?? toPinyinChars(simplified);
      const segments = segmentText(simplified, chars);

      // 应用拼音词库修正：override 优先于自动生成的拼音
      const words = segments.map(s => s.word);
      const overrides = getPinyinOverrides(words);
      for (const seg of segments) {
        const override = overrides.get(seg.word);
        if (override) {
          seg.pinyin = override;
          // 同步更新 chars 中的逐字拼音
          const syllables = override.split(/\s+/);
          let sIdx = 0;
          for (const ch of seg.chars) {
            if (ch.pinyin !== "") {
              ch.pinyin = syllables[sIdx++] ?? ch.pinyin;
            }
          }
        }
      }

      res.json({ simplified, traditional, pinyin, chars, segments, sourceLang });

      // 词频写入：fire-and-forget，不阻塞响应
      setImmediate(() => upsertWords(segments));
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Translation service unavailable";
      res.status(502).json({ error: message });
    }
  }
);

export default router;
