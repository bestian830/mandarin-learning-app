// 拼音/注音指南的中文内容数据
// 每个条目：s = 简体, t = 繁体（省略时同简体）, py = 拼音（空格分隔，每字一音节）
// 用于 PhoneticText 组件渲染带注音标注的中文文字

export interface ZhText {
  s: string;        // 简体
  t?: string;       // 繁体（省略时与简体相同）
  py: string;       // 拼音
}

// ── Tab 标签 ──────────────────────────────────────────────────────────
export const TAB_LABELS: Record<string, ZhText> = {
  overview: { s: "总览",     t: "總覽",     py: "zǒng lǎn" },
  initials: { s: "声母",     t: "聲母",     py: "shēng mǔ" },
  finals:   { s: "韵母",     t: "韻母",     py: "yùn mǔ" },
  whole:    { s: "整体认读", t: "整體認讀", py: "zhěng tǐ rèn dú" },
  rules:    { s: "书写规则", t: "書寫規則", py: "shū xiě guī zé" },
};

// ── 总览 Tab ──────────────────────────────────────────────────────────
export const OV_TITLE: ZhText         = { s: "拼音的工作原理",   t: "拼音的工作原理",   py: "pīn yīn de gōng zuò yuán lǐ" };
export const OV_INTRO: ZhText         = { s: "一个普通话音节等于声母加韵母加声调", t: "一個普通話音節等於聲母加韻母加聲調", py: "yī gè pǔ tōng huà yīn jié děng yú shēng mǔ jiā yùn mǔ jiā shēng diào" };
export const OV_INITIAL: ZhText       = { s: "声母",           t: "聲母",           py: "shēng mǔ" };
export const OV_FINAL: ZhText         = { s: "韵母",           t: "韻母",           py: "yùn mǔ" };
export const OV_INITIAL_DESC: ZhText  = { s: "开头辅音共二十三个", t: "開頭輔音共二十三個", py: "kāi tóu fǔ yīn gòng èr shí sān gè" };
export const OV_FINAL_DESC: ZhText    = { s: "元音序列承载声调共二十四个", t: "元音序列承載聲調共二十四個", py: "yuán yīn xù liè chéng zài shēng diào gòng èr shí sì gè" };
export const OV_TONE_TITLE: ZhText    = { s: "声调",           t: "聲調",           py: "shēng diào" };
export const OV_TONE_DESC: ZhText     = { s: "四个声调加一个轻声标在韵母主元音上", t: "四個聲調加一個輕聲標在韻母主元音上", py: "sì gè shēng diào jiā yī gè qīng shēng biāo zài yùn mǔ zhǔ yuán yīn shàng" };
export const OV_OPTIONAL: ZhText      = { s: "可选",           t: "可選",           py: "kě xuǎn" };
export const OV_EXAMPLES: ZhText      = { s: "例子",           t: "例子",           py: "lì zi" };
export const OV_WHOLE_TITLE: ZhText   = { s: "整体认读音节",    t: "整體認讀音節",    py: "zhěng tǐ rèn dú yīn jié" };
export const OV_WHOLE_DESC: ZhText    = { s: "这十六个音节是固定整体不要拆开记住完整读音", t: "這十六個音節是固定整體不要拆開記住完整讀音", py: "zhè shí liù gè yīn jié shì gù dìng zhěng tǐ bù yào chāi kāi jì zhù wán zhěng dú yīn" };

// ── 声母分组名 ────────────────────────────────────────────────────────
export const GRP_BILABIAL: ZhText     = { s: "双唇音",   t: "雙唇音",   py: "shuāng chún yīn" };
export const GRP_LABIODENTAL: ZhText  = { s: "唇齿音",   t: "唇齒音",   py: "chún chǐ yīn" };
export const GRP_ALVEOLAR: ZhText     = { s: "舌尖音",   t: "舌尖音",   py: "shé jiān yīn" };
export const GRP_VELAR: ZhText        = { s: "舌根音",   t: "舌根音",   py: "shé gēn yīn" };
export const GRP_PALATAL: ZhText      = { s: "舌面音",   t: "舌面音",   py: "shé miàn yīn" };
export const GRP_RETROFLEX: ZhText    = { s: "翘舌音",   t: "翹舌音",   py: "qiào shé yīn" };
export const GRP_SIBILANT: ZhText     = { s: "平舌音",   t: "平舌音",   py: "píng shé yīn" };
export const GRP_SEMIVOWEL: ZhText    = { s: "半元音",   t: "半元音",   py: "bàn yuán yīn" };

// ── 韵母分组名 ────────────────────────────────────────────────────────
export const GRP_SIMPLE: ZhText       = { s: "单韵母",   t: "單韻母",   py: "dān yùn mǔ" };
export const GRP_COMPOUND: ZhText     = { s: "复韵母",   t: "複韻母",   py: "fù yùn mǔ" };
export const GRP_NASAL_FRONT: ZhText  = { s: "前鼻韵母", t: "前鼻韻母", py: "qián bí yùn mǔ" };
export const GRP_NASAL_BACK: ZhText   = { s: "后鼻韵母", t: "後鼻韻母", py: "hòu bí yùn mǔ" };

