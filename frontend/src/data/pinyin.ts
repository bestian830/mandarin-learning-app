// 拼音教学数据：声调、声母、韵母、整体认读、拼写规则
// tones 数组：[一声, 二声, 三声, 四声, 轻声]，null 表示该调不常见
// bopomo 字段：该音节的注音符号（无调，运行时加调号）

export interface InitialEntry {
  pinyin:   string;            // 声母，如 "b"
  syllable: string;            // 示范音节（用于 applyTone 生成带调拼音），如 "ba"
  bopomo:   string;            // 示范音节的注音符号（无调），如 "ㄅㄚ"
  tones:    (string | null)[]; // 代表汉字，供展示
}

export interface InitialGroup {
  groupKey: string;            // i18n 键，如 "pyGrpBilabial"
  initials: InitialEntry[];
}

export interface FinalEntry {
  pinyin: string;              // 韵母名，如 "a"、"ai"、"ü"
  bopomo: string;              // 韵母注音符号（无调），如 "ㄚ"
  tones:  (string | null)[];
}

export interface FinalGroup {
  groupKey: string;
  finals: FinalEntry[];
}

export interface WholeSyllableEntry {
  pinyin: string;
  bopomo: string;
  tones:  (string | null)[];
}

// 声调Tab：可切换的六个单韵母
// chars: 各调对应的零声母汉字（有则优先用字符 TTS，null 则用注音符号 TTS）
// 顺序：[一声, 二声, 三声, 四声, 轻声]
export const TONE_FINALS = [
  { pinyin: "a", bopomo: "ㄚ", chars: [null,  null,  null,  null,  "啊"] },
  { pinyin: "o", bopomo: "ㄛ", chars: [null,  null,  null,  null,  null] },
  { pinyin: "e", bopomo: "ㄜ", chars: [null,  "鹅",  null,  "饿",  null] },
  { pinyin: "i", bopomo: "ㄧ", chars: ["衣",  "姨",  "椅",  "意",  null] },
  { pinyin: "u", bopomo: "ㄨ", chars: ["乌",  "无",  "五",  "务",  null] },
  { pinyin: "ü", bopomo: "ㄩ", chars: ["迂",  "鱼",  "雨",  "玉",  null] },
];

// 声调示范数据（标题/描述用 i18n 键）
export const TONE_DEMOS = [
  { tone: 1, toneKey: "pyTone1", descKey: "pyDesc1" },
  { tone: 2, toneKey: "pyTone2", descKey: "pyDesc2" },
  { tone: 3, toneKey: "pyTone3", descKey: "pyDesc3" },
  { tone: 4, toneKey: "pyTone4", descKey: "pyDesc4" },
  { tone: 0, toneKey: "pyToneN", descKey: "pyDescN" },
];

