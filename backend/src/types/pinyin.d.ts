// pinyin 包（hotoo/pinyin v4）的类型声明
declare module "pinyin" {
  interface PinyinOptions {
    style?: number;
    heteronym?: boolean;
    segment?: boolean | "nodejieba" | "segmentit" | "@node-rs/jieba";
  }

  export const STYLE_TONE: number;    // 带声调（ā á ǎ à）
  export const STYLE_TONE2: number;   // 数字声调（a1 a2 a3 a4）
  export const STYLE_NORMAL: number;  // 无声调

  export function pinyin(text: string, options?: PinyinOptions): string[][];

  const pkg: {
    pinyin: typeof pinyin;
    STYLE_TONE: typeof STYLE_TONE;
    STYLE_TONE2: typeof STYLE_TONE2;
    STYLE_NORMAL: typeof STYLE_NORMAL;
  };
  export default pkg;
}
