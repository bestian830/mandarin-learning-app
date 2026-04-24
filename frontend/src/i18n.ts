// 国际化模块
// 开发者只需维护 EN_STRINGS，其他语言由 Azure 自动翻译并缓存

export type Lang =
  | "en" | "hi" | "es" | "ar" | "bn" | "fr" | "ru" | "pt"
  | "id" | "sw" | "de" | "ja" | "fil" | "tr" | "vi" | "ko"
  | "it" | "fa" | "ms" | "th" | "nl" | "uk" | "km"
  | "zh-Hans" | "zh-Hant";

// 简繁体模式
export type ScriptMode = "simplified" | "traditional";

// 按使用人数排序，中文置末
export const LANGUAGES: { code: Lang; native: string }[] = [
  { code: "en",      native: "English" },
  { code: "hi",      native: "हिन्दी" },
  { code: "es",      native: "Español" },
  { code: "ar",      native: "العربية" },
  { code: "bn",      native: "বাংলা" },
  { code: "fr",      native: "Français" },
  { code: "ru",      native: "Русский" },
  { code: "pt",      native: "Português" },
  { code: "id",      native: "Bahasa Indonesia" },
  { code: "sw",      native: "Kiswahili" },
  { code: "de",      native: "Deutsch" },
  { code: "ja",      native: "日本語" },
  { code: "fil",     native: "Filipino" },
  { code: "tr",      native: "Türkçe" },
  { code: "vi",      native: "Tiếng Việt" },
  { code: "ko",      native: "한국어" },
  { code: "it",      native: "Italiano" },
  { code: "fa",      native: "فارسی" },
  { code: "ms",      native: "Bahasa Melayu" },
  { code: "th",      native: "ภาษาไทย" },
  { code: "nl",      native: "Nederlands" },
  { code: "uk",      native: "Українська" },
  { code: "km",      native: "ភាសាខ្មែរ" },
  { code: "zh-Hans", native: "简体中文" },
  { code: "zh-Hant", native: "繁體中文" },
];

export interface Strings {
  subtitle:      string;
  placeholder:   string;
  translating:   string;
  errorTitle:    string;
  fallbackChips: string[];

  // ── 拼音教学侧边栏 ──────────────────────────────────────────────────────
  pyTitle:        string;
  pyTabOverview:  string;
  pyTabInitials:  string;
  pyTabFinals:    string;
  pyTabWhole:     string;
  pyTabRules:     string;

  // 总览 Tab
  pyOvTitle:       string;
  pyOvIntro:       string;
  pyOvInitial:     string;
  pyOvFinal:       string;
  pyOvSyllable:    string;
  pyOvInitialDesc: string;
  pyOvFinalDesc:   string;
  pyOvSyllableDesc: string;
  pyOvToneTitle:   string;
  pyOvToneDesc:    string;
  pyOvOptional:    string;
  pyOvExamples:    string;
  pyOvWholeTitle:  string;
  pyOvWholeDesc:   string;

  // 声调名称（韵母展开四声时用）
  pyTone1: string; pyTone2: string; pyTone3: string; pyTone4: string; pyToneN: string;

  // 声母分组
  pyGrpBilabial: string; pyGrpLabiodental: string; pyGrpAlveolar: string; pyGrpVelar: string;
  pyGrpPalatal:  string; pyGrpRetroflex:   string; pyGrpSibilant: string; pyGrpSemivowel: string;

  // 韵母分组
  pyGrpSimple: string; pyGrpCompound: string; pyGrpNasalFinal: string; pyGrpVelarNasal: string;

  // 整体认读分组
  pyWholeSttGrp1: string; pyWholeSttGrp2: string; pyWholeSttGrp3: string;

  // 拼写规则（3 条）
  pyRule1: string; pyRule2: string; pyRule3: string;
  pyRuleNote1: string; pyRuleNote2: string; pyRuleNote3: string;

  // 注音书写规则（繁体模式，3 条）
  bpRulebp1: string; bpRulebp2: string; bpRulebp3: string;
  bpRuleNotebp1: string; bpRuleNotebp2: string; bpRuleNotebp3: string;

  // 词库面板
  vocabTitle: string;
  vocabWords: string;
  vocabSearchCount: string;
  vocabEmpty: string;
  vocabSearchPlaceholder: string;