// 声母表 — 按发音部位分组
export const INITIALS: InitialGroup[] = [
  { groupKey: "pyGrpBilabial", initials: [
    { pinyin: "b",  syllable: "ba",  bopomo: "ㄅㄚ",  tones: ["八","拔","把","爸","吧"] },
    { pinyin: "p",  syllable: "pa",  bopomo: "ㄆㄚ",  tones: ["趴","爬", null,"怕", null] },
    { pinyin: "m",  syllable: "ma",  bopomo: "ㄇㄚ",  tones: ["妈","麻","马","骂","吗"] },
  ]},
  { groupKey: "pyGrpLabiodental", initials: [
    { pinyin: "f",  syllable: "fa",  bopomo: "ㄈㄚ",  tones: ["发","罚","法", null, null] },
  ]},
  { groupKey: "pyGrpAlveolar", initials: [
    { pinyin: "d",  syllable: "da",  bopomo: "ㄉㄚ",  tones: ["搭","达","打","大", null] },
    { pinyin: "t",  syllable: "ti",  bopomo: "ㄊㄧ",  tones: ["踢","题","体","替", null] },
    { pinyin: "n",  syllable: "ni",  bopomo: "ㄋㄧ",  tones: ["妮","泥","你","逆", null] },
    { pinyin: "l",  syllable: "la",  bopomo: "ㄌㄚ",  tones: ["拉", null,"喇","辣","啦"] },
  ]},
  { groupKey: "pyGrpVelar", initials: [
    { pinyin: "g",  syllable: "ge",  bopomo: "ㄍㄜ",  tones: ["歌","格","葛","个", null] },
    { pinyin: "k",  syllable: "ke",  bopomo: "ㄎㄜ",  tones: ["科","咳","可","课", null] },
    { pinyin: "h",  syllable: "he",  bopomo: "ㄏㄜ",  tones: ["喝","河", null,"贺", null] },
  ]},
  { groupKey: "pyGrpPalatal", initials: [
    { pinyin: "j",  syllable: "ji",  bopomo: "ㄐㄧ",  tones: ["鸡","及","几","记", null] },
    { pinyin: "q",  syllable: "qi",  bopomo: "ㄑㄧ",  tones: ["期","齐","起","气", null] },
    { pinyin: "x",  syllable: "xi",  bopomo: "ㄒㄧ",  tones: ["西","习","洗","系", null] },
  ]},
  { groupKey: "pyGrpRetroflex", initials: [
    { pinyin: "zh", syllable: "zhi", bopomo: "ㄓ",    tones: ["知","直","纸","志", null] },
    { pinyin: "ch", syllable: "chi", bopomo: "ㄔ",    tones: ["吃","迟","尺","翅", null] },
    { pinyin: "sh", syllable: "shi", bopomo: "ㄕ",    tones: ["诗","时","史","是", null] },
    { pinyin: "r",  syllable: "ren", bopomo: "ㄖㄣ",  tones: [ null,"人","忍","认", null] },
  ]},
  { groupKey: "pyGrpSibilant", initials: [
    { pinyin: "z",  syllable: "zi",  bopomo: "ㄗ",    tones: ["资", null,"紫","字", null] },
    { pinyin: "c",  syllable: "ci",  bopomo: "ㄘ",    tones: [ null,"词","此","次", null] },
    { pinyin: "s",  syllable: "si",  bopomo: "ㄙ",    tones: ["思", null,"死","四", null] },
  ]},
  { groupKey: "pyGrpSemivowel", initials: [
    { pinyin: "y",  syllable: "ya",  bopomo: "ㄧㄚ",  tones: ["鸭","牙","哑","亚", null] },
    { pinyin: "w",  syllable: "wa",  bopomo: "ㄨㄚ",  tones: ["挖","娃","瓦","袜", null] },
  ]},
];

// 韵母表 — 按类型分组
export const FINALS: FinalGroup[] = [
  { groupKey: "pyGrpSimple", finals: [
    { pinyin: "a",  bopomo: "ㄚ",   tones: ["啊", null, null, null, null] },
    { pinyin: "o",  bopomo: "ㄛ",   tones: ["摸","魔","抹","墨", null] },
    { pinyin: "e",  bopomo: "ㄜ",   tones: ["歌","格","葛","个", null] },
    { pinyin: "i",  bopomo: "ㄧ",   tones: ["衣","姨","椅","意", null] },
    { pinyin: "u",  bopomo: "ㄨ",   tones: ["乌","无","五","务", null] },
    { pinyin: "ü",  bopomo: "ㄩ",   tones: ["迂","鱼","雨","玉", null] },
  ]},
  { groupKey: "pyGrpCompound", finals: [
    { pinyin: "ai", bopomo: "ㄞ",   tones: ["哎","癌","矮","爱", null] },
    { pinyin: "ei", bopomo: "ㄟ",   tones: ["黑", null, null,"背", null] },
    { pinyin: "ui", bopomo: "ㄨㄟ", tones: ["威","微","尾","位","喂"] },
    { pinyin: "ao", bopomo: "ㄠ",   tones: ["凹","熬","袄","傲", null] },
    { pinyin: "ou", bopomo: "ㄡ",   tones: ["欧", null,"藕", null, null] },
    { pinyin: "iu", bopomo: "ㄧㄡ", tones: ["优","油","有","又", null] },
    { pinyin: "ie", bopomo: "ㄧㄝ", tones: ["耶","爷","也","叶", null] },
    { pinyin: "üe", bopomo: "ㄩㄝ", tones: ["约", null, null,"月", null] },
    { pinyin: "er", bopomo: "ㄦ",   tones: [ null,"儿","耳","二", null] },
  ]},
  { groupKey: "pyGrpNasalFinal", finals: [
    { pinyin: "an",  bopomo: "ㄢ",   tones: ["安", null,"俺","暗", null] },
    { pinyin: "en",  bopomo: "ㄣ",   tones: ["恩", null, null, null,"嗯"] },
    { pinyin: "in",  bopomo: "ㄧㄣ", tones: ["因","银","引","印", null] },
    { pinyin: "un",  bopomo: "ㄨㄣ", tones: ["温","文","稳","问", null] },
    { pinyin: "ün",  bopomo: "ㄩㄣ", tones: ["晕","云","允","运", null] },
  ]},
  { groupKey: "pyGrpVelarNasal", finals: [
    { pinyin: "ang", bopomo: "ㄤ",   tones: ["肮","昂", null, null, null] },
    { pinyin: "eng", bopomo: "ㄥ",   tones: ["灯","朋","等","梦", null] },
    { pinyin: "ing", bopomo: "ㄧㄥ", tones: ["英","迎","影","映", null] },
    { pinyin: "ong", bopomo: "ㄨㄥ", tones: ["东","龙","孔","动", null] },
  ]},
];

