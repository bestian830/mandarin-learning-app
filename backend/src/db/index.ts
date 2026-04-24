// SQLite 词频数据库（HSK 词库版）
// 文件位置：<项目根>/data/words.db
// 预填充 HSK 1-6 / 7-9 词汇（11,105 条），搜索后累计查询次数
// 同一个词在不同 HSK 等级各存一行，UNIQUE(word, hsk_level)

import Database from "better-sqlite3";
import { join } from "path";
import type { Segment } from "../types/index.js";

// 跳过这些分类，不记录到词频库
const SKIP_CATEGORIES = new Set(["punct", "other"]);

// 数据库文件路径（相对于后端根目录，dev/prod 均适用）
const DB_PATH = join(process.cwd(), "data", "words.db");

const db = new Database(DB_PATH);

// 启动时建表（如果导入脚本已建过则跳过）
db.exec(`
  CREATE TABLE IF NOT EXISTS i18n_cache (
    lang TEXT PRIMARY KEY,
    data TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS word_stats (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
    word            TEXT NOT NULL,
    traditional     TEXT,
    pinyin          TEXT,
    zhuyin          TEXT,
    category        TEXT,
    hsk_level       TEXT,
    hsk_pos         TEXT,
    display_order   INTEGER,
    count           INTEGER DEFAULT 1,
    pinyin_override TEXT,
    first_seen      TEXT DEFAULT (datetime('now')),
    last_seen       TEXT DEFAULT (datetime('now')),
    UNIQUE(word, hsk_level)
  );
  CREATE INDEX IF NOT EXISTS idx_count     ON word_stats(count DESC);
  CREATE INDEX IF NOT EXISTS idx_hsk_level ON word_stats(hsk_level);
  CREATE INDEX IF NOT EXISTS idx_word      ON word_stats(word);
`);

// ── Upsert：搜索时更新词频 ──────────────────────────────────────────────

// 先尝试更新已有行（所有匹配 word 的行都 +1）
const updateStmt = db.prepare(`
  UPDATE word_stats SET count = count + 1, last_seen = datetime('now')
  WHERE word = @word
`);

// 如果没有更新到任何行，插入新行（非 HSK 词，hsk_level=NULL）
const insertStmt = db.prepare(`
  INSERT OR IGNORE INTO word_stats (word, traditional, pinyin, category, hsk_level)
  VALUES (@word, @traditional, @pinyin, @category, NULL)
`);

// 批量 UPSERT，用事务保证原子性和写入性能
const upsertBatch = db.transaction((segments: Segment[]) => {
  for (const seg of segments) {
    if (SKIP_CATEGORIES.has(seg.category)) continue;
    const params = {
      word:        seg.word,
      traditional: seg.traditional ?? null,
      pinyin:      seg.pinyin || null,
      category:    seg.category,
    };
    const result = updateStmt.run(params);
    if (result.changes === 0) {
      // 词不在 HSK 词库中，作为非 HSK 词插入
      insertStmt.run(params);
    }
  }
});

export interface WordRow {
  word: string;
  traditional: string | null;
  pinyin: string | null;
  zhuyin: string | null;
  count: number;
  hsk_level: string | null;
  hsk_pos: string | null;
}

// 首页 chip：只显示实际搜索过的词（count>1），多字，排除虚词
// 按 word 聚合取 MAX(count)，因为同一个词可能多个等级
const topStmt = db.prepare<[number], WordRow>(`
  SELECT word, traditional, COALESCE(pinyin_override, pinyin) AS pinyin, zhuyin,
         MAX(count) as count, MIN(hsk_level) as hsk_level, hsk_pos
  FROM word_stats
  WHERE count > 1
    AND LENGTH(word) >= 2
    AND (category IS NULL OR category NOT IN ('particle', 'conj', 'pronoun', 'number', 'other', 'adverb'))
  GROUP BY word
  ORDER BY count DESC LIMIT ?
`);