// ── 整体认读分组名 ────────────────────────────────────────────────────
export const WHOLE_GRP1: ZhText       = { s: "翘舌和平舌",   t: "翹舌和平舌",   py: "qiào shé hé píng shé" };
export const WHOLE_GRP2: ZhText       = { s: "独立元音",     t: "獨立元音",     py: "dú lì yuán yīn" };
export const WHOLE_GRP3: ZhText       = { s: "以Y和Yu开头的", t: "以Y和Yu開頭的", py: "yǐ Y hé Yu kāi tóu de" };

// ── 拼写规则 ──────────────────────────────────────────────────────────
export const RULE1_TITLE: ZhText      = { s: "声调标注位置",     t: "聲調標注位置",     py: "shēng diào biāo zhù wèi zhì" };
export const RULE1_NOTE: ZhText       = {
  s: "标在主元音上有a或e优先其次o然后i和u同时出现标后一个",
  t: "標在主元音上有a或e優先其次o然後i和u同時出現標後一個",
  py: "biāo zài zhǔ yuán yīn shàng yǒu a huò e yōu xiān qí cì o rán hòu i hé u tóng shí chū xiàn biāo hòu yī gè",
};
export const RULE2_TITLE: ZhText      = { s: "ü的规则",         t: "ü的規則",         py: "ü de guī zé" };
export const RULE2_NOTE: ZhText       = {
  s: "在j、q、x、y后面写u但读ü键盘上用v代替ü",
  t: "在j、q、x、y後面寫u但讀ü鍵盤上用v代替ü",
  py: "zài j q x y hòu miàn xiě u dàn dú ü jiàn pán shàng yòng v dài tì ü",
};
export const RULE3_TITLE: ZhText      = { s: "隔音符号",         t: "隔音符號",         py: "gé yīn fú hào" };
export const RULE3_NOTE: ZhText       = {
  s: "音节以a、o、e开头且边界不清时用隔音符号",
  t: "音節以a、o、e開頭且邊界不清時用隔音符號",
  py: "yīn jié yǐ a o e kāi tóu qiě biān jiè bù qīng shí yòng gé yīn fú hào",
};

// ── 注音书写规则（繁体模式） ──────────────────────────────────────────────
export const BP_RULE1_TITLE: ZhText   = { s: "声调标记方式",     t: "聲調標記方式",     py: "shēng diào biāo jì fāng shì" };
export const BP_RULE1_NOTE: ZhText    = {
  s: "声调符号标在最后一个注音符号后面二声用ˊ三声用ˇ四声用ˋ一声不标轻声的˙标在前面",
  t: "聲調符號標在最後一個注音符號後面二聲用ˊ三聲用ˇ四聲用ˋ一聲不標輕聲的˙標在前面",
  py: "shēng diào fú hào biāo zài zuì hòu yī gè zhù yīn fú hào hòu miàn èr shēng yòng ˊ sān shēng yòng ˇ sì shēng yòng ˋ yī shēng bù biāo qīng shēng de ˙ biāo zài qián miàn",
};
export const BP_RULE2_TITLE: ZhText   = { s: "空韵母音节",       t: "空韻母音節",       py: "kōng yùn mǔ yīn jié" };
export const BP_RULE2_NOTE: ZhText    = {
  s: "ㄓㄔㄕㄖㄗㄘㄙ单独书写不需要韵母元音是内含的",
  t: "ㄓㄔㄕㄖㄗㄘㄙ單獨書寫不需要韻母元音是內含的",
  py: "ㄓ ㄔ ㄕ ㄖ ㄗ ㄘ ㄙ dān dú shū xiě bù xū yào yùn mǔ yuán yīn shì nèi hán de",
};
export const BP_RULE3_TITLE: ZhText   = { s: "与ㄩ的结合",       t: "與ㄩ的結合",       py: "yǔ ㄩ de jié hé" };
export const BP_RULE3_NOTE: ZhText    = {
  s: "ㄐㄑㄒ只能和ㄩ结合不能和ㄨ结合写成ㄐㄩㄑㄩㄒㄩ",
  t: "ㄐㄑㄒ只能和ㄩ結合不能和ㄨ結合寫成ㄐㄩㄑㄩㄒㄩ",
  py: "ㄐ ㄑ ㄒ zhǐ néng hé ㄩ jié hé bù néng hé ㄨ jié hé xiě chéng ㄐ ㄩ ㄑ ㄩ ㄒ ㄩ",
};

// ── 分组键到中文数据的映射（声母、韵母、整体认读通用） ──────────────────
export const GROUP_KEY_MAP: Record<string, ZhText> = {
  pyGrpBilabial:    GRP_BILABIAL,
  pyGrpLabiodental: GRP_LABIODENTAL,
  pyGrpAlveolar:    GRP_ALVEOLAR,
  pyGrpVelar:       GRP_VELAR,
  pyGrpPalatal:     GRP_PALATAL,
  pyGrpRetroflex:   GRP_RETROFLEX,
  pyGrpSibilant:    GRP_SIBILANT,
  pyGrpSemivowel:   GRP_SEMIVOWEL,
  pyGrpSimple:      GRP_SIMPLE,
  pyGrpCompound:    GRP_COMPOUND,
  pyGrpNasalFinal:  GRP_NASAL_FRONT,
  pyGrpVelarNasal:  GRP_NASAL_BACK,
  pyWholeSttGrp1:   WHOLE_GRP1,
  pyWholeSttGrp2:   WHOLE_GRP2,
  pyWholeSttGrp3:   WHOLE_GRP3,
};