// 整体认读音节（16 个）
export const WHOLE_SYLLABLES: WholeSyllableEntry[] = [
  { pinyin: "zhi",  bopomo: "ㄓ",    tones: ["知","直","纸","志", null] },
  { pinyin: "chi",  bopomo: "ㄔ",    tones: ["吃","迟","尺","翅", null] },
  { pinyin: "shi",  bopomo: "ㄕ",    tones: ["诗","时","史","是", null] },
  { pinyin: "ri",   bopomo: "ㄖ",    tones: [ null, null, null,"日", null] },
  { pinyin: "zi",   bopomo: "ㄗ",    tones: ["资", null,"紫","字", null] },
  { pinyin: "ci",   bopomo: "ㄘ",    tones: [ null,"词","此","次", null] },
  { pinyin: "si",   bopomo: "ㄙ",    tones: ["思", null,"死","四", null] },
  { pinyin: "yi",   bopomo: "ㄧ",    tones: ["衣","姨","椅","意", null] },
  { pinyin: "wu",   bopomo: "ㄨ",    tones: ["乌","无","五","务", null] },
  { pinyin: "yu",   bopomo: "ㄩ",    tones: ["迂","鱼","雨","玉", null] },
  { pinyin: "ye",   bopomo: "ㄧㄝ",  tones: ["耶","爷","也","叶", null] },
  { pinyin: "yue",  bopomo: "ㄩㄝ",  tones: ["约", null, null,"月", null] },
  { pinyin: "yuan", bopomo: "ㄩㄢ",  tones: ["冤","元","远","院", null] },
  { pinyin: "yin",  bopomo: "ㄧㄣ",  tones: ["因","银","引","印", null] },
  { pinyin: "yun",  bopomo: "ㄩㄣ",  tones: ["晕","云","允","运", null] },
  { pinyin: "ying", bopomo: "ㄧㄥ",  tones: ["英","迎","影","映", null] },
];

// 整体认读分组（3 组，用于 Whole Syllables Tab）
export interface WholeSyllableGroup {
  groupKey: string;
  syllables: string[];
}
export const WHOLE_SYLLABLE_GROUPS: WholeSyllableGroup[] = [
  { groupKey: "pyWholeSttGrp1", syllables: ["zhi","chi","shi","ri","zi","ci","si"] },
  { groupKey: "pyWholeSttGrp2", syllables: ["yi","wu","yu"] },
  { groupKey: "pyWholeSttGrp3", syllables: ["ye","yue","yuan","yin","yun","ying"] },
];

// 拼写规则（3 条核心规则）
export const SPELLING_RULES: { ruleKey: string; examples: string[] }[] = [
  // 1. 声调标注位置规则
  { ruleKey: "1", examples: ["yǒu (o)", "guì (i)", "xué (e)"] },
  // 2. ü 的书写变化规则
  { ruleKey: "2", examples: ["ju/qu/xu/yu = jü/qü/xü/yü", "lv→lü, nv→nü"] },
  // 3. 隔音符号
  { ruleKey: "3", examples: ["Xī'ān ≠ Xiān", "pí'áo ≠ piáo"] },
];

// 注音书写规则（繁体模式下使用）
export const BOPOMOFO_RULES: { ruleKey: string; examples: string[] }[] = [
  // 1. 声调标记方式
  { ruleKey: "bp1", examples: ["ㄇㄚˇ (三声)", "ㄇㄚˊ (二声)", "ㄇㄚˋ (四声)"] },
  // 2. 空韵母音节
  { ruleKey: "bp2", examples: ["ㄓ", "ㄔ", "ㄕ", "ㄗ"] },
  // 3. 结合韵母
  { ruleKey: "bp3", examples: ["ㄐㄩ", "ㄑㄩ", "ㄒㄩ"] },
];

