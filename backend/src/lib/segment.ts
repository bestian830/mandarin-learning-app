// 中文分词 + 词性标注，将简体中文按词切分并归类
// 使用 nodejieba tag() 返回 ICTCLAS 标准词性，映射为学习者友好的 8 大类

import { fileURLToPath } from "url";
import { join, dirname } from "path";
import pkg from "nodejieba";
const { tag, load } = pkg;
import { toTraditional } from "./traditional.js";
import type { CharPinyin, Segment } from "../types/index.js";

// 载入自定义用户词典，修正常见误分词（如"种颜色"被识别为专有名词）
const __dir = dirname(fileURLToPath(import.meta.url));
load({ userDict: join(__dir, "user_dict.utf8") });

// nodejieba ICTCLAS 标签 → 学习者分类
const TAG_MAP: Record<string, string> = {
  // 动词
  v: "verb", vd: "verb", vn: "verb", vg: "verb",
  // 名词（含地名 ns，对学习者统一显示为名词）
  n: "noun", nz: "noun", ns: "noun",
  // 专有名词（人名、机构名）
  nr: "proper", nt: "proper",
  // 代词
  r: "pronoun", rg: "pronoun",
  // 副词
  d: "adverb", dg: "adverb",
  // 形容词
  a: "adj", ad: "adj", an: "adj", ag: "adj",
  // 助词（jieba 细分子标签）、语气词、感叹词
  u: "particle", ug: "particle",
  uj: "particle",  // 的（结构助词）
  ud: "particle",  // 得
  ul: "particle",  // 了
  uz: "particle",  // 着
  uv: "particle",  // 地
  y: "particle", e: "particle",
  // 时间词、方位词
  t: "time", tg: "time", f: "time",
  // 量词、数词
  m: "number", mg: "number", mq: "number", q: "number",
  // 连词、介词（虚词）
  c: "conj", p: "conj",
  // 成语、习用语
  i: "idiom", l: "idiom",
};

// 明确的标点符号标签
const PUNCT_TAGS = new Set(["w"]);

// 判断是否含有 CJK 汉字
const hasCjk = (s: string) => /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(s);

// 构建单个 Segment 对象
function buildSegment(word: string, t: string, category: string, wordChars: CharPinyin[]): Segment {
  const pinyin = wordChars
    .map(c => c.pinyin)
    .filter(p => p.length > 0)
    .join(" ");
  const trad = toTraditional(word);
  const traditional = trad !== word ? trad : undefined;
  return { word, traditional, pinyin, tag: t, category, chars: wordChars };
}

// 将单个 jieba token 转为一个或多个 Segment
// 对 tag="x" 且含汉字的 token（HMM 误合并），逐字拆开并单独重新标注词性
function tokenToSegments(word: string, t: string, wordChars: CharPinyin[]): Segment[] {
  // 明确标点（"w"）或 "x" 不含汉字（如 ？，。）→ 单个 punct segment
  if (PUNCT_TAGS.has(t) || (t === "x" && !hasCjk(word))) {
    return [buildSegment(word, t, "punct", wordChars)];
  }

  // "x" 含汉字：HMM 误合并的未登录词组，逐字拆开重新 tag
  // 例："会赢"(x) → 会(v=verb) + 赢(v=verb)；"很强"(x) → 很(d=adverb) + 强(a=adj)
  if (t === "x") {
    return Array.from(word).map((ch, i) => {
      const chChars = wordChars.slice(i, i + 1);
      if (!hasCjk(ch)) return buildSegment(ch, "x", "punct", chChars);
      const reTag = tag(ch)[0]?.tag ?? "x";
      const category = TAG_MAP[reTag] ?? "other";
      return buildSegment(ch, reTag, category, chChars);
    });
  }

  // 正常 token
  return [buildSegment(word, t, TAG_MAP[t] ?? "other", wordChars)];
}

export function segmentText(text: string, chars: CharPinyin[]): Segment[] {
  const tagged = tag(text);

  let charIdx = 0;
  return tagged.flatMap(({ word, tag: t }) => {
    const wordLen = Array.from(word).length;
    const wordChars = chars.slice(charIdx, charIdx + wordLen);
    charIdx += wordLen;
    return tokenToSegments(word, t, wordChars);
  });
}
