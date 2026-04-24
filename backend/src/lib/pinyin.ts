// 封装 pinyin（hotoo/pinyin v4）+ nodejieba 分词：汉字→带声调拼音
// 相比 pinyin-pro，nodejieba 先分词再查音，可正确处理多音字
// 如：转行→zhuǎn háng（而非 zhuǎn xíng）
import pkg from "pinyin";
const { pinyin: toPinyinArr, STYLE_TONE } = pkg;

// 整段文字→空格分隔拼音字符串
export function toPinyin(chinese: string): string {
  return toPinyinArr(chinese, { style: STYLE_TONE, segment: "nodejieba" })
    .map(p => p[0] ?? "")
    .join(" ");
}

const isCjk = (c: string) => /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(c);
const isDigit = (c: string) => /^[0-9]$/.test(c);

// 阿拉伯数字 → 中文读音拼音
const DIGIT_PINYIN: Record<string, string> = {
  "0": "líng", "1": "yī", "2": "èr", "3": "sān", "4": "sì",
  "5": "wǔ", "6": "liù", "7": "qī", "8": "bā", "9": "jiǔ",
};

// 逐字返回 {char, pinyin}，供前端逐字对齐显示
// 注意：pinyin v4 对中英混合文本会把英文单词合并为一个 token（如 "NBA"→["NBA"]），
// 导致按索引对齐时后续汉字全部错位。解决方案：仅对汉字部分调用 toPinyinArr，
// 非汉字字符直接赋空字符串，再按 CJK 计数器回填。
export function toPinyinChars(text: string): Array<{ char: string; pinyin: string }> {
  const chars = Array.from(text);
  // 只取汉字，避免英文 token 污染索引
  const cjkOnly = chars.filter(isCjk).join("");
  const pinyins = toPinyinArr(cjkOnly, { style: STYLE_TONE, segment: "nodejieba" });
  let cjkIdx = 0;
  return chars.map(char => ({
    char,
    pinyin: isCjk(char)
      ? (pinyins[cjkIdx++]?.[0] ?? "")
      : isDigit(char)
        ? (DIGIT_PINYIN[char] ?? "")
        : "",
  }));
}

// 将 Azure 拼音转写（空格分隔的音节串）与原文汉字对齐
// 若 token 数量与汉字数量不符，返回 null，由调用方 fallback 到 nodejieba
export function alignAzurePinyin(
  text: string,
  pinyinStr: string
): Array<{ char: string; pinyin: string }> | null {
  const chars = Array.from(text);
  const tokens = pinyinStr.trim().split(/\s+/).filter(t => t.length > 0);
  const isCjk = (c: string) => /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(c);
  const isDigitChar = (c: string) => /^[0-9]$/.test(c);
  // 汉字 + 数字都需要拼音 token 对齐
  const needPinyin = (c: string) => isCjk(c) || isDigitChar(c);
  const needCount = chars.filter(needPinyin).length;

  // token 数量须与需要拼音的字符数量一致，否则对齐结果不可信
  if (tokens.length !== needCount) return null;

  let tokenIdx = 0;
  return chars.map(char => ({
    char,
    pinyin: needPinyin(char) ? (tokens[tokenIdx++] ?? "") : "",
  }));
}
