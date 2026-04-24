// 学生档案路由：GET/PATCH /api/student/core，POST /api/student/onboard
import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../auth/middleware.js";
import { prisma } from "../db/client.js";

const router = Router();

// ─── GET /api/student/core ───────────────────────────────
router.get("/core", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;

  try {
    const core = await prisma.studentCore.findUnique({ where: { userId } });
    if (!core) {
      // 首次登录可能没有 core，自动创建
      const newCore = await prisma.studentCore.create({ data: { userId } });
      res.json(newCore);
      return;
    }
    res.json(core);
  } catch (err) {
    console.error("[student/core GET]", err);
    res.status(500).json({ error: "Failed to fetch profile" });
  }
});

// ─── PATCH /api/student/core ─────────────────────────────
router.patch("/core", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const {
    nativeLanguage,
    uiLanguage,
    hskLevelSelf,
    learningGoals,
    conversationStyle,
  } = req.body ?? {};

  // 只更新传入的字段
  const data: Record<string, unknown> = {};
  if (nativeLanguage !== undefined) data.nativeLanguage = nativeLanguage;
  if (uiLanguage !== undefined) data.uiLanguage = uiLanguage;
  if (hskLevelSelf !== undefined) data.hskLevelSelf = Number(hskLevelSelf);
  if (Array.isArray(learningGoals)) data.learningGoals = learningGoals;
  if (conversationStyle !== undefined) data.conversationStyle = conversationStyle;

  try {
    const core = await prisma.studentCore.upsert({
      where: { userId },
      update: data,
      create: { userId, ...data },
    });
    res.json(core);
  } catch (err) {
    console.error("[student/core PATCH]", err);
    res.status(500).json({ error: "Failed to update profile" });
  }
});

// ─── PATCH /api/student/name ─────────────────────────────
// 允许用户修改显示名
router.patch("/name", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name } = req.body ?? {};

  if (!name || typeof name !== "string" || !name.trim()) {
    res.status(400).json({ error: "name is required" });
    return;
  }

  try {
    const user = await prisma.user.update({
      where: { id: userId },
      data: { name: name.trim() },
      select: { id: true, email: true, name: true, image: true },
    });
    res.json(user);
  } catch (err) {
    console.error("[student/name PATCH]", err);
    res.status(500).json({ error: "Failed to update name" });
  }
});

// ─── POST /api/student/onboard ───────────────────────────
// Onboarding 向导一次性提交：只有 nativeLanguage 必填；hskLevelSelf / learningGoals 可跳过
router.post("/onboard", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { nativeLanguage, hskLevelSelf, learningGoals } = req.body ?? {};

  if (!nativeLanguage || typeof nativeLanguage !== "string") {
    res.status(400).json({ error: "nativeLanguage is required" });
    return;
  }

  // 可选字段的缺省值
  const hsk = hskLevelSelf === undefined || hskLevelSelf === null ? 0 : Number(hskLevelSelf);
  const goals = Array.isArray(learningGoals) ? learningGoals : [];

  try {
    const core = await prisma.studentCore.upsert({
      where: { userId },
      update: {
        nativeLanguage,
        uiLanguage: nativeLanguage,   // onboarding 时同步设置 UI 语言
        hskLevelSelf: hsk,
        learningGoals: goals,
      },
      create: {
        userId,
        nativeLanguage,
        uiLanguage: nativeLanguage,
        hskLevelSelf: hsk,
        learningGoals: goals,
      },
    });
    res.json({ ok: true, core });
  } catch (err) {
    console.error("[student/onboard]", err);
    res.status(500).json({ error: "Onboarding failed" });
  }
});

export default router;