  // ── 单词本 ──────────────────────────────────────────────────────
  wbTitle: string;
  wbEmpty: string;
  wbDueToday: string;
  wbStartReview: string;
  wbAddPlaceholder: string;
  wbAlreadySaved: string;
  wbRemove: string;
  wbWords: string;
  wbNewDeckPlaceholder: string;
  wbChooseDeck: string;
  wbDefaultDeckName: string;
  wbChineseOnly: string;

  // ── 闪卡复习 ────────────────────────────────────────────────────
  fcForgot: string;
  fcFuzzy: string;
  fcGotIt: string;
  fcComplete: string;
  fcReviewed: string;
  fcCorrect: string;
  fcClose: string;
  fcTapToFlip: string;

  // ── 搜索结果收藏 ────────────────────────────────────────────────
  addToWordBook: string;
  alreadySaved: string;

  // ── 词性标签 ────────────────────────────────────────────────────
  posVerb: string;
  posNoun: string;
  posProper: string;
  posPronoun: string;
  posAdverb: string;
  posAdj: string;
  posParticle: string;
  posTime: string;
  posNumber: string;
  posConj: string;
  posIdiom: string;

  // ── Auth / Register ─────────────────────────────────────────────
  authSignIn: string;
  authRegister: string;
  authSignInSubtitle: string;
  authRegisterSubtitle: string;
  authEmail: string;
  authPassword: string;
  authConfirmPassword: string;
  authDisplayName: string;
  authPasswordMinHint: string;
  authPasswordMismatch: string;
  authPasswordTooShort: string;
  authFillAllFields: string;
  authCreateAccount: string;
  authOr: string;
  authContinueGoogle: string;
  authNoAccount: string;
  authHaveAccount: string;
  authContinueGuest: string;

  // ── Onboarding ──────────────────────────────────────────────────
  onbStepOf: string;           // "Step {cur} of {total}"
  onbBack: string;
  onbContinue: string;
  onbSkipStep: string;
  onbGetStarted: string;
  onbNativeTitle: string;
  onbNativeSubtitle: string;
  onbNativeSearch: string;
  onbHskTitle: string;
  onbHskBeginner: string;
  onbHskLevel1: string;
  onbHskLevel2: string;
  onbHskLevel3: string;
  onbHskLevel4: string;
  onbHskLevel5: string;
  onbHskLevel6: string;
  onbGoalTitle: string;
  onbGoalSubtitle: string;
  goalStudy: string;
  goalWork: string;
  goalConversation: string;
  goalTravel: string;
  goalCulture: string;
  goalExam: string;
  goalFamily: string;

  // ── Profile ─────────────────────────────────────────────────────
  profileTitle: string;
  profileBack: string;
  profileSave: string;
  profileSaved: string;
  profileLearningProfile: string;
  profileNativeLanguage: string;
  profileChineseLevel: string;
  profileLearningGoals: string;
  profileAccount: string;
  profileSignOut: string;

  // ── 全局导航 ────────────────────────────────────────────────────
  navSettings: string;
  navTools: string;
  loginToSave: string;

  // ── 简繁体切换 ──────────────────────────────────────────────────
  scriptLabel: string;
  scriptSimplified: string;
  scriptTraditional: string;
  bpTitle: string;         // 繁体模式下的注音指南标题
}

