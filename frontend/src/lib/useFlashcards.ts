// 单词本后端 hook：强制登录后始终走云端 API
// 保留 FlashcardsBackend 接口供组件使用，方便未来扩展

import type { Deck, FlashCard } from "../types/index";
import * as api from "./flashcardsApi";

// 新增卡片时的必填字段（不含 SRS 状态）
export type NewCardInput = Pick<
  FlashCard,
  "word" | "traditional" | "pinyin" | "pos" | "meaning" | "context"
>;

// 统一接口：所有写方法返回 Promise，读方法同步
export interface FlashcardsBackend {
  /** 从真源拉取最新状态 */
  reload: () => Promise<void>;
  resetCache: () => void;

  getDecks: () => Deck[];
  createDeck: (name: string) => Promise<Deck>;
  deleteDeck: (id: string) => Promise<void>;
  renameDeck: (id: string, name: string) => Promise<void>;

  getActiveDeckId: () => string;
  setActiveDeckId: (id: string) => void;

  getAll: (deckId: string) => FlashCard[];
  add: (card: NewCardInput, deckId: string) => Promise<FlashCard>;
  remove: (id: string, deckId: string) => Promise<void>;
  exists: (word: string) => boolean;
  updateNote: (id: string, deckId: string, note: string) => Promise<void>;

  getDueCards: (deckId: string) => FlashCard[];
  reviewCard: (id: string, correct: boolean, deckId: string) => Promise<FlashCard | null>;
  reviewCardFuzzy: (id: string, deckId: string) => Promise<FlashCard | null>;

  applyPinyinOverrides: (overrides: Record<string, string>) => void;
  getStats: (deckId: string) => { total: number; dueToday: number };
}

const apiBackend: FlashcardsBackend = {
  reload: api.reload,
  resetCache: api.resetCache,
  getDecks: api.getDecks,
  createDeck: api.createDeck,
  deleteDeck: api.deleteDeck,
  renameDeck: api.renameDeck,
  getActiveDeckId: api.getActiveDeckId,
  setActiveDeckId: api.setActiveDeckId,
  getAll: api.getAll,
  add: api.add,
  remove: api.remove,
  exists: api.exists,
  updateNote: api.updateNote,
  getDueCards: api.getDueCards,
  reviewCard: api.reviewCard,
  reviewCardFuzzy: api.reviewCardFuzzy,
  applyPinyinOverrides: api.applyPinyinOverrides,
  getStats: api.getStats,
};

/** 返回云端单词本后端（需登录后使用） */
export function useFlashcards(): FlashcardsBackend {
  return apiBackend;
}
