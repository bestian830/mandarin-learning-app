// 单词本 localStorage CRUD + Leitner 间隔重复算法
// 仅作匿名用户的本地存储；登录后由 flashcardsApi.ts 走后端 API
// 支持多卡组：mm_decks（卡组列表）+ mm_fc_{id}（每组闪卡）

import type { Deck, FlashCard } from "../types/index";

const DECKS_KEY = "mm_decks";
const CARD_KEY_PREFIX = "mm_fc_";
const CARD_KEY = (id: string) => `${CARD_KEY_PREFIX}${id}`;
const ACTIVE_KEY = "mm_active_deck";

// Leitner 盒子间隔（天）：box 1 = 立即，box 5 = 14 天
const BOX_INTERVALS: Record<number, number> = {
  1: 0,
  2: 1,
  3: 3,
  4: 7,
  5: 14,
};

// ── 日期工具 ──────────────────────────────────────────────────────

function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

function addDays(dateISO: string, days: number): string {
  const d = new Date(dateISO);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

// ── 读写 localStorage ────────────────────────────────────────────

function readDecks(): Deck[] {
  try {
    const raw = localStorage.getItem(DECKS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeDecks(decks: Deck[]): void {
  localStorage.setItem(DECKS_KEY, JSON.stringify(decks));
}

function readCards(deckId: string): FlashCard[] {
  try {
    const raw = localStorage.getItem(CARD_KEY(deckId));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function writeCards(deckId: string, cards: FlashCard[]): void {
  localStorage.setItem(CARD_KEY(deckId), JSON.stringify(cards));
}

// ── 迁移：旧 mm_flashcards → 默认"My Words"卡组 ──────────────────

function migrateIfNeeded(): void {
  const raw = localStorage.getItem("mm_flashcards");
  if (!raw) return;
  const decks = readDecks();
  if (decks.length === 0) {
    const deck: Deck = { id: crypto.randomUUID(), name: "My Words", createdAt: todayISO() };
    writeDecks([deck]);
    localStorage.setItem(CARD_KEY(deck.id), raw);
    localStorage.setItem(ACTIVE_KEY, deck.id);
  }
  localStorage.removeItem("mm_flashcards");
}

migrateIfNeeded();

// ── 卡组管理 ─────────────────────────────────────────────────────

export function getDecks(): Deck[] {
  return readDecks();
}

export function createDeck(name: string): Deck {
  const decks = readDecks();
  const deck: Deck = { id: crypto.randomUUID(), name: name.trim(), createdAt: todayISO() };
  decks.push(deck);
  writeDecks(decks);
  // 首个卡组自动设为活跃
  if (decks.length === 1) localStorage.setItem(ACTIVE_KEY, deck.id);
  return deck;
}

export function deleteDeck(id: string): void {
  writeDecks(readDecks().filter(d => d.id !== id));
  localStorage.removeItem(CARD_KEY(id));
  // 若删除的是活跃卡组，重置活跃
  if (localStorage.getItem(ACTIVE_KEY) === id) {
    const remaining = readDecks();
    localStorage.setItem(ACTIVE_KEY, remaining[0]?.id ?? "");
  }
}

export function renameDeck(id: string, name: string): void {
  const decks = readDecks();
  const idx = decks.findIndex(d => d.id === id);
  if (idx !== -1) {
    decks[idx].name = name.trim();
    writeDecks(decks);
  }
}

// ── 活跃卡组 ─────────────────────────────────────────────────────

/** 当前活跃卡组 id；若无则返回第一个卡组 id，若无卡组返回空字符串 */
export function getActiveDeckId(): string {
  const saved = localStorage.getItem(ACTIVE_KEY) ?? "";
  const decks = readDecks();
  if (saved && decks.some(d => d.id === saved)) return saved;
  return decks[0]?.id ?? "";
}

export function setActiveDeckId(id: string): void {
  localStorage.setItem(ACTIVE_KEY, id);
}

// ── 闪卡 CRUD ────────────────────────────────────────────────────

/** 获取指定卡组的所有闪卡 */
export function getAll(deckId: string): FlashCard[] {
  return readCards(deckId);
}

/** 添加一张新闪卡到指定卡组 */
export function add(
  card: Pick<FlashCard, "word" | "traditional" | "pinyin" | "pos" | "meaning" | "context">,
  deckId: string,
): FlashCard {
  const cards = readCards(deckId);
  const today = todayISO();
  const newCard: FlashCard = {
    ...card,
    id: crypto.randomUUID(),
    addedAt: today,
    box: 1,
    nextReview: today,
    reviewCount: 0,
    correctCount: 0,
  };
  cards.push(newCard);
  writeCards(deckId, cards);
  return newCard;
}

/** 从指定卡组删除闪卡 */
export function remove(id: string, deckId: string): void {
  writeCards(deckId, readCards(deckId).filter(c => c.id !== id));
}

/** 跨所有卡组检查某个词是否已存在 */
export function exists(word: string): boolean {
  return readDecks().some(deck =>
    readCards(deck.id).some(c => c.word === word)
  );
}

/** 获取指定卡组今天待复习的卡片，按 box ASC 排序 */
export function getDueCards(deckId: string): FlashCard[] {
  const today = todayISO();
  return readCards(deckId)
    .filter(c => c.nextReview <= today)
    .sort((a, b) => a.box - b.box);
}

/** 复习一张卡片：答对 box+1，答错回 box 1 */
export function reviewCard(id: string, correct: boolean, deckId: string): FlashCard | null {
  const cards = readCards(deckId);
  const idx = cards.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const card = cards[idx];
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

  cards[idx] = card;
  writeCards(deckId, cards);
  return card;
}

/** 复习一张卡片：模糊 — box 不变，按当前 box 间隔排下次复习 */
export function reviewCardFuzzy(id: string, deckId: string): FlashCard | null {
  const cards = readCards(deckId);
  const idx = cards.findIndex(c => c.id === id);
  if (idx === -1) return null;

  const card = cards[idx];
  const today = todayISO();

  card.reviewCount += 1;
  card.lastReviewed = today;
  card.nextReview = addDays(today, BOX_INTERVALS[card.box]);

  cards[idx] = card;
  writeCards(deckId, cards);
  return card;
}

/**
 * 将服务端拼音修正同步到所有卡组的 localStorage 闪卡。
 * 传入 { word → pinyin_override } 映射，只更新有变化的卡片。
 */
export function applyPinyinOverrides(overrides: Record<string, string>): void {
  for (const deck of readDecks()) {
    const cards = readCards(deck.id);
    let changed = false;
    for (const card of cards) {
      const corrected = overrides[card.word];
      if (corrected && corrected !== card.pinyin) {
        card.pinyin = corrected;
        changed = true;
      }
    }
    if (changed) writeCards(deck.id, cards);
  }
}

/** 统计指定卡组数据 */
export function getStats(deckId: string): { total: number; dueToday: number } {
  const cards = readCards(deckId);
  const today = todayISO();
  return {
    total: cards.length,
    dueToday: cards.filter(c => c.nextReview <= today).length,
  };
}

// ── 迁移 / 清理辅助 ───────────────────────────────────────────────

/** 打包当前所有卡组及其卡片，用于登录后 POST /api/decks/sync */
export function getDecksWithCards(): Array<Deck & { cards: FlashCard[] }> {
  return readDecks().map(deck => ({
    ...deck,
    cards: readCards(deck.id),
  }));
}

/** 清空匿名模式下的所有 word book 数据（登录迁移后 / 登出时调用） */
export function clearAll(): void {
  const decks = readDecks();
  for (const deck of decks) {
    localStorage.removeItem(CARD_KEY(deck.id));
  }
  // 兜底：扫描所有 mm_fc_ 前缀的孤儿 key
  const keysToRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i += 1) {
    const key = localStorage.key(i);
    if (key && key.startsWith(CARD_KEY_PREFIX)) keysToRemove.push(key);
  }
  for (const key of keysToRemove) localStorage.removeItem(key);

  localStorage.removeItem(DECKS_KEY);
  localStorage.removeItem(ACTIVE_KEY);
}