// 英文兜底（初始渲染 + 加载失败时使用）
export const EN_STRINGS: Strings = {
  subtitle:      "Think it in your language. Say it in Chinese.",
  placeholder:   "What's in your thought?",
  translating:   "Translating",
  errorTitle:    "Translation failed",
  fallbackChips: ["apple", "thank you", "I love you", "Good morning", "friend"],

  pyTitle:       "Pinyin Guide",
  pyTabOverview: "Overview",
  pyTabInitials: "Initials",
  pyTabFinals:   "Finals",
  pyTabWhole:    "Syllables",
  pyTabRules:    "Rules",

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

  pyTone1: "Tone 1", pyTone2: "Tone 2", pyTone3: "Tone 3", pyTone4: "Tone 4", pyToneN: "Neutral",

  pyGrpBilabial:    "Bilabial",    pyGrpLabiodental: "Labiodental",
  pyGrpAlveolar:    "Alveolar",    pyGrpVelar:        "Velar",
  pyGrpPalatal:     "Palatal",     pyGrpRetroflex:    "Retroflex",
  pyGrpSibilant:    "Sibilant",    pyGrpSemivowel:    "Semivowel",

  pyGrpSimple:     "Simple",        pyGrpCompound:   "Compound",
  pyGrpNasalFinal: "Front Nasal",   pyGrpVelarNasal: "Back Nasal",

  pyWholeSttGrp1: "Retroflex & Sibilant",
  pyWholeSttGrp2: "Standalone Vowels",
  pyWholeSttGrp3: "Y / Yu Compounds",

  pyRule1:     "Tone Placement",
  pyRule2:     "The ü Rule",
  pyRule3:     "Apostrophe",
  pyRuleNote1: "Mark the main vowel: a/e takes priority, then o, then i/u. If both i and u appear (as in ui or iu), mark the last one.",
  pyRuleNote2: "After j, q, x, y: write u but pronounce ü (e.g. ju = jü). On keyboard, type v instead of ü (lv→lü, nv→nü).",
  pyRuleNote3: "Use ' before a syllable starting with a, o, or e when the boundary is unclear (e.g. Xī'ān ≠ Xiān).",

  bpRulebp1:      "Tone Marks",
  bpRulebp2:      "Empty-Final Syllables",
  bpRulebp3:      "Combining with ㄩ",
  bpRuleNotebp1:  "Tone marks go after the last symbol: 2nd tone ˊ, 3rd tone ˇ, 4th tone ˋ. 1st tone has no mark. Neutral tone ˙ goes before the syllable.",
  bpRuleNotebp2:  "ㄓ、ㄔ、ㄕ、ㄖ、ㄗ、ㄘ、ㄙ are written alone with no final. The vowel sound is inherent.",
  bpRuleNotebp3:  "ㄐ、ㄑ、ㄒ can only combine with ㄩ (not ㄨ). When you see ju/qu/xu in pinyin, write ㄐㄩ/ㄑㄩ/ㄒㄩ.",

  vocabTitle:       "Vocabulary",
  vocabWords:       "words",
  vocabSearchCount: "Search Count",
  vocabEmpty:       "No words searched yet",
  vocabSearchPlaceholder: "Search words / pinyin...",

  wbTitle:               "Word Book",
  wbEmpty:               "No words saved yet",
  wbDueToday:            "due today",
  wbStartReview:         "Start Review",
  wbAddPlaceholder:      "Type Chinese word...",
  wbAlreadySaved:        "Already saved",
  wbRemove:              "Remove",
  wbWords:               "words",
  wbNewDeckPlaceholder:  "New deck name...",
  wbChooseDeck:          "Add to deck",
  wbDefaultDeckName:     "My Words",
  wbChineseOnly:         "Please enter Chinese characters only",

  fcForgot:         "Forgot",
  fcFuzzy:          "Fuzzy",
  fcGotIt:          "Got it",
  fcComplete:       "Review Complete!",
  fcReviewed:       "Reviewed",
  fcCorrect:        "Correct",
  fcClose:          "Close",
  fcTapToFlip:      "Tap to flip",

  addToWordBook:    "Add to Word Book",
  alreadySaved:     "Already saved",

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

  // ── Auth / Register ─────────────────────────────────────────────
  authSignIn:            "Sign In",
  authRegister:          "Register",
  authSignInSubtitle:    "Sign in to save your progress",
  authRegisterSubtitle:  "Create your account",
  authEmail:             "Email",
  authPassword:          "Password",
  authConfirmPassword:   "Confirm Password",
  authDisplayName:       "Display Name",
  authPasswordMinHint:   "At least 8 characters",
  authPasswordMismatch:  "Passwords don't match",
  authPasswordTooShort:  "Password must be at least 8 characters",
  authFillAllFields:     "Please fill in all fields",
  authCreateAccount:     "Create Account",
  authOr:                "or",
  authContinueGoogle:    "Continue with Google",
  authNoAccount:         "Don't have an account?",
  authHaveAccount:       "Already have an account?",
  authContinueGuest:     "Continue without signing in",

  // ── Onboarding ──────────────────────────────────────────────────
  onbStepOf:             "Step {cur} of {total}",
  onbBack:               "Back",
  onbContinue:           "Continue",
  onbSkipStep:           "Skip this step",
  onbGetStarted:         "Get Started",
  onbNativeTitle:        "What's your native language?",
  onbNativeSubtitle:     "This is required so we can show the rest in your language.",
  onbNativeSearch:       "Search…",
  onbHskTitle:           "What's your current Chinese level?",
  onbHskBeginner:        "Complete beginner",
  onbHskLevel1:          "HSK 1",
  onbHskLevel2:          "HSK 2",
  onbHskLevel3:          "HSK 3",
  onbHskLevel4:          "HSK 4",
  onbHskLevel5:          "HSK 5",
  onbHskLevel6:          "HSK 6",
  onbGoalTitle:          "Why are you learning Chinese?",
  onbGoalSubtitle:       "Pick any that apply, or skip.",
  goalStudy:             "Study abroad",
  goalWork:              "Work",
  goalConversation:      "Daily conversation",
  goalTravel:            "Travel",
  goalCulture:           "Culture & heritage",
  goalExam:              "HSK exam",
  goalFamily:            "Family & friends",

  // ── Profile ─────────────────────────────────────────────────────
  profileTitle:             "Profile",
  profileBack:              "Back",
  profileSave:              "Save",
  profileSaved:             "Saved",
  profileLearningProfile:   "Learning Profile",
  profileNativeLanguage:    "Native Language",
  profileChineseLevel:      "Chinese Level",
  profileLearningGoals:     "Learning Goals",
  profileAccount:           "Account",
  profileSignOut:           "Sign Out",

  navSettings:              "Settings",
  navTools:                 "Tools",
  loginToSave:              "Sign in to save words",

  scriptLabel:              "Chinese Script",
  scriptSimplified:         "Simplified 简体",
  scriptTraditional:        "Traditional 繁體",
  bpTitle:                  "Bopomofo Guide",
};

