// 单词本云端存储：与 flashcards.ts 接口对称，登录后由 useFlashcards() 切换过来
// 内部维护一次性拉取的缓存（GET /api/decks 已包含 flashcards），读操作同步从缓存返回；
// 写操作调用对应 REST 接口，成功后更新缓存。组件侧只需要在打开/切换卡组时 await reload()。

import type { Deck, FlashCard } from "../types/index";

// Leitner 盒子间隔（天）：box 1 = 立即，box 5 = 14 天
const BOX_INTERVALS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

const ACTIVE_KEY = "mm_active_deck";

// ── 缓存 ─────────────────────────────────────────────────────────
// 结构：[{ ...deck, cards: FlashCard[] }]
interface CachedDeck extends Deck {
  cards: FlashCard[];
}

let deckCache: CachedDeck[] = [];
let loaded = false;

// ── 日期工具 ─────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

/** 把任意 ISO 日期或 Date 字符串截取成 YYYY-MM-DD */
function toDateOnly(value: unknown): string {
  if (!value) return todayISO();
  return String(value).slice(0, 10);
}

// ── 转换：后端 JSON → 前端类型 ───────────────────────────────────

// 后端返回的卡组 JSON（字段与 Prisma model 对应）
interface DbCard {
  id: string;
  deckId: string;
  word: string | null;
  traditional: string | null;
  pinyin: string | null;
  definition: string | null;
  pos: string | null;
  context: string | null;
  note: string | null;
  box: number;
  nextReview: string | null;
  lastReviewed: string | null;
  reviewCount: number;
  correctCount: number;
  addedAt: string;
}

interface DbDeck {
  id: string;
  userId: string;
  name: string | null;
  isDefault?: boolean;
  createdAt: string;
  flashcards?: DbCard[];
}

function toFlashCard(db: DbCard): FlashCard {
  const word = db.word ?? "";
  return {
    id: db.id,
    word,
    traditional: db.traditional ?? word,
    pinyin: db.pinyin ?? "",
    pos: db.pos ?? "other",
    meaning: db.definition ?? "",
    context: db.context ?? undefined,
    note: db.note ?? undefined,
    addedAt: toDateOnly(db.addedAt),
    box: db.box ?? 1,
    nextReview: toDateOnly(db.nextReview),
    lastReviewed: db.lastReviewed ? toDateOnly(db.lastReviewed) : undefined,
    reviewCount: db.reviewCount ?? 0,
    correctCount: db.correctCount ?? 0,
  };
}

function toDeck(db: DbDeck): Deck {
  return {
    id: db.id,
    name: db.name ?? "My Deck",
    isDefault: db.isDefault ?? false,
    createdAt: toDateOnly(db.createdAt),
  };
}

// ── REST 调用 ────────────────────────────────────────────────────

async function apiFetch(path: string, init?: RequestInit): Promise<unknown> {
  const res = await fetch(path, { credentials: "include", ...init });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = (data as { error?: string }).error ?? `Request failed: ${res.status}`;
    throw new Error(msg);
  }
  return data;
}

// ── 缓存管理 ─────────────────────────────────────────────────────

function findCachedDeck(deckId: string): CachedDeck | undefined {
  return deckCache.find(d => d.id === deckId);
}

/**
 * 从后端拉取所有卡组 + 闪卡，重建缓存。
 * 组件在 WordBook 打开时应 await 这个方法以确保数据就绪。
 */
export async function reload(): Promise<void> {
  const raw = (await apiFetch("/api/decks")) as DbDeck[];
  deckCache = raw.map(deck => ({
    ...toDeck(deck),
    cards: (deck.flashcards ?? []).map(toFlashCard),
  }));
  loaded = true;
}

/** 重置缓存（登出时调用，避免下次切换账号后残留） */
export function resetCache(): void {
  deckCache = [];
  loaded = false;
}

// ── 卡组管理 ─────────────────────────────────────────────────────

export function getDecks(): Deck[] {
  return deckCache.map(({ cards: _cards, ...deck }) => deck);
}

export async function createDeck(name: string): Promise<Deck> {
  const raw = (await apiFetch("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() }),
  })) as DbDeck;
  const deck = toDeck(raw);
  deckCache.push({ ...deck, cards: [] });
  // 首个卡组自动设为活跃
  if (deckCache.length === 1) localStorage.setItem(ACTIVE_KEY, deck.id);
  return deck;
}

export async function deleteDeck(id: string): Promise<void> {
  await apiFetch(`/api/decks/${encodeURIComponent(id)}`, { method: "DELETE" });
  deckCache = deckCache.filter(d => d.id !== id);
  if (localStorage.getItem(ACTIVE_KEY) === id) {
    localStorage.setItem(ACTIVE_KEY, deckCache[0]?.id ?? "");
  }
}

