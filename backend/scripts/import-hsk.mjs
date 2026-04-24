#!/usr/bin/env node
// HSK 词库导入脚本
// 读取 Excel 文件，清空 word_stats 表，写入全部 HSK 词汇（count=1）
// 用法: node scripts/import-hsk.mjs [excel文件路径]

import XLSX from "xlsx";
import Database from "better-sqlite3";
import { join, dirname } from "path";
import { copyFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, "..");

// 默认 Excel 路径
const excelPath = process.argv[2] || "/Users/ryan/Downloads/hsk_vocab_cleaned.xlsx";
const dbPath = join(PROJECT_ROOT, "data", "words.db");

console.log(`📖 读取 Excel: ${excelPath}`);
console.log(`💾 数据库路径: ${dbPath}`);

// ── 1. 读取 Excel ──────────────────────────────────────────────────────
const workbook = XLSX.readFile(excelPath);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet);

console.log(`📊 Excel 共 ${rows.length} 行`);

// 解析每一行
const entries = rows.map((row) => ({
  display_order: Number(row["序号"]) || 0,
  hsk_level: String(row["等级"]).trim(),  // '1','2',...,'6','7-9'
  word: String(row["词语"]).trim(),
  traditional: row["繁体"] ? String(row["繁体"]).trim() : null,
  pinyin: row["拼音"] ? String(row["拼音"]).trim() : null,
  zhuyin: row["注音"] ? String(row["注音"]).trim() : null,
  hsk_pos: row["词性"] ? String(row["词性"]).trim() : null,
}));

// 统计各等级词数
const levelCounts = {};
for (const e of entries) {
  levelCounts[e.hsk_level] = (levelCounts[e.hsk_level] || 0) + 1;
}
console.log("📈 各等级词数:", levelCounts);

// ── 2. 备份数据库 ───────────────────────────────────────────────────────
if (existsSync(dbPath)) {
  const bakPath = dbPath + ".bak";
  copyFileSync(dbPath, bakPath);
  console.log(`🔒 已备份: ${bakPath}`);
}

// ── 3. 重建 word_stats 表 ──────────────────────────────────────────────
const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

// 保留 i18n_cache，只重建 word_stats
db.exec("DROP TABLE IF EXISTS word_stats");
db.exec(`
  CREATE TABLE word_stats (
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
  CREATE INDEX idx_count     ON word_stats(count DESC);
  CREATE INDEX idx_hsk_level ON word_stats(hsk_level);
  CREATE INDEX idx_word      ON word_stats(word);
`);

// ── 4. 批量插入 ────────────────────────────────────────────────────────
const insertStmt = db.prepare(`
  INSERT INTO word_stats (word, traditional, pinyin, zhuyin, hsk_level, hsk_pos, display_order, count)
  VALUES (@word, @traditional, @pinyin, @zhuyin, @hsk_level, @hsk_pos, @display_order, 1)
`);

const insertAll = db.transaction((items) => {
  let inserted = 0;
  let skipped = 0;
  for (const item of items) {
    try {
      insertStmt.run(item);
      inserted++;
    } catch (err) {
      // UNIQUE 冲突 = 同一个词同一个等级出现两次，跳过
      if (err.message.includes("UNIQUE constraint")) {
        skipped++;
      } else {
        throw err;
      }
    }
  }
  return { inserted, skipped };
});

const result = insertAll(entries);
console.log(`✅ 插入 ${result.inserted} 条，跳过 ${result.skipped} 条重复`);

// 验证
const total = db.prepare("SELECT COUNT(*) as n FROM word_stats").get();
const sample = db.prepare("SELECT word, traditional, pinyin, zhuyin, hsk_level, hsk_pos FROM word_stats LIMIT 5").all();
console.log(`📋 word_stats 总计 ${total.n} 行`);
console.log("📋 示例数据:", sample);

db.close();
console.log("🎉 导入完成！");