const LS_LANG_KEY = "mm_lang";
const LS_SCRIPT_KEY = "mm_script";
const LS_I18N_PFX = "mm_i18n_v10_"; // v10：新增 bpRule/bpRuleNote 注音规则翻译

export function getLang(): Lang {
  const saved = localStorage.getItem(LS_LANG_KEY) as Lang | null;
  if (saved && LANGUAGES.some(l => l.code === saved)) return saved;
  const browser = navigator.language.toLowerCase();
  // 精确匹配（如 zh-Hans、zh-Hant）
  if (LANGUAGES.some(l => l.code === browser)) return browser as Lang;
  // 前缀匹配（如 zh-CN → zh-Hans，vi-VN → vi）
  const prefix = browser.split("-")[0];
  const match = LANGUAGES.find(l => l.code === prefix || l.code.startsWith(prefix + "-"));
  return (match?.code ?? "en") as Lang;
}

export function saveLang(lang: Lang) {
  localStorage.setItem(LS_LANG_KEY, lang);
}

export function getScript(): ScriptMode {
  return localStorage.getItem(LS_SCRIPT_KEY) === "traditional" ? "traditional" : "simplified";
}

export function saveScript(mode: ScriptMode) {
  localStorage.setItem(LS_SCRIPT_KEY, mode);
}

