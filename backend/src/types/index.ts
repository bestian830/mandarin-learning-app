// API 响应类型
export interface CharPinyin {
  char: string;
  pinyin: string;
}

export interface Segment {
  word: string;           // 词语，如 "喜欢"
  traditional?: string;   // 繁体（仅在与简体不同时存在）
  pinyin: string;         // 整词拼音，如 "xǐ huān"
  tag: string;            // nodejieba 原始标签，如 "v"
  category: string;       // 学习者分类，如 "verb"
  chars: CharPinyin[];    // 逐字拼音
}

export interface SearchResult {
  simplified: string;
  traditional: string;
  pinyin: string;
  chars: CharPinyin[];
  segments: Segment[];
  sourceLang: string;
}

export interface ErrorResponse {
  error: string;
}
