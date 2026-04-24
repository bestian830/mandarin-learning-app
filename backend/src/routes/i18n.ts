// GET /api/i18n?lang=vi
// 返回 UI 界面翻译字符串，优先从 SQLite 缓存读取，未命中时调用 Azure 批量翻译
// 开发者只需维护英文源字符串，新增语言零工作量

import { Router } from "express";
import { getI18nCache, setI18nCache } from "../db/index.js";
import { translateTexts } from "../lib/translate.js";

const router = Router();

// 唯一需要维护的英文源字符串
const SOURCE_EN: Record<string, string> = {
  subtitle:    "Think it in your language. Say it in Chinese.",
  placeholder: "What's in your thought?",
  translating: "Translating",
  errorTitle:  "Translation failed",
  chip1: "apple",
  chip2: "thank you",
  chip3: "I love you",
  chip4: "Good morning",
  chip5: "friend",

  // ── 拼音教学侧边栏 ────────────────────────────────────────────────────────
  pyTitle:       "Pinyin Guide",
  pyTabOverview: "Overview",
  pyTabInitials: "Initials",
  pyTabFinals:   "Finals",
  pyTabWhole:    "Syllables",
  pyTabRules:    "Rules",

  // 总览 Tab
  pyOvTitle:       "How Pinyin Works",
  pyOvIntro:       "A Mandarin syllable = (Initial) + Final + Tone",
  pyOvInitial:     "Initial",
  pyOvFinal:       "Final",
  pyOvSyllable:    "Syllable",
  pyOvInitialDesc: "Opening consonant (23 total)",
  pyOvFinalDesc:   "Vowel sequence — carries the tone (24 total)",
  pyOvSyllableDesc: "Complete spoken unit",
  pyOvToneTitle:   "Tone",
  pyOvToneDesc:    "4 tones + neutral, marked on the main vowel of the Final",
  pyOvOptional:    "(optional)",
  pyOvExamples:    "Examples",
  pyOvWholeTitle:  "Whole Syllable Exception",
  pyOvWholeDesc:   "These 16 syllables are read as fixed units. Don't split them — memorize the whole sound.",

  // 声调名称
  pyTone1: "Tone 1", pyTone2: "Tone 2", pyTone3: "Tone 3", pyTone4: "Tone 4", pyToneN: "Neutral",

  // 声母分组
  pyGrpBilabial:    "Bilabial",
  pyGrpLabiodental: "Labiodental",
  pyGrpAlveolar:    "Alveolar",
  pyGrpVelar:       "Velar",
  pyGrpPalatal:     "Palatal",
  pyGrpRetroflex:   "Retroflex",
  pyGrpSibilant:    "Sibilant",
  pyGrpSemivowel:   "Semivowel",

  // 韵母分组
  pyGrpSimple:     "Simple",
  pyGrpCompound:   "Compound",
  pyGrpNasalFinal: "Front Nasal",
  pyGrpVelarNasal: "Back Nasal",

  // 整体认读分组
  pyWholeSttGrp1: "Retroflex & Sibilant",
  pyWholeSttGrp2: "Standalone Vowels",
  pyWholeSttGrp3: "Y / Yu Compounds",

  // 拼写规则（3 条）
  pyRule1:     "Tone Placement",
  pyRule2:     "The ü Rule",
  pyRule3:     "Apostrophe",
  pyRuleNote1: "Mark the main vowel: a/e takes priority, then o, then i/u. If both i and u appear (as in ui or iu), mark the last one.",
  pyRuleNote2: "After j, q, x, y: write u but pronounce ü (e.g. ju = jü). On keyboard, type v instead of ü (lv→lü, nv→nü).",
  pyRuleNote3: "Use ' before a syllable starting with a, o, or e when the boundary is unclear (e.g. Xī'ān ≠ Xiān).",

  // ── 注音指南（繁体模式） ──────────────────────────────────────────────
  bpTitle:           "Bopomofo Guide",
  bpRulebp1:         "Tone Marks",
  bpRulebp2:         "Empty-Final Syllables",
  bpRulebp3:         "Combining with ㄩ",
  bpRuleNotebp1:     "Tone marks go after the last symbol: 2nd tone ˊ, 3rd tone ˇ, 4th tone ˋ. 1st tone has no mark. Neutral tone ˙ goes before the syllable.",
  bpRuleNotebp2:     "ㄓ、ㄔ、ㄕ、ㄖ、ㄗ、ㄘ、ㄙ are written alone with no final. The vowel sound is inherent.",
  bpRuleNotebp3:     "ㄐ、ㄑ、ㄒ can only combine with ㄩ (not ㄨ). When you see ju/qu/xu in pinyin, write ㄐㄩ/ㄑㄩ/ㄒㄩ.",

  // ── 导航/设置/简繁切换 ────────────────────────────────────────────────
  navSettings:       "Settings",
  navTools:          "Tools",
  loginToSave:       "Sign in to save words",
  scriptLabel:       "Chinese Script",
  scriptSimplified:  "Simplified 简体",
  scriptTraditional: "Traditional 繁體",

  // 词库面板
  vocabTitle:       "Vocabulary",
  vocabWords:       "words",
  vocabSearchCount: "Search Count",
  vocabEmpty:            "No words searched yet",
  vocabSearchPlaceholder: "Search words / pinyin...",

  // 单词本
  wbTitle:              "Word Book",
  wbEmpty:              "No words saved yet",
  wbDueToday:           "due today",
  wbStartReview:        "Start Review",
  wbAddPlaceholder:     "Type Chinese word...",
  wbAlreadySaved:       "Already saved",
  wbRemove:             "Remove",
  wbWords:              "words",
  wbNewDeckPlaceholder: "New deck name...",
  wbChooseDeck:         "Add to deck",
  wbDefaultDeckName:    "My Words",
  wbChineseOnly:        "Please enter Chinese characters only",

  // 闪卡复习
  fcForgot:         "Forgot",
  fcFuzzy:          "Fuzzy",
  fcGotIt:          "Got it",
  fcComplete:       "Review Complete!",
  fcReviewed:       "Reviewed",
  fcCorrect:        "Correct",
  fcClose:          "Close",
  fcTapToFlip:      "Tap to flip",

  // 搜索结果收藏
  addToWordBook:    "Add to Word Book",
  alreadySaved:     "Already saved",

  // 词性标签
  posVerb:          "Verb",
  posNoun:          "Noun",
  posProper:        "Proper Noun",
  posPronoun:       "Pronoun",
  posAdverb:        "Adverb",
  posAdj:           "Adjective",
  posParticle:      "Particle",
  posTime:          "Time",
  posNumber:        "Number",
  posConj:          "Conjunction",
  posIdiom:         "Idiom",

  // ── Auth / Register ───────────────────────────────────────────────────
  authSignIn:              "Sign In",
  authRegister:            "Register",
  authSignInSubtitle:      "Sign in to save your progress",
  authRegisterSubtitle:    "Create your account",
  authEmail:               "Email",
  authPassword:            "Password",
  authConfirmPassword:     "Confirm Password",
  authDisplayName:         "Display Name",
  authPasswordMinHint:     "At least 8 characters",
  authPasswordMismatch:    "Passwords don't match",
  authPasswordTooShort:    "Password must be at least 8 characters",
  authFillAllFields:       "Please fill in all fields",
  authCreateAccount:       "Create Account",
  authOr:                  "or",
  authContinueGoogle:      "Continue with Google",
  authNoAccount:           "Don't have an account?",
  authHaveAccount:         "Already have an account?",
  authContinueGuest:       "Continue without signing in",

  // ── Onboarding ────────────────────────────────────────────────────────
  onbStepOf:               "Step {cur} of {total}",
  onbBack:                 "Back",
  onbContinue:             "Continue",
  onbSkipStep:             "Skip this step",
  onbGetStarted:           "Get Started",
  onbNativeTitle:          "What's your native language?",
  onbNativeSubtitle:       "This is required so we can show the rest in your language.",
  onbNativeSearch:         "Search…",
  onbHskTitle:             "What's your current Chinese level?",
  onbHskBeginner:          "Complete beginner",
  onbHskLevel1:            "HSK 1",
  onbHskLevel2:            "HSK 2",
  onbHskLevel3:            "HSK 3",
  onbHskLevel4:            "HSK 4",
  onbHskLevel5:            "HSK 5",
  onbHskLevel6:            "HSK 6",
  onbGoalTitle:            "Why are you learning Chinese?",
  onbGoalSubtitle:         "Pick any that apply, or skip.",
  goalStudy:               "Study abroad",
  goalWork:                "Work",
  goalConversation:        "Daily conversation",
  goalTravel:              "Travel",
  goalCulture:             "Culture & heritage",
  goalExam:                "HSK exam",
  goalFamily:              "Family & friends",

  // ── Profile ───────────────────────────────────────────────────────────
  profileTitle:            "Profile",
  profileBack:             "Back",
  profileSave:             "Save",
  profileSaved:            "Saved",
  profileLearningProfile:  "Learning Profile",
  profileNativeLanguage:   "Native Language",
  profileChineseLevel:     "Chinese Level",
  profileLearningGoals:    "Learning Goals",
  profileConversationStyle:"Conversation Style",
  profileStylePatient:     "Patient",
  profileStyleNormal:      "Normal",
  profileStyleFast:        "Fast",
  profileAccount:          "Account",
  profileSignOut:          "Sign Out",
};

const SOURCE_KEYS   = Object.keys(SOURCE_EN);
const SOURCE_VALUES = Object.values(SOURCE_EN);

router.get("/i18n", async (req, res) => {
  const lang = ((req.query.lang as string) ?? "en").trim();

  // 英文直接返回源字符串，无需翻译
  if (lang === "en") {
    res.json(SOURCE_EN);
    return;
  }

  // 命中缓存：检查 key 数量一致才返回（新增字段后旧缓存自动失效）
  const cached = getI18nCache(lang);
  if (cached && Object.keys(cached).length >= SOURCE_KEYS.length) {
    res.json(cached);
    return;
  }

  // 调用 Azure 批量翻译（一次请求翻译所有字段）
  // 源语言显式指定 "en"，避免 from=zh-Hans 导致中文用户看到英文原文
  const translated = await translateTexts(SOURCE_VALUES, lang, "en");
  const result = Object.fromEntries(SOURCE_KEYS.map((k, i) => [k, translated[i] ?? SOURCE_VALUES[i]]));

  // 写入 SQLite 缓存（永久有效）
  setI18nCache(lang, result);
  res.json(result);
});

export default router;