export async function renameDeck(id: string, name: string): Promise<void> {
  const raw = (await apiFetch(`/api/decks/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name: name.trim() }),
  })) as DbDeck;
  const idx = deckCache.findIndex(d => d.id === id);
  if (idx !== -1) deckCache[idx].name = raw.name ?? name.trim();
}

// ── 活跃卡组 ─────────────────────────────────────────────────────

export function getActiveDeckId(): string {
  const saved = localStorage.getItem(ACTIVE_KEY) ?? "";
  if (saved && deckCache.some(d => d.id === saved)) return saved;
  return deckCache[0]?.id ?? "";
}

export function setActiveDeckId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

// ── 闪卡 CRUD ────────────────────────────────────────────────────

export function getAll(deckId: string): FlashCard[] {
  return findCachedDeck(deckId)?.cards ?? [];
}

export async function add(
  card: Pick<FlashCard, "word" | "traditional" | "pinyin" | "pos" | "meaning" | "context">,
  deckId: string,
): Promise<FlashCard> {
  const today = todayISO();
  const raw = (await apiFetch(`/api/decks/${encodeURIComponent(deckId)}/cards`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      word: card.word,
      traditional: card.traditional,
      pinyin: card.pinyin,
      pos: card.pos,
      context: card.context,
      box: 1,
      nextReview: today,
    }),
  })) as DbCard;
  const newCard = toFlashCard(raw);
  const cached = findCachedDeck(deckId);
  if (cached) cached.cards.push(newCard);
  return newCard;
}

export async function remove(id: string, deckId: string): Promise<void> {
  await apiFetch(`/api/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(id)}`, {
    method: "DELETE",
  });
  const cached = findCachedDeck(deckId);
  if (cached) cached.cards = cached.cards.filter(c => c.id !== id);
}

/** 更新卡片备注 */
export async function updateNote(id: string, deckId: string, note: string): Promise<void> {
  await apiFetch(`/api/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(id)}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ note }),
  });
  const cached = findCachedDeck(deckId);
  if (cached) {
    const card = cached.cards.find(c => c.id === id);
    if (card) card.note = note;
  }
}

/** 跨所有卡组检查某个词是否已存在（从缓存，同步） */
export function exists(word: string): boolean {
  return deckCache.some(deck => deck.cards.some(c => c.word === word));
}

/** 获取指定卡组今天待复习的卡片，按 box ASC 排序（从缓存，同步） */
export function getDueCards(deckId: string): FlashCard[] {
  const today = todayISO();
  const cards = findCachedDeck(deckId)?.cards ?? [];
  return cards
    .filter(c => c.nextReview <= today)
    .sort((a, b) => a.box - b.box);
}

/**
 * 复习一张卡片：答对 box+1，答错回 box 1。
 * 本地先算好下一次 box / nextReview，再 PATCH 到后端保持一致。
 */
export async function reviewCard(
  id: string,
  correct: boolean,
  deckId: string,
): Promise<FlashCard | null> {
  const cached = findCachedDeck(deckId);
  if (!cached) return null;
  const idx = cached.cards.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const card = { ...cached.cards[idx] };
  const today = todayISO();

  card.reviewCount += 1;
  card.lastReviewed = today;

  if (correct) {
    card.correctCount += 1;
    card.box = Math.min(card.box + 1, 5);
  } else {
    card.box = 1;
  }
  card.nextReview = addDays(today, BOX_INTERVALS[card.box]);

  // 同步到后端；失败也回滚缓存避免 UI 状态漂移
  try {
    await apiFetch(`/api/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        box: card.box,
        nextReview: card.nextReview,
        lastReviewed: card.lastReviewed,
        reviewCount: card.reviewCount,
        correctCount: card.correctCount,
      }),
    });
  } catch (err) {
    console.error("[flashcardsApi.reviewCard] patch failed", err);
    return null;
  }

  cached.cards[idx] = card;
  return card;
}

/** 复习一张卡片：模糊 — box 不变，按当前 box 间隔排下次复习 */
export async function reviewCardFuzzy(
  id: string,
  deckId: string,
): Promise<FlashCard | null> {
  const cached = findCachedDeck(deckId);
  if (!cached) return null;
  const idx = cached.cards.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const card = { ...cached.cards[idx] };
  const today = todayISO();

  card.reviewCount += 1;
  card.lastReviewed = today;
  card.nextReview = addDays(today, BOX_INTERVALS[card.box]);

  try {
    await apiFetch(`/api/decks/${encodeURIComponent(deckId)}/cards/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        nextReview: card.nextReview,
        lastReviewed: card.lastReviewed,
        reviewCount: card.reviewCount,
      }),
    });
  } catch (err) {
    console.error("[flashcardsApi.reviewCardFuzzy] patch failed", err);
    return null;
  }

  cached.cards[idx] = card;
  return card;
}

/**
 * 拼音修正：云端缓存内同步更新字段。
 * 不回写后端（修正本身是前端读显示问题，后端数据以 HanLP 为准）。
 */
export function applyPinyinOverrides(overrides: Record<string, string>): void {
  for (const deck of deckCache) {
    for (const card of deck.cards) {
      const corrected = overrides[card.word];
      if (corrected && corrected !== card.pinyin) card.pinyin = corrected;
    }
  }
}

/** 统计指定卡组数据 */
export function getStats(deckId: string): { total: number; dueToday: number } {
  const cards = findCachedDeck(deckId)?.cards ?? [];
  const today = todayISO();
  return {
    total: cards.length,
    dueToday: cards.filter(c => c.nextReview <= today).length,
  };
}

/** 缓存是否已加载过（用于组件决定是否显示 loading） */
export function isLoaded(): boolean {
  return loaded;
}
