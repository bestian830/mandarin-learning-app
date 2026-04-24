// Word Book 云同步路由：多卡组 CRUD + localStorage 合并迁移
import { Router } from "express";
import type { Request, Response } from "express";
import { requireAuth } from "../auth/middleware.js";
import { prisma } from "../db/client.js";

const router = Router();

// ─── GET /api/decks ──────────────────────────────────────
// 返回当前用户所有卡组 + 每组的闪卡（按 addedAt 升序）
router.get("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  try {
    const decks = await prisma.userDeck.findMany({
      where: { userId },
      include: { flashcards: { orderBy: { addedAt: "asc" } } },
      orderBy: { createdAt: "asc" },
    });
    res.json(decks);
  } catch (err) {
    console.error("[decks GET]", err);
    res.status(500).json({ error: "Failed to fetch decks" });
  }
});

// ─── POST /api/decks ─────────────────────────────────────
router.post("/", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { name } = req.body ?? {};

  try {
    // 用户没有任何卡组时，第一个自动标记为默认卡组
    const existing = await prisma.userDeck.count({ where: { userId } });
    const isDefault = existing === 0;

    const deck = await prisma.userDeck.create({
      data: { userId, name: name ?? "My Deck", isDefault },
    });
    res.status(201).json(deck);
  } catch (err) {
    console.error("[decks POST]", err);
    res.status(500).json({ error: "Failed to create deck" });
  }
});

// ─── PATCH /api/decks/:id ────────────────────────────────
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const deckId = String(req.params.id);
  const { name } = req.body ?? {};

  try {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) { res.status(404).json({ error: "Deck not found" }); return; }

    const updated = await prisma.userDeck.update({
      where: { id: deckId },
      data: { name },
    });
    res.json(updated);
  } catch (err) {
    console.error("[decks PATCH]", err);
    res.status(500).json({ error: "Failed to update deck" });
  }
});

// ─── DELETE /api/decks/:id ───────────────────────────────
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const deckId = String(req.params.id);

  try {
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) { res.status(404).json({ error: "Deck not found" }); return; }

    // 默认卡组不可删除
    if (deck.isDefault) {
      res.status(403).json({ error: "Cannot delete default deck" });
      return;
    }

    await prisma.userDeck.delete({ where: { id: deckId } });
    res.json({ ok: true });
  } catch (err) {
    console.error("[decks DELETE]", err);
    res.status(500).json({ error: "Failed to delete deck" });
  }
});

// ─── POST /api/decks/:id/cards ───────────────────────────
// 添加一张闪卡到指定卡组；支持前端 FlashCard 全量字段
router.post("/:id/cards", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const deckId = String(req.params.id);
  const {
    word,
    traditional,
    pinyin,
    definition,
    pos,
    context,
    note,
    box,
    nextReview,
  } = req.body ?? {};

  try {
    // 验证卡组归属
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) { res.status(404).json({ error: "Deck not found" }); return; }

    const card = await prisma.userFlashcard.create({
      data: {
        deckId,
        word,
        traditional: traditional ?? null,
        pinyin: pinyin ?? null,
        definition: definition ?? null,
        pos: pos ?? null,
        context: context ?? null,
        note: note ?? null,
        box: typeof box === "number" ? box : 1,
        nextReview: nextReview ? new Date(nextReview) : new Date(),
      },
    });
    res.status(201).json(card);
  } catch (err) {
    console.error("[decks/cards POST]", err);
    res.status(500).json({ error: "Failed to add card" });
  }
});

// ─── PATCH /api/decks/:id/cards/:cardId ─────────────────
// 更新闪卡的 SRS 状态：box、nextReview、lastReviewed、reviewCount、correctCount
router.patch("/:id/cards/:cardId", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const deckId = String(req.params.id);
  const cardId = String(req.params.cardId);
  const { box, nextReview, lastReviewed, reviewCount, correctCount, note } = req.body ?? {};

  try {
    // 验证 deck 归属
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) { res.status(404).json({ error: "Deck not found" }); return; }

    // 二次校验：卡片确属于该卡组
    const existingCard = await prisma.userFlashcard.findFirst({
      where: { id: cardId, deckId },
    });
    if (!existingCard) { res.status(404).json({ error: "Card not found" }); return; }

    const card = await prisma.userFlashcard.update({
      where: { id: cardId },
      data: {
        ...(box !== undefined && { box: Number(box) }),
        ...(nextReview !== undefined && { nextReview: new Date(nextReview) }),
        ...(lastReviewed !== undefined && { lastReviewed: new Date(lastReviewed) }),
        ...(reviewCount !== undefined && { reviewCount: Number(reviewCount) }),
        ...(correctCount !== undefined && { correctCount: Number(correctCount) }),
        ...(note !== undefined && { note: String(note) }),
      },
    });
    res.json(card);
  } catch (err) {
    console.error("[decks/cards PATCH]", err);
    res.status(500).json({ error: "Failed to update card" });
  }
});

