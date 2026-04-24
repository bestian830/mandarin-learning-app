// ── 卡组 ─────────────────────────────────────────────────────────
export interface Deck {
  id: string;
  name: string;
  isDefault?: boolean;
  createdAt: string;
}

// ── 闪卡 / 单词本 ──────────────────────────────────────────────────
export interface FlashCard {
  id: string;            // crypto.randomUUID()
  word: string;          // 简体中文
  traditional: string;   // 繁体
  pinyin: string;        // 带声调拼音
  pos: string;           // 词性 category
  meaning: string;       // 已废弃，保留兼容旧数据
  context?: string;      // 来源句子（搜索时的整句简体）
  note?: string;         // 用户自定义备注
  addedAt: string;       // ISO 日期
  box: number;           // Leitner 盒子 1-5
  nextReview: string;    // ISO 日期，下次复习时间
  lastReviewed?: string; // ISO 日期
  reviewCount: number;
  correctCount: number;
}

// ── 搜索结果 ─────────────────────────────────────────────────────
export interface CharPinyin {
  char: string;
  pinyin: string;
}

export interface Segment {
  word: string;
  traditional?: string;
  pinyin: string;
  tag: string;
  category: string;
  chars: CharPinyin[];
}

export interface SearchResult {
  simplified: string;
  traditional: string;
  pinyin: string;
  chars: CharPinyin[];
  segments: Segment[];
  sourceLang: string; // Azure 检测到的源语言代码，如 "en" "ja" "ko"
}
