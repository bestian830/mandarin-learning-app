#!/usr/bin/env node
// [已弃用] 此脚本原计划下载 moedict 批量数据。
// 当前实现改用 moedict 实时 API（library.ts）+ 内存缓存，无需此脚本。
// 保留此文件供将来切换到离线模式参考。
//
// 如需切换到离线模式（无网络环境），需先解决 moedict repo 的数据格式问题
// (dict-revised_bkup.json 格式待调研），再启用此脚本。

import { writeFile, mkdir } from "fs/promises";
import { join, dirname } from "path";
import { fileURLToPath } from "url";
import * as opencc from "opencc-js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_DIR  = join(__dirname, "../src/data");
const OUTPUT_PATH = join(OUTPUT_DIR, "moedict.json");

// 台湾繁体 → 大陆简体
const toSimplified = opencc.Converter({ from: "tw", to: "cn" });

const MOEDICT_URL =
  "https://raw.githubusercontent.com/g0v/moedict-data/master/dict.json";

console.log("Downloading moedict data (may take a moment)...");
const response = await fetch(MOEDICT_URL);
if (!response.ok) {
  throw new Error(`Download failed: ${response.status} ${response.statusText}`);
}

const data = await response.json();
console.log(`Downloaded ${data.length} entries.`);

// 构建紧凑字典：{ "简体词": "简体释义" }
// 每个词只取首个发音的首条释义
const dict = {};
let count = 0;

for (const entry of data) {
  const title = entry.title;
  if (!title) continue;

  const def = entry.heteronyms?.[0]?.definitions?.[0]?.def;
  if (!def) continue;

  const simplifiedTitle = toSimplified(title);
  const simplifiedDef   = toSimplified(def);

  // 同一简体词只保留第一个（通常是最常用的）
  if (!dict[simplifiedTitle]) {
    dict[simplifiedTitle] = simplifiedDef;
    count++;
  }
}

console.log(`Processed ${count} entries with definitions.`);

await mkdir(OUTPUT_DIR, { recursive: true });
await writeFile(OUTPUT_PATH, JSON.stringify(dict));
console.log(`Saved to ${OUTPUT_PATH}`);
