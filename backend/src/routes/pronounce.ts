// GET /api/pronounce?syllable=ba&tone=1
// 代理 du.hanyupinyin.cn 标准普通话拼音录音（MP3）
// URL 格式：http://du.hanyupinyin.cn/du/pinyin/{音节}{声调}.mp3
// 例：ba1.mp3、yi2.mp3、a4.mp3

import { Router } from "express";

const router = Router();

// 内存缓存：避免对同一音节重复请求（服务重启后清空）
const audioCache = new Map<string, Buffer>();

router.get("/pronounce", async (req, res) => {
  const syllable = (req.query.syllable as string)?.trim().toLowerCase();
  const tone     = parseInt(req.query.tone as string, 10);

  if (!syllable || isNaN(tone) || tone < 1 || tone > 4) {
    res.status(400).json({ error: "syllable (string) and tone (1-4) required" });
    return;
  }

  const key = `${syllable}${tone}`;

  const cached = audioCache.get(key);
  if (cached) {
    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.send(cached);
    return;
  }

  try {
    const upstream = await fetch(
      `http://du.hanyupinyin.cn/du/pinyin/${encodeURIComponent(key)}.mp3`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
          "Referer":    "http://du.hanyupinyin.cn/",
        },
        signal: AbortSignal.timeout(6000),
      }
    );

    if (!upstream.ok) {
      console.error("[pronounce] upstream error", upstream.status, key);
      res.status(502).json({ error: "Pronunciation unavailable" });
      return;
    }

    // 部分音节不存在时，站点可能返回 HTML 错误页而非 MP3
    const contentType = upstream.headers.get("content-type") ?? "";
    if (!contentType.includes("audio") && !contentType.includes("mpeg") && !contentType.includes("octet")) {
      console.warn("[pronounce] non-audio response for", key, contentType);
      res.status(404).json({ error: "Audio not found for this syllable/tone" });
      return;
    }

    const buf = Buffer.from(await upstream.arrayBuffer());
    audioCache.set(key, buf);

    res.set("Content-Type", "audio/mpeg");
    res.set("Cache-Control", "public, max-age=86400");
    res.set("Content-Length", String(buf.length));
    res.send(buf);
  } catch (e) {
    console.error("[pronounce]", (e as Error).message, key);
    res.status(502).json({ error: "Pronunciation service unavailable" });
  }
});

export default router;
