// 本地词典查询模块：调用 moedict（台湾教育部重编国语辞典）API
// 免费、无需 API Key；本 session 内存缓存避免重复请求
// API 文档：https://www.moedict.tw/

import { toTraditional, toSimplified } from "./traditional.js";

// 内存缓存（进程生命周期内有效）
const cache = new Map<string, string>();

// 去除 moedict 标注格式符号（`词~ → 词）
function stripFormatting(text: string): string {
  return text.replace(/[`~]/g, "").trim();
}

// 调用 moedict API 获取繁体中文释义，转换为简体返回
// 未找到或出错均返回空字符串
export async function lookupWord(word: string): Promise<string> {
  // 命中缓存直接返回
  if (cache.has(word)) return cache.get(word)!;

  try {
    // moedict 使用繁体中文作为索引
    const traditional = toTraditional(word);
    const url = `https://www.moedict.tw/a/${encodeURIComponent(traditional)}.json`;

    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) {
      cache.set(word, "");
      return "";
    }

    const data = await res.json() as {
      h?: Array<{ d?: Array<{ f?: string }> }>;
    };

    const rawDef = data.h?.[0]?.d?.[0]?.f ?? "";
    const def = rawDef ? toSimplified(stripFormatting(rawDef)) : "";

    cache.set(word, def);
    return def;
  } catch {
    cache.set(word, "");
    return "";
  }
}