// 词库面板：分页查询，仅 HSK 词汇，按查询次数降序
function getAllWordsPaged(limit: number, offset: number): WordRow[] {
  const stmt = db.prepare<[number, number], WordRow>(`
    SELECT word, traditional, COALESCE(pinyin_override, pinyin) AS pinyin, zhuyin,
           MAX(count) as count, MIN(hsk_level) as hsk_level, hsk_pos
    FROM word_stats
    WHERE hsk_level IS NOT NULL
    GROUP BY word
    ORDER BY count DESC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(limit, offset);
}

// 兼容旧接口：不带 offset 的全量查询
function getAllWords(limit: number): WordRow[] {
  return getAllWordsPaged(limit, 0);
}

// 按 HSK 等级查询词汇，按 display_order 排序
export interface HskWordRow {
  word: string;
  traditional: string | null;
  pinyin: string | null;
  zhuyin: string | null;
  hsk_pos: string | null;
}

function getWordsByLevel(level: string, limit: number, offset: number): HskWordRow[] {
  const stmt = db.prepare<[string, number, number], HskWordRow>(`
    SELECT word, traditional, COALESCE(pinyin_override, pinyin) AS pinyin, zhuyin, hsk_pos
    FROM word_stats
    WHERE hsk_level = ?
    ORDER BY display_order ASC
    LIMIT ? OFFSET ?
  `);
  return stmt.all(level, limit, offset);
}

// 查询某个等级的总词数
function getWordCountByLevel(level: string): number {
  const stmt = db.prepare<[string], { cnt: number }>(
    "SELECT COUNT(*) as cnt FROM word_stats WHERE hsk_level = ?"
  );
  return stmt.get(level)?.cnt ?? 0;
}

// ── 去声调拼音，用于模糊搜索 ──────────────────────────────────────────
const TONE_MAP: Record<string, string> = {
  ā: "a", á: "a", ǎ: "a", à: "a",
  ē: "e", é: "e", ě: "e", è: "e",
  ī: "i", í: "i", ǐ: "i", ì: "i",
  ō: "o", ó: "o", ǒ: "o", ò: "o",
  ū: "u", ú: "u", ǔ: "u", ù: "u",
  ǖ: "v", ǘ: "v", ǚ: "v", ǜ: "v", ü: "v",
};

function stripTones(s: string): string {
  return s.replace(/[āáǎàēéěèīíǐìōóǒòūúǔùǖǘǚǜü]/g, c => TONE_MAP[c] ?? c).toLowerCase();
}

// 词库模糊搜索：支持简体/繁体/拼音（无声调），按相似度排序
function searchWords(query: string, limit: number): WordRow[] {
  // 先拉取所有词（SQLite 不擅长复杂模糊排序，在 JS 层排序）
  // 用 LIKE 粗筛，减少 JS 层的计算量
  const q = query.trim().toLowerCase();
  if (!q) return getAllWordsPaged(limit, 0);

  const qStripped = stripTones(q);

  // 粗筛：简体/繁体 LIKE 或 拼音去声调 LIKE
  const likePattern = `%${q}%`;
  const likeStripped = `%${qStripped}%`;
  const stmt = db.prepare(`
    SELECT word, traditional, COALESCE(pinyin_override, pinyin) AS pinyin, zhuyin,
           pinyin AS pinyin_raw,
           MAX(count) as count, MIN(hsk_level) as hsk_level, hsk_pos
    FROM word_stats
    WHERE word LIKE ? OR traditional LIKE ? OR pinyin LIKE ? OR pinyin LIKE ?
    GROUP BY word
  `);
  const rows = stmt.all(likePattern, likePattern, likePattern, likeStripped) as (WordRow & { pinyin_raw: string })[];

  // 精细排序：越像的排越前
  const scored = rows.map(row => {
    let score = 0;
    const w = row.word.toLowerCase();
    const t = (row.traditional ?? "").toLowerCase();
    const p = stripTones(row.pinyin_raw ?? row.pinyin ?? "");

    // 完全匹配得分最高
    if (w === q || t === q) score = 100;
    else if (p === qStripped || p.replace(/[-\s]/g, "") === qStripped.replace(/[-\s]/g, "")) score = 90;
    // 前缀匹配
    else if (w.startsWith(q) || t.startsWith(q)) score = 80;
    else if (p.startsWith(qStripped) || p.replace(/[-\s]/g, "").startsWith(qStripped.replace(/[-\s]/g, ""))) score = 70;
    // 包含匹配
    else if (w.includes(q) || t.includes(q)) score = 60;
    else if (p.includes(qStripped) || p.replace(/[-\s]/g, "").includes(qStripped.replace(/[-\s]/g, ""))) score = 50;
    else score = 10;

    // 短词优先（更精确的匹配）
    score += Math.max(0, 10 - w.length);
    // 搜索过的词微弱加权
    if (row.count > 1) score += 2;

    return { ...row, score };
  });

  scored.sort((a, b) => b.score - a.score || b.count - a.count);
  return scored.slice(0, limit).map(({ score, pinyin_raw, ...row }) => row);
}

// i18n 缓存读写
const getI18nStmt = db.prepare<[string], { data: string }>("SELECT data FROM i18n_cache WHERE lang = ?");
const setI18nStmt = db.prepare("INSERT OR REPLACE INTO i18n_cache (lang, data) VALUES (?, ?)");

export function getI18nCache(lang: string): Record<string, string> | null {
  const row = getI18nStmt.get(lang);
  if (!row) return null;
  try { return JSON.parse(row.data); } catch { return null; }
}

export function setI18nCache(lang: string, data: Record<string, string>): void {
  setI18nStmt.run(lang, JSON.stringify(data));
}

export function getTopWords(limit: number): WordRow[] {
  return topStmt.all(limit);
}

export { getAllWords, getAllWordsPaged, searchWords, getWordsByLevel, getWordCountByLevel };

export function upsertWords(segments: Segment[]): void {
  try {
    upsertBatch(segments);
  } catch (err) {
    // 词频写入失败不影响主流程，静默记录
    console.error("[db] upsertWords error:", err);
  }
}

// ── 拼音修正词库 ────────────────────────────────────────────────────────

interface PinyinOverrideRow {
  word: string;
  pinyin_override: string;
}

// 查询某个词的所有 override（可能多行，取第一个非 NULL 的）
const getOverridesBatchStmt = db.prepare<[], PinyinOverrideRow>(
  "SELECT DISTINCT word, pinyin_override FROM word_stats WHERE pinyin_override IS NOT NULL"
);

// 设置某个词的拼音修正（更新所有匹配的行）
const setOverrideStmt = db.prepare(
  "UPDATE word_stats SET pinyin_override = ? WHERE word = ?"
);

// 批量查询多个词的 override（用于搜索时高效查询）
export function getPinyinOverrides(words: string[]): Map<string, string> {
  const all = getOverridesBatchStmt.all();
  const map = new Map<string, string>();
  for (const row of all) {
    if (words.includes(row.word)) {
      map.set(row.word, row.pinyin_override);
    }
  }
  return map;
}

// 设置某个词的拼音修正
export function setPinyinOverride(word: string, pinyin: string): boolean {
  const result = setOverrideStmt.run(pinyin, word);
  return result.changes > 0;
}

// 获取所有已修正的词（管理用）
export function getAllOverrides(): PinyinOverrideRow[] {
  return getOverridesBatchStmt.all();
}