// ─── DELETE /api/decks/:id/cards/:cardId ────────────────
// 从卡组中删除一张闪卡
router.delete("/:id/cards/:cardId", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const deckId = String(req.params.id);
  const cardId = String(req.params.cardId);

  try {
    // 验证卡组归属
    const deck = await prisma.userDeck.findFirst({
      where: { id: deckId, userId },
    });
    if (!deck) { res.status(404).json({ error: "Deck not found" }); return; }

    // 确认卡片确属于该卡组后再删
    const existingCard = await prisma.userFlashcard.findFirst({
      where: { id: cardId, deckId },
    });
    if (!existingCard) { res.status(404).json({ error: "Card not found" }); return; }

    await prisma.userFlashcard.delete({ where: { id: cardId } });
    res.json({ ok: true });
  } catch (err) {
    console.error("[decks/cards DELETE]", err);
    res.status(500).json({ error: "Failed to delete card" });
  }
});

// ─── POST /api/decks/sync ────────────────────────────────
// 登录/注册后把 localStorage 的卡组合并到云端
// 合并语义（去掉旧的 existing>0 skip 短路，避免跨设备丢词）：
//   1. 按 deck.name 匹配后端已有 deck；无则新建
//   2. 对每张本地卡 (word)：
//      - 同 word 在该 deck 已存在 → 跳过（保留后端的 SRS 进度）
//      - 否则插入
interface LocalCard {
  id?: string;
  word?: string;
  traditional?: string;
  pinyin?: string;
  definition?: string;     // 前端可能传 definition 或 meaning，二者等价
  meaning?: string;
  pos?: string;
  context?: string;
  note?: string;
  box?: number;
  nextReview?: string | null;
  lastReviewed?: string | null;
  reviewCount?: number;
  correctCount?: number;
}

interface LocalDeck {
  id?: string;
  name?: string;
  cards?: LocalCard[];
}

router.post("/sync", requireAuth, async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const { decks } = req.body ?? {};

  if (!Array.isArray(decks)) {
    res.status(400).json({ error: "decks array is required" });
    return;
  }

  try {
    let newDeckCount = 0;
    let newCardCount = 0;
    let skippedCardCount = 0;

    for (const localDeck of decks as LocalDeck[]) {
      const deckName = (localDeck.name ?? "My Deck").trim() || "My Deck";

      // 1. 按 name 查后端已有 deck，无则新建
      let deck = await prisma.userDeck.findFirst({
        where: { userId, name: deckName },
      });
      if (!deck) {
        deck = await prisma.userDeck.create({
          data: { userId, name: deckName },
        });
        newDeckCount += 1;
      }

      const localCards = Array.isArray(localDeck.cards) ? localDeck.cards : [];
      if (localCards.length === 0) continue;

      // 2. 查出该 deck 已有词，用于去重
      const existing = await prisma.userFlashcard.findMany({
        where: { deckId: deck.id },
        select: { word: true },
      });
      const existingWords = new Set(existing.map(c => c.word).filter(Boolean));

      // 3. 过滤未入库的卡，批量插入
      const toInsert = localCards
        .filter(c => c.word && !existingWords.has(c.word))
        .map(c => ({
          deckId: deck!.id,
          word: c.word ?? null,
          traditional: c.traditional ?? null,
          pinyin: c.pinyin ?? null,
          // 兼容 meaning / definition 两种字段名
          definition: c.definition ?? c.meaning ?? null,
          pos: c.pos ?? null,
          context: c.context ?? null,
          note: c.note ?? null,
          box: typeof c.box === "number" ? c.box : 1,
          nextReview: c.nextReview ? new Date(c.nextReview) : null,
          lastReviewed: c.lastReviewed ? new Date(c.lastReviewed) : null,
          reviewCount: typeof c.reviewCount === "number" ? c.reviewCount : 0,
          correctCount: typeof c.correctCount === "number" ? c.correctCount : 0,
        }));

      skippedCardCount += localCards.length - toInsert.length;
      if (toInsert.length > 0) {
        await prisma.userFlashcard.createMany({ data: toInsert });
        newCardCount += toInsert.length;
      }
    }

    res.json({
      ok: true,
      merged: {
        newDecks: newDeckCount,
        newCards: newCardCount,
        skipped: skippedCardCount,
      },
    });
  } catch (err) {
    console.error("[decks/sync]", err);
    res.status(500).json({ error: "Sync failed" });
  }
});

export default router;
