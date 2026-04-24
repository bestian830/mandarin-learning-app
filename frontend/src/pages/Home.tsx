import { useState, useCallback, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { search } from "../api/search";
import type { SearchResult, FlashCard } from "../types/index";
import SearchBar from "../components/SearchBar";
import Result from "../components/Result";
import SettingsDropdown from "../components/SettingsDropdown";
import ToolsSidebar from "../components/ToolsSidebar";
import FlashcardReview from "../components/FlashcardReview";
import SpeakerButton from "../components/SpeakerButton";
import { EN_STRINGS, getLang, saveLang, getScript, saveScript, loadTranslations, type Lang, type ScriptMode, type Strings } from "../i18n";
import { useUserStore } from "../store/user";
import { pinyinToBopomofo } from "../data/pinyin";

interface HistoryEntry {
  id: number;
  query: string;
  result: SearchResult | null;
  error: string | null;
  loading: boolean;
}

interface HskWord {
  word: string;
  traditional: string | null;
  pinyin: string | null;
  zhuyin: string | null;
  hsk_pos: string | null;
}

// 读取管理员 token：URL ?admin=<secret> 首次激活并存入 localStorage，之后自动读取
// 访问 /?admin=logout 可退出管理员模式
function getAdminToken(): string {
  const params = new URLSearchParams(window.location.search);
  const urlToken = params.get("admin");
  if (urlToken === "logout") {
    localStorage.removeItem("mm_admin_token");
    // 清理 URL
    const url = new URL(window.location.href);
    url.searchParams.delete("admin");
    window.history.replaceState({}, "", url.toString());
    return "";
  }
  if (urlToken) {
    localStorage.setItem("mm_admin_token", urlToken);
    // Token 存储后从 URL 移除，避免暴露在地址栏
    const url = new URL(window.location.href);
    url.searchParams.delete("admin");
    window.history.replaceState({}, "", url.toString());
    return urlToken;
  }
  return localStorage.getItem("mm_admin_token") ?? "";
}

// HSK 等级彩色徽章
const HSK_COLORS: Record<string, string> = {
  "1": "bg-emerald-100 text-emerald-700",
  "2": "bg-teal-100 text-teal-700",
  "3": "bg-blue-100 text-blue-700",
  "4": "bg-indigo-100 text-indigo-700",
  "5": "bg-purple-100 text-purple-700",
  "6": "bg-amber-100 text-amber-700",
  "7-9": "bg-red-100 text-red-700",
};

function HskBadge({ level }: { level: string | null | undefined }) {
  if (!level) return null;
  return (
    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full flex-shrink-0 ${HSK_COLORS[level] ?? "bg-gray-100 text-gray-500"}`}>
      {level}
    </span>
  );
}

// HSK 等级列表
const HSK_LEVELS = ["1", "2", "3", "4", "5", "6", "7-9"];

// HSK 等级 tab 按钮的选中/未选中色
const HSK_TAB_COLORS: Record<string, { active: string; inactive: string }> = {
  "1":   { active: "bg-emerald-500 text-white", inactive: "bg-emerald-50 text-emerald-600 hover:bg-emerald-100" },
  "2":   { active: "bg-teal-500 text-white",    inactive: "bg-teal-50 text-teal-600 hover:bg-teal-100" },
  "3":   { active: "bg-blue-500 text-white",    inactive: "bg-blue-50 text-blue-600 hover:bg-blue-100" },
  "4":   { active: "bg-indigo-500 text-white",  inactive: "bg-indigo-50 text-indigo-600 hover:bg-indigo-100" },
  "5":   { active: "bg-purple-500 text-white",  inactive: "bg-purple-50 text-purple-600 hover:bg-purple-100" },
  "6":   { active: "bg-amber-500 text-white",   inactive: "bg-amber-50 text-amber-600 hover:bg-amber-100" },
  "7-9": { active: "bg-red-500 text-white",     inactive: "bg-red-50 text-red-600 hover:bg-red-100" },
};

export default function Home() {
  const user = useUserStore((s) => s.user);
  const navigate = useNavigate();
  const [query, setQuery] = useState("");
  // 从 sessionStorage 恢复搜索结果（登录/注册后返回时不丢失）
  const [history, setHistory] = useState<HistoryEntry[]>(() => {
    try {
      const raw = sessionStorage.getItem("mm_search_history");
      return raw ? JSON.parse(raw) : [];
    } catch { return []; }
  });
  const [searched, setSearched] = useState(() => history.length > 0);
  const [lang, setLangState] = useState<Lang>(getLang);
  const [script, setScriptState] = useState<ScriptMode>(getScript);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [t, setT] = useState<Strings>(EN_STRINGS);
  const [vocabOpen, setVocabOpen] = useState(false);
  const [hskLevel, setHskLevel] = useState<string>("1");
  const [hskWords, setHskWords] = useState<HskWord[]>([]);
  const [hskTotal, setHskTotal] = useState(0);
  const [hskLoading, setHskLoading] = useState(false);
  const [hskHasMore, setHskHasMore] = useState(true);
  const hskSentinelRef = useRef<HTMLDivElement>(null);
  const [wordBookRefresh, setWordBookRefresh] = useState(0);
  const [reviewCards, setReviewCards] = useState<FlashCard[] | null>(null);
  const [adminToken] = useState<string>(getAdminToken);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  // 语言切换时异步加载翻译（EN 瞬时，其他首次约 300ms，之后从缓存秒开）
  useEffect(() => {
    loadTranslations(lang).then(setT);
  }, [lang]);

  // 切换语言
  const handleLangChange = (l: Lang) => {
    saveLang(l);
    setLangState(l);
  };

  const handleScriptChange = (s: ScriptMode) => {
    saveScript(s);
    setScriptState(s);
  };


  const handleSearch = useCallback(async (q: string) => {
    if (!q.trim()) return;
    setSearched(true);
    setQuery("");

    const id = Date.now();
    setHistory(prev => [...prev, { id, query: q, result: null, error: null, loading: true }]);

    try {
      const result = await search(q);
      setHistory(prev =>
        prev.map(e => e.id === id ? { ...e, result, loading: false } : e)
      );
    } catch (e) {
      const error = e instanceof Error ? e.message : "Translation service unavailable";
      setHistory(prev =>
        prev.map(e => e.id === id ? { ...e, error, loading: false } : e)
      );
    }
  }, []);

  // 新结果出现时滚到底部 + 持久化到 sessionStorage（登录/注册后返回不丢失）
  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
    // 只保存已完成的搜索结果（跳过 loading 条目）
    const completed = history.filter(e => !e.loading);
    if (completed.length > 0) {
      sessionStorage.setItem("mm_search_history", JSON.stringify(completed));
    }
  }, [history]);

  // 加载 HSK 词汇（按等级分页 50 条/次）
  const loadHskWords = useCallback((level: string, reset = false) => {
    if (hskLoading) return;
    setHskLoading(true);
    const offset = reset ? 0 : hskWords.length;
    fetch(`/api/stats/hsk?level=${encodeURIComponent(level)}&limit=50&offset=${offset}`)
      .then(r => r.json())
      .then((data: { words: HskWord[]; total: number }) => {
        setHskWords(prev => reset ? data.words : [...prev, ...data.words]);
        setHskTotal(data.total);
        setHskHasMore((reset ? data.words.length : hskWords.length + data.words.length) < data.total);
        setHskLoading(false);
      })
      .catch(() => { setHskLoading(false); });
  }, [hskWords.length, hskLoading]);

  // 切换 HSK 等级
  const handleHskLevelChange = useCallback((level: string) => {
    setHskLevel(level);
    setHskWords([]);
    setHskHasMore(true);
    loadHskWords(level, true);
  }, [loadHskWords]);

  // 展开词库时拉取首页数据
  const handleVocabToggle = () => {
    if (!vocabOpen) {
      setHskWords([]);
      setHskHasMore(true);
      loadHskWords(hskLevel, true);
    }
    setVocabOpen(v => !v);
  };

  // 无限滚动
  useEffect(() => {
    if (!vocabOpen || !hskHasMore || hskLoading) return;
    const sentinel = hskSentinelRef.current;
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadHskWords(hskLevel);
      },
      { rootMargin: "100px" }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, [vocabOpen, hskHasMore, hskLoading, hskLevel, loadHskWords]);

  // 单词本：新词添加后刷新侧边栏
  const handleWordAdded = useCallback(() => {
    setWordBookRefresh(n => n + 1);
  }, []);

  // 闪卡复习：开始 / 结束
  const handleStartReview = useCallback((cards: FlashCard[]) => {
    setToolsOpen(false);
    setReviewCards(cards);
  }, []);
  const handleCloseReview = useCallback(() => {
    setReviewCards(null);
    setWordBookRefresh(n => n + 1);
  }, []);

  return (
    <div className={`bg-[#fafaf8] ${searched ? "h-screen flex flex-col overflow-hidden" : "min-h-screen"}`}>

      {/* 左上角：工具箱按钮（Word Book + Pinyin Guide） */}
      <button
        onClick={() => setToolsOpen(v => !v)}
        className={`fixed top-4 left-4 z-40 w-9 h-9 flex flex-col items-center justify-center gap-[5px]
          rounded-full border transition-all duration-150
          ${toolsOpen
            ? "border-[#c41e3a] bg-[#fef5f6]"
            : "border-[#e4e4e4] bg-white hover:border-[#c41e3a]"
          }`}
        title={t.navTools}
      >
        {[0,1,2].map(i => (
          <span key={i} className={`block h-[1.5px] rounded-full transition-all duration-150 ${toolsOpen ? "bg-[#c41e3a]" : "bg-[#6b7280]"}`}
            style={{ width: i === 1 ? "12px" : "16px" }}
          />
        ))}
      </button>

      {/* 右上角：设置按钮（Profile + 语言 + 登录/登出） */}
      <div className="fixed top-4 right-4 z-40">
        <SettingsDropdown lang={lang} onLangChange={handleLangChange} script={script} onScriptChange={handleScriptChange} t={t} />
      </div>

      {/* 搜索头部 */}
      <div
        className="flex-shrink-0 transition-all duration-500 ease-[cubic-bezier(0.4,0,0.2,1)]"
        style={{ paddingTop: searched ? "1.25rem" : "calc(50vh - 160px)" }}
      >
        <div className={`mx-auto px-6 transition-all duration-500 ${searched ? "max-w-3xl" : "max-w-xl flex flex-col items-center"}`}>

          {/* Logo */}
          <div className={`transition-all duration-500 ${searched ? "flex items-center gap-3 mb-3" : "flex flex-col items-center gap-2 mb-8"}`}>
            <div className={`bg-[#c41e3a] flex items-center justify-center rounded transition-all duration-500 flex-shrink-0 ${searched ? "w-7 h-7" : "w-11 h-11"}`}>
              <span className={`chinese text-white font-bold select-none transition-all duration-500 ${searched ? "text-sm" : "text-xl"}`}>字</span>
            </div>
            <div className={searched ? "flex items-baseline gap-1.5" : "text-center"}>
              <span className={`font-bold tracking-tight text-[#1c1917] transition-all duration-500 ${searched ? "text-base" : "text-2xl"}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Mandarin</span>
              <span className={`font-bold tracking-tight text-[#c41e3a] transition-all duration-500 ${searched ? "text-base" : "text-2xl"}`} style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>Master</span>
              {!searched && <p className="text-sm text-[#9aa0a6] mt-1 text-center">{t.subtitle}</p>}
            </div>
          </div>

          {/* 搜索框 */}
          <SearchBar value={query} onChange={setQuery} onSearch={handleSearch} loading={false} compact={searched} placeholder={t.placeholder}
            onToggleVocab={handleVocabToggle} vocabOpen={vocabOpen} vocabTitle={t.vocabTitle} />

          {/* HSK 词库展开面板 */}
          {vocabOpen && (
            <div className="mt-3 w-full bg-white border border-[#ebebeb] rounded-2xl shadow-sm overflow-hidden">
              {/* HSK 等级 Tab 按钮 */}
              <div className="px-4 py-3 border-b border-[#f4f4f4] flex items-center gap-2 flex-wrap">
                {HSK_LEVELS.map(lv => {
                  const colors = HSK_TAB_COLORS[lv];
                  const active = hskLevel === lv;
                  return (
                    <button key={lv} onClick={() => handleHskLevelChange(lv)}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold transition-colors
                        ${active ? colors.active : colors.inactive}`}>
                      {lv === "7-9" ? "HSK 7-9" : `HSK ${lv}`}
                    </button>
                  );
                })}
              </div>

              {/* 等级标题 + 总词数 */}
              <div className="px-4 py-2 text-[11px] text-[#9aa0a6]">
                HSK {hskLevel} · {hskTotal} {t.vocabWords}
              </div>

              {/* 词汇列表（无限滚动） */}
              <div className="max-h-72 overflow-y-auto">
                {hskWords.length === 0 && !hskLoading && (
                  <div className="px-4 py-6 text-center text-sm text-[#b0b7bf]">—</div>
                )}
                {hskWords.map((w, i) => {
                  const primary = script === "traditional" && w.traditional ? w.traditional : w.word;
                  return (
                    <button key={`${w.word}-${i}`}
                      onClick={() => { handleSearch(w.word); setVocabOpen(false); }}
                      className="w-full px-4 py-2 flex items-center gap-3 hover:bg-[#fafaf8] transition-colors text-left">
                      <span className="chinese font-semibold text-sm text-[#1c1917]"
                        lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{primary}</span>
                      {(w.pinyin || w.zhuyin) && (
                        <span className="text-xs text-[#4285f4]">
                          {script === "traditional"
                            ? (w.zhuyin || pinyinToBopomofo(w.pinyin ?? ""))
                            : w.pinyin}
                        </span>
                      )}
                      {w.hsk_pos && (
                        <span className="text-[10px] text-[#c4c4c4] ml-auto">{w.hsk_pos}</span>
                      )}
                    </button>
                  );
                })}
                {/* 无限滚动哨兵 */}
                {hskHasMore && (
                  <div ref={hskSentinelRef} className="flex justify-center py-3">
                    {hskLoading && (
                      <div className="w-4 h-4 rounded-full border-2 border-[#c41e3a] border-t-transparent spinner" />
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 分隔线 */}
      {searched && <div className="flex-shrink-0 mt-4 border-b border-[#ebebeb]" />}

      {/* 结果区域 */}
      {searched && (
        <div ref={scrollAreaRef} className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-6 py-8 space-y-6">
            {history.map(entry => (
              <div key={entry.id}>
                {entry.loading && (
                  <div className="flex items-center gap-3 text-[#9aa0a6]">
                    <div className="w-5 h-5 rounded-full border-2 border-[#c41e3a] border-t-transparent spinner" />
                    <span className="text-sm">{t.translating} "{entry.query}"...</span>
                  </div>
                )}
                {entry.error && !entry.loading && (
                  <div className="flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
                    <span className="text-red-500 text-lg leading-none mt-0.5">⚠</span>
                    <div>
                      <p className="font-medium text-red-700 text-sm">{t.errorTitle}</p>
                      <p className="text-sm text-red-600 mt-0.5">{entry.error}</p>
                    </div>
                  </div>
                )}
                {entry.result && !entry.loading && (
                  <Result data={entry.result} query={entry.query} lang={lang} script={script} t={t} onWordAdded={handleWordAdded} />
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 工具侧边栏（Word Book + Pinyin Guide） */}
      <ToolsSidebar
        open={toolsOpen}
        onClose={() => setToolsOpen(false)}
        onStartReview={handleStartReview}
        lang={lang}
        script={script}
        t={t}
        refreshKey={wordBookRefresh}
        requireLogin={!user}
        onRequireLogin={() => { setToolsOpen(false); navigate("/auth/login", { state: { from: "/" } }); }}
      />

      {/* 闪卡复习（全屏） */}
      {reviewCards && (
        <FlashcardReview cards={reviewCards} onClose={handleCloseReview} script={script} t={t} />
      )}
    </div>
  );
}