// ── 工具函数 ────────────────────────────────────────────────────────────────

// 音调符号映射表（索引 0-3 对应一~四声，索引 4 为无调）
const TONE_MAP: Record<string, string[]> = {
  a: ["ā","á","ǎ","à","a"],
  e: ["ē","é","ě","è","e"],
  i: ["ī","í","ǐ","ì","i"],
  o: ["ō","ó","ǒ","ò","o"],
  u: ["ū","ú","ǔ","ù","u"],
  ü: ["ǖ","ǘ","ǚ","ǜ","ü"],
};

/**
 * 给拼音音节加上声调符号
 * tone: 1~4 为四声，0 为轻声（原样返回）
 */
export function applyTone(syllable: string, tone: number): string {
  if (tone === 0) return syllable;
  const idx = tone - 1;

  // 规则1：含 a 或 e，声调标在 a/e 上
  for (const v of ["a", "e"] as const) {
    if (syllable.includes(v)) {
      return syllable.replace(v, TONE_MAP[v][idx]);
    }
  }

  // 规则2：含 ou，声调标在 o 上
  if (syllable.includes("ou")) {
    return syllable.replace("o", TONE_MAP["o"][idx]);
  }

  // 规则3：其余标在最后一个元音上
  const chars = Array.from(syllable);
  for (let i = chars.length - 1; i >= 0; i--) {
    const ch = chars[i];
    if (TONE_MAP[ch]) {
      return chars.slice(0, i).join("") + TONE_MAP[ch][idx] + chars.slice(i + 1).join("");
    }
  }

  return syllable;
}

/**
 * 给注音符号加上声调标记
 * tone: 1 无标记，2=ˊ，3=ˇ，4=ˋ，0=˙（轻声置于最前）
 */
export function applyBopomoTone(bopomo: string, tone: number): string {
  if (tone === 0) return "˙" + bopomo;
  if (tone === 1) return bopomo;
  return bopomo + (["", "ˊ", "ˇ", "ˋ"][tone - 1] ?? "");
}

// 声调序号 → 显示标签（含调号符号）
export const TONE_LABELS = ["一声", "二声", "三声", "四声", "轻声"];
export const TONE_MARKS  = ["¹", "²", "³", "⁴", "·"];

// ── 拼音 → 注音转换器 ──────────────────────────────────────────────────────

// 声调符号 → [基础字母, 声调号]
const TONE_STRIP: Record<string, [string, number]> = {
  'ā': ['a', 1], 'á': ['a', 2], 'ǎ': ['a', 3], 'à': ['a', 4],
  'ē': ['e', 1], 'é': ['e', 2], 'ě': ['e', 3], 'è': ['e', 4],
  'ī': ['i', 1], 'í': ['i', 2], 'ǐ': ['i', 3], 'ì': ['i', 4],
  'ō': ['o', 1], 'ó': ['o', 2], 'ǒ': ['o', 3], 'ò': ['o', 4],
  'ū': ['u', 1], 'ú': ['u', 2], 'ǔ': ['u', 3], 'ù': ['u', 4],
  'ǖ': ['ü', 1], 'ǘ': ['ü', 2], 'ǚ': ['ü', 3], 'ǜ': ['ü', 4],
};

// 声母 → 注音
const BPMF_INITIALS: Record<string, string> = {
  'b': 'ㄅ', 'p': 'ㄆ', 'm': 'ㄇ', 'f': 'ㄈ',
  'd': 'ㄉ', 't': 'ㄊ', 'n': 'ㄋ', 'l': 'ㄌ',
  'g': 'ㄍ', 'k': 'ㄎ', 'h': 'ㄏ',
  'j': 'ㄐ', 'q': 'ㄑ', 'x': 'ㄒ',
  'zh': 'ㄓ', 'ch': 'ㄔ', 'sh': 'ㄕ', 'r': 'ㄖ',
  'z': 'ㄗ', 'c': 'ㄘ', 's': 'ㄙ',
};

