// GET /api/tts?text=...&lang=zh-CN[&bopomo=true]
// 调用 Azure Speech TTS，返回 MP3 音频流
// bopomo=true 时用注音符号 phoneme 标签合成（拼音教学精准发音）

import { Router } from "express";
import { synthesize } from "../lib/tts.js";

const router = Router();

router.get("/tts", async (req, res) => {
  const text   = (req.query.text   as string)?.trim();
  const lang   = (req.query.lang   as string) || "en-US";
  const bopomo = req.query.bopomo === "true";

  if (!text) {
    res.status(400).json({ error: "text is required" });
    return;
  }

  try {
    const audio = await synthesize(text, lang, bopomo);
    res.set("Content-Type", "audio/mpeg");
    res.set("Content-Length", String(audio.length));
    res.send(audio);
  } catch (e) {
    console.error("[tts]", (e as Error).message);
    res.status(502).json({ error: "TTS service unavailable" });
  }
});

export default router;