// 将后端返回的扁平对象转为 Strings 类型
function parseStrings(data: Record<string, string>): Strings {
  const s = EN_STRINGS;
  return {
    subtitle:      data.subtitle      ?? s.subtitle,
    placeholder:   data.placeholder   ?? s.placeholder,
    translating:   data.translating   ?? s.translating,
    errorTitle:    data.errorTitle     ?? s.errorTitle,
    fallbackChips: [data.chip1, data.chip2, data.chip3, data.chip4, data.chip5]
      .map((c, i) => c ?? s.fallbackChips[i]),

    pyTitle:       data.pyTitle       ?? s.pyTitle,
    pyTabOverview: data.pyTabOverview ?? s.pyTabOverview,
    pyTabInitials: data.pyTabInitials ?? s.pyTabInitials,
    pyTabFinals:   data.pyTabFinals   ?? s.pyTabFinals,
    pyTabWhole:    data.pyTabWhole    ?? s.pyTabWhole,
    pyTabRules:    data.pyTabRules    ?? s.pyTabRules,

    pyOvTitle:        data.pyOvTitle        ?? s.pyOvTitle,
    pyOvIntro:        data.pyOvIntro        ?? s.pyOvIntro,
    pyOvInitial:      data.pyOvInitial      ?? s.pyOvInitial,
    pyOvFinal:        data.pyOvFinal        ?? s.pyOvFinal,
    pyOvSyllable:     data.pyOvSyllable     ?? s.pyOvSyllable,
    pyOvInitialDesc:  data.pyOvInitialDesc  ?? s.pyOvInitialDesc,
    pyOvFinalDesc:    data.pyOvFinalDesc    ?? s.pyOvFinalDesc,
    pyOvSyllableDesc: data.pyOvSyllableDesc ?? s.pyOvSyllableDesc,
    pyOvToneTitle:    data.pyOvToneTitle    ?? s.pyOvToneTitle,
    pyOvToneDesc:     data.pyOvToneDesc     ?? s.pyOvToneDesc,
    pyOvOptional:     data.pyOvOptional     ?? s.pyOvOptional,
    pyOvExamples:     data.pyOvExamples     ?? s.pyOvExamples,
    pyOvWholeTitle:   data.pyOvWholeTitle   ?? s.pyOvWholeTitle,
    pyOvWholeDesc:    data.pyOvWholeDesc    ?? s.pyOvWholeDesc,

    pyTone1: data.pyTone1 ?? s.pyTone1, pyTone2: data.pyTone2 ?? s.pyTone2,
    pyTone3: data.pyTone3 ?? s.pyTone3, pyTone4: data.pyTone4 ?? s.pyTone4,
    pyToneN: data.pyToneN ?? s.pyToneN,

    pyGrpBilabial:    data.pyGrpBilabial    ?? s.pyGrpBilabial,
    pyGrpLabiodental: data.pyGrpLabiodental ?? s.pyGrpLabiodental,
    pyGrpAlveolar:    data.pyGrpAlveolar    ?? s.pyGrpAlveolar,
    pyGrpVelar:       data.pyGrpVelar       ?? s.pyGrpVelar,
    pyGrpPalatal:     data.pyGrpPalatal     ?? s.pyGrpPalatal,
    pyGrpRetroflex:   data.pyGrpRetroflex   ?? s.pyGrpRetroflex,
    pyGrpSibilant:    data.pyGrpSibilant    ?? s.pyGrpSibilant,
    pyGrpSemivowel:   data.pyGrpSemivowel   ?? s.pyGrpSemivowel,

    pyGrpSimple:     data.pyGrpSimple     ?? s.pyGrpSimple,
    pyGrpCompound:   data.pyGrpCompound   ?? s.pyGrpCompound,
    pyGrpNasalFinal: data.pyGrpNasalFinal ?? s.pyGrpNasalFinal,
    pyGrpVelarNasal: data.pyGrpVelarNasal ?? s.pyGrpVelarNasal,

    pyWholeSttGrp1: data.pyWholeSttGrp1 ?? s.pyWholeSttGrp1,
    pyWholeSttGrp2: data.pyWholeSttGrp2 ?? s.pyWholeSttGrp2,
    pyWholeSttGrp3: data.pyWholeSttGrp3 ?? s.pyWholeSttGrp3,

    pyRule1: data.pyRule1 ?? s.pyRule1, pyRule2: data.pyRule2 ?? s.pyRule2,
    pyRule3: data.pyRule3 ?? s.pyRule3,
    pyRuleNote1: data.pyRuleNote1 ?? s.pyRuleNote1,
    pyRuleNote2: data.pyRuleNote2 ?? s.pyRuleNote2,
    pyRuleNote3: data.pyRuleNote3 ?? s.pyRuleNote3,

    bpRulebp1: data.bpRulebp1 ?? s.bpRulebp1, bpRulebp2: data.bpRulebp2 ?? s.bpRulebp2,
    bpRulebp3: data.bpRulebp3 ?? s.bpRulebp3,
    bpRuleNotebp1: data.bpRuleNotebp1 ?? s.bpRuleNotebp1,
    bpRuleNotebp2: data.bpRuleNotebp2 ?? s.bpRuleNotebp2,
    bpRuleNotebp3: data.bpRuleNotebp3 ?? s.bpRuleNotebp3,

    vocabTitle:       data.vocabTitle       ?? s.vocabTitle,
    vocabWords:       data.vocabWords       ?? s.vocabWords,
    vocabSearchCount: data.vocabSearchCount ?? s.vocabSearchCount,
    vocabEmpty:       data.vocabEmpty       ?? s.vocabEmpty,
    vocabSearchPlaceholder: data.vocabSearchPlaceholder ?? s.vocabSearchPlaceholder,

    wbTitle:              data.wbTitle              ?? s.wbTitle,
    wbEmpty:              data.wbEmpty              ?? s.wbEmpty,
    wbDueToday:           data.wbDueToday           ?? s.wbDueToday,
    wbStartReview:        data.wbStartReview        ?? s.wbStartReview,
    wbAddPlaceholder:     data.wbAddPlaceholder     ?? s.wbAddPlaceholder,
    wbAlreadySaved:       data.wbAlreadySaved       ?? s.wbAlreadySaved,
    wbRemove:             data.wbRemove             ?? s.wbRemove,
    wbWords:              data.wbWords              ?? s.wbWords,
    wbNewDeckPlaceholder: data.wbNewDeckPlaceholder ?? s.wbNewDeckPlaceholder,
    wbChooseDeck:         data.wbChooseDeck         ?? s.wbChooseDeck,
    wbDefaultDeckName:    data.wbDefaultDeckName    ?? s.wbDefaultDeckName,
    wbChineseOnly:        data.wbChineseOnly        ?? s.wbChineseOnly,

    fcForgot:         data.fcForgot         ?? s.fcForgot,
    fcFuzzy:          data.fcFuzzy          ?? s.fcFuzzy,
    fcGotIt:          data.fcGotIt          ?? s.fcGotIt,
    fcComplete:       data.fcComplete       ?? s.fcComplete,
    fcReviewed:       data.fcReviewed       ?? s.fcReviewed,
    fcCorrect:        data.fcCorrect        ?? s.fcCorrect,
    fcClose:          data.fcClose          ?? s.fcClose,
    fcTapToFlip:      data.fcTapToFlip      ?? s.fcTapToFlip,

    addToWordBook:    data.addToWordBook    ?? s.addToWordBook,
    alreadySaved:     data.alreadySaved     ?? s.alreadySaved,

    posVerb:          data.posVerb          ?? s.posVerb,
    posNoun:          data.posNoun          ?? s.posNoun,
    posProper:        data.posProper        ?? s.posProper,
    posPronoun:       data.posPronoun       ?? s.posPronoun,
    posAdverb:        data.posAdverb        ?? s.posAdverb,
    posAdj:           data.posAdj           ?? s.posAdj,
    posParticle:      data.posParticle      ?? s.posParticle,
    posTime:          data.posTime          ?? s.posTime,
    posNumber:        data.posNumber        ?? s.posNumber,
    posConj:          data.posConj          ?? s.posConj,
    posIdiom:         data.posIdiom         ?? s.posIdiom,

    authSignIn:            data.authSignIn            ?? s.authSignIn,
    authRegister:          data.authRegister          ?? s.authRegister,
    authSignInSubtitle:    data.authSignInSubtitle    ?? s.authSignInSubtitle,
    authRegisterSubtitle:  data.authRegisterSubtitle  ?? s.authRegisterSubtitle,
    authEmail:             data.authEmail             ?? s.authEmail,
    authPassword:          data.authPassword          ?? s.authPassword,
    authConfirmPassword:   data.authConfirmPassword   ?? s.authConfirmPassword,
    authDisplayName:       data.authDisplayName       ?? s.authDisplayName,
    authPasswordMinHint:   data.authPasswordMinHint   ?? s.authPasswordMinHint,
    authPasswordMismatch:  data.authPasswordMismatch  ?? s.authPasswordMismatch,
    authPasswordTooShort:  data.authPasswordTooShort  ?? s.authPasswordTooShort,
    authFillAllFields:     data.authFillAllFields     ?? s.authFillAllFields,
    authCreateAccount:     data.authCreateAccount     ?? s.authCreateAccount,
    authOr:                data.authOr                ?? s.authOr,
    authContinueGoogle:    data.authContinueGoogle    ?? s.authContinueGoogle,
    authNoAccount:         data.authNoAccount         ?? s.authNoAccount,
    authHaveAccount:       data.authHaveAccount       ?? s.authHaveAccount,
    authContinueGuest:     data.authContinueGuest     ?? s.authContinueGuest,

    onbStepOf:             data.onbStepOf             ?? s.onbStepOf,
    onbBack:               data.onbBack               ?? s.onbBack,
    onbContinue:           data.onbContinue           ?? s.onbContinue,
    onbSkipStep:           data.onbSkipStep           ?? s.onbSkipStep,
    onbGetStarted:         data.onbGetStarted         ?? s.onbGetStarted,
    onbNativeTitle:        data.onbNativeTitle        ?? s.onbNativeTitle,
    onbNativeSubtitle:     data.onbNativeSubtitle     ?? s.onbNativeSubtitle,
    onbNativeSearch:       data.onbNativeSearch       ?? s.onbNativeSearch,
    onbHskTitle:           data.onbHskTitle           ?? s.onbHskTitle,
    onbHskBeginner:        data.onbHskBeginner        ?? s.onbHskBeginner,
    onbHskLevel1:          data.onbHskLevel1          ?? s.onbHskLevel1,
    onbHskLevel2:          data.onbHskLevel2          ?? s.onbHskLevel2,
    onbHskLevel3:          data.onbHskLevel3          ?? s.onbHskLevel3,
    onbHskLevel4:          data.onbHskLevel4          ?? s.onbHskLevel4,
    onbHskLevel5:          data.onbHskLevel5          ?? s.onbHskLevel5,
    onbHskLevel6:          data.onbHskLevel6          ?? s.onbHskLevel6,
    onbGoalTitle:          data.onbGoalTitle          ?? s.onbGoalTitle,
    onbGoalSubtitle:       data.onbGoalSubtitle       ?? s.onbGoalSubtitle,
    goalStudy:             data.goalStudy             ?? s.goalStudy,
    goalWork:              data.goalWork              ?? s.goalWork,
    goalConversation:      data.goalConversation      ?? s.goalConversation,
    goalTravel:            data.goalTravel            ?? s.goalTravel,
    goalCulture:           data.goalCulture           ?? s.goalCulture,
    goalExam:              data.goalExam              ?? s.goalExam,
    goalFamily:            data.goalFamily            ?? s.goalFamily,

    profileTitle:             data.profileTitle             ?? s.profileTitle,
    profileBack:              data.profileBack              ?? s.profileBack,
    profileSave:              data.profileSave              ?? s.profileSave,
    profileSaved:             data.profileSaved             ?? s.profileSaved,
    profileLearningProfile:   data.profileLearningProfile   ?? s.profileLearningProfile,
    profileNativeLanguage:    data.profileNativeLanguage    ?? s.profileNativeLanguage,
    profileChineseLevel:      data.profileChineseLevel      ?? s.profileChineseLevel,
    profileLearningGoals:     data.profileLearningGoals     ?? s.profileLearningGoals,
    profileAccount:           data.profileAccount           ?? s.profileAccount,
    profileSignOut:           data.profileSignOut           ?? s.profileSignOut,

    navSettings:              data.navSettings              ?? s.navSettings,
    navTools:                 data.navTools                 ?? s.navTools,
    loginToSave:              data.loginToSave              ?? s.loginToSave,

    scriptLabel:              data.scriptLabel              ?? s.scriptLabel,
    scriptSimplified:         data.scriptSimplified         ?? s.scriptSimplified,
    scriptTraditional:        data.scriptTraditional        ?? s.scriptTraditional,
    bpTitle:                  data.bpTitle                  ?? s.bpTitle,
  };
}

// 加载翻译：localStorage 缓存 → 后端 API → 英文兜底
export async function loadTranslations(lang: Lang): Promise<Strings> {
  if (lang === "en") return EN_STRINGS;

  // 读 localStorage 缓存
  const cached = localStorage.getItem(LS_I18N_PFX + lang);
  if (cached) {
    try { return parseStrings(JSON.parse(cached)); } catch {}
  }

  // 请求后端（后端负责 SQLite 缓存 + Azure 翻译）
  try {
    const res = await fetch(`/api/i18n?lang=${encodeURIComponent(lang)}`);
    if (!res.ok) return EN_STRINGS;
    const data: Record<string, string> = await res.json();
    localStorage.setItem(LS_I18N_PFX + lang, JSON.stringify(data));
    return parseStrings(data);
  } catch {
    return EN_STRINGS;
  }
}