// 韵母 → 注音
const BPMF_FINALS: Record<string, string> = {
  'a': 'ㄚ', 'o': 'ㄛ', 'e': 'ㄜ', 'i': 'ㄧ', 'u': 'ㄨ', 'ü': 'ㄩ',
  'ai': 'ㄞ', 'ei': 'ㄟ', 'ao': 'ㄠ', 'ou': 'ㄡ',
  'an': 'ㄢ', 'en': 'ㄣ', 'ang': 'ㄤ', 'eng': 'ㄥ', 'er': 'ㄦ',
  'ia': 'ㄧㄚ', 'ie': 'ㄧㄝ', 'iao': 'ㄧㄠ', 'iu': 'ㄧㄡ', 'iou': 'ㄧㄡ',
  'ian': 'ㄧㄢ', 'in': 'ㄧㄣ', 'iang': 'ㄧㄤ', 'ing': 'ㄧㄥ', 'iong': 'ㄩㄥ',
  'ua': 'ㄨㄚ', 'uo': 'ㄨㄛ', 'uai': 'ㄨㄞ', 'ui': 'ㄨㄟ', 'uei': 'ㄨㄟ',
  'uan': 'ㄨㄢ', 'un': 'ㄨㄣ', 'uen': 'ㄨㄣ', 'uang': 'ㄨㄤ', 'ong': 'ㄨㄥ',
  'üe': 'ㄩㄝ', 'üan': 'ㄩㄢ', 'ün': 'ㄩㄣ',
};

// y/w 开头的独立音节 → 注音
const BPMF_SPECIAL: Record<string, string> = {
  'yi': 'ㄧ', 'ya': 'ㄧㄚ', 'ye': 'ㄧㄝ', 'yao': 'ㄧㄠ', 'you': 'ㄧㄡ',
  'yan': 'ㄧㄢ', 'yin': 'ㄧㄣ', 'yang': 'ㄧㄤ', 'ying': 'ㄧㄥ', 'yong': 'ㄩㄥ',
  'yu': 'ㄩ', 'yue': 'ㄩㄝ', 'yuan': 'ㄩㄢ', 'yun': 'ㄩㄣ',
  'wu': 'ㄨ', 'wa': 'ㄨㄚ', 'wo': 'ㄨㄛ', 'wai': 'ㄨㄞ', 'wei': 'ㄨㄟ',
  'wan': 'ㄨㄢ', 'wen': 'ㄨㄣ', 'wang': 'ㄨㄤ', 'weng': 'ㄨㄥ',
};

/**
 * 将带声调的拼音音节转换为注音符号
 * 支持单音节 "nǐ" 和多音节 "nǐ hǎo"（空格分隔）
 */
export function pinyinToBopomofo(toned: string): string {
  if (!toned) return toned;

  // 多音节：按空格/连字符拆分，逐个转换
  if (/[\s-]/.test(toned)) {
    return toned.split(/(\s+|-)/).map(part =>
      /[\s-]/.test(part) ? part : pinyinToBopomofo(part)
    ).join('');
  }

  // 单音节：已经是注音符号 → 原样返回
  if (/[\u3100-\u312f\u31a0-\u31bf]/.test(toned)) return toned;

  // 去声调 → 基础音节 + 声调号
  let base = '';
  let tone = 0;
  for (const ch of toned.toLowerCase()) {
    const entry = TONE_STRIP[ch];
    if (entry) {
      base += entry[0];
      if (tone === 0) tone = entry[1];
    } else {
      base += ch;
    }
  }

  // v → ü（部分系统用 v 代替 ü）
  base = base.replace(/v/g, 'ü');

  // 查特殊音节（y/w 开头）
  if (BPMF_SPECIAL[base]) {
    return applyBopomoTone(BPMF_SPECIAL[base], tone);
  }

  // 提取声母（先试两字符 zh/ch/sh）
  let initial = '';
  let initialBpmf = '';
  if (base.length >= 2 && BPMF_INITIALS[base.slice(0, 2)]) {
    initial = base.slice(0, 2);
    initialBpmf = BPMF_INITIALS[initial];
  } else if (base.length >= 1 && BPMF_INITIALS[base.slice(0, 1)]) {
    initial = base.slice(0, 1);
    initialBpmf = BPMF_INITIALS[initial];
  }

  // 韵母
  let final = base.slice(initial.length);

  // zh/ch/sh/r/z/c/s + i → 空韵（注音只写声母）
  if (['zh', 'ch', 'sh', 'r', 'z', 'c', 's'].includes(initial) && final === 'i') {
    return applyBopomoTone(initialBpmf, tone);
  }

  // j/q/x + u → ü
  if ('jqx'.includes(initial) && final.startsWith('u')) {
    final = 'ü' + final.slice(1);
  }

  const finalBpmf = BPMF_FINALS[final] ?? '';

  // 无法转换时原样返回
  if (!initialBpmf && !finalBpmf) return toned;

  return applyBopomoTone(initialBpmf + finalBpmf, tone);
}
