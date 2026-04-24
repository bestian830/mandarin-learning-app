// 左侧工具栏：Word Book + Pinyin Guide 两个 tab
// 从左侧滑入，汉堡按钮触发，右侧边缘可拖拽调整宽度
import { useState, useRef, useCallback, useEffect } from "react";
import type { FlashCard } from "../types/index";
import type { Strings, Lang, ScriptMode } from "../i18n";
import WordBook from "./WordBook";
import PinyinSidebar from "./PinyinSidebar";
import PhoneticText from "./PhoneticText";

type Tab = "wordbook" | "pinyin";

const MIN_WIDTH = 280;
const MAX_WIDTH_RATIO = 0.6; // 最大占屏幕宽度 60%
const DEFAULT_WIDTH = 340;
const STORAGE_KEY = "mm_sidebar_width";
const PHONETIC_KEY = "mm_show_phonetic";
const NATIVE_LANG_KEY = "mm_native_lang_mode";

interface Props {
  open: boolean;
  onClose: () => void;
  onStartReview: (cards: FlashCard[]) => void;
  lang: Lang;
  script: ScriptMode;
  t: Strings;
  refreshKey: number;
  requireLogin?: boolean;
  onRequireLogin?: () => void;
}

export default function ToolsSidebar({
  open, onClose, onStartReview, lang, script, t, refreshKey,
  requireLogin, onRequireLogin,
}: Props) {
  const [tab, setTab] = useState<Tab>("wordbook");

  // 注音/拼音显示开关（localStorage 持久化）
  const [showPhonetic, setShowPhonetic] = useState(() => {
    const saved = localStorage.getItem(PHONETIC_KEY);
    return saved === null ? true : saved === "1";
  });
  const togglePhonetic = useCallback(() => {
    setShowPhonetic(prev => {
      const next = !prev;
      localStorage.setItem(PHONETIC_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  // 母语/中文切换（控制整个侧边栏的 UI 语言）
  const [useNativeLang, setUseNativeLang] = useState(() => {
    return localStorage.getItem(NATIVE_LANG_KEY) === "1";
  });
  const isChineseNative = lang === "zh-Hans" || lang === "zh-Hant";
  // 母语模式下注音无意义，强制关闭
  const effectiveShowPhonetic = showPhonetic && !useNativeLang;
  const toggleNativeLang = useCallback(() => {
    setUseNativeLang(prev => {
      const next = !prev;
      localStorage.setItem(NATIVE_LANG_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  // 宽度状态，从 localStorage 恢复
  const [width, setWidth] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? Math.max(MIN_WIDTH, Math.min(Number(saved), window.innerWidth * MAX_WIDTH_RATIO)) : DEFAULT_WIDTH;
  });

  const dragging = useRef(false);
  const startX = useRef(0);
  const startW = useRef(0);

  const onMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    dragging.current = true;
    startX.current = e.clientX;
    startW.current = width;
    document.body.style.cursor = "col-resize";
    document.body.style.userSelect = "none";
  }, [width]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (!dragging.current) return;
      const maxW = window.innerWidth * MAX_WIDTH_RATIO;
      const newW = Math.max(MIN_WIDTH, Math.min(startW.current + (e.clientX - startX.current), maxW));
      setWidth(newW);
    };
    const onMouseUp = () => {
      if (!dragging.current) return;
      dragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
      // 保存宽度到 localStorage
      setWidth(w => { localStorage.setItem(STORAGE_KEY, String(Math.round(w))); return w; });
    };
    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
    return () => {
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };
  }, []);

  // 母语模式下的 tab 标签文本
  const wbLabel = useNativeLang ? (t.wbTitle || "Word Book") : null;
  const pyLabel = useNativeLang
    ? (script === "traditional" ? (t.bpTitle || "Bopomofo Guide") : t.pyTitle)
    : null;

  return (
    <>
      {/* 遮罩 */}
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      {/* 侧边栏（左侧滑入） */}
      <div
        className={`fixed top-0 left-0 h-full bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex flex-col
          ${open ? "translate-x-0" : "-translate-x-full"}`}
        style={{ width: `${width}px`, maxWidth: "85vw" }}
      >
        {/* Tab 切换头部 */}
        <div className="flex items-center border-b border-[#f0f0f0] flex-shrink-0">
          <button
            onClick={() => setTab("wordbook")}
            className={`flex-1 py-3 text-[11px] font-semibold tracking-wide text-center transition-colors relative min-w-0
              ${tab === "wordbook"
                ? "text-[#c41e3a]"
                : "text-[#9aa0a6] hover:text-[#6b7280]"
              }`}
          >
            <div className="flex items-center justify-center gap-1">
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.3" className="flex-shrink-0">
                <path d="M2 2.5C2 2.22 2.22 2 2.5 2H6C6.55 2 7 2.45 7 3V13C7 13.55 6.55 14 6 14H2.5C2.22 14 2 13.78 2 13.5V2.5Z"/>
                <path d="M9 3C9 2.45 9.45 2 10 2H13.5C13.78 2 14 2.22 14 2.5V13.5C14 13.78 13.78 14 13.5 14H10C9.45 14 9 13.55 9 13V3Z"/>
              </svg>
              {wbLabel
                ? <span className="truncate">{wbLabel}</span>
                : <PhoneticText simplified="单词本" traditional="單詞本" pinyin="dān cí běn" script={script}
                    showPhonetic={showPhonetic} phoneticSize="text-[5px]" />
              }
            </div>
            {tab === "wordbook" && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#c41e3a] rounded-full" />
            )}
          </button>
          <button
            onClick={() => setTab("pinyin")}
            className={`flex-1 py-3 text-[11px] font-semibold tracking-wide text-center transition-colors relative min-w-0
              ${tab === "pinyin"
                ? "text-[#c41e3a]"
                : "text-[#9aa0a6] hover:text-[#6b7280]"
              }`}
          >
            <div className="flex items-center justify-center gap-1">
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="flex-shrink-0">
                <path d="M4 7h16M4 12h10M4 17h12"/>
              </svg>
              {pyLabel
                ? <span className="truncate">{pyLabel}</span>
                : script === "traditional"
                  ? <PhoneticText simplified="注音指南" traditional="注音指南" pinyin="zhù yīn zhǐ nán" script={script}
                      showPhonetic={showPhonetic} phoneticSize="text-[5px]" />
                  : <PhoneticText simplified="拼音指南" pinyin="pīn yīn zhǐ nán" script={script}
                      showPhonetic={showPhonetic} phoneticSize="text-[5px]" />
              }
            </div>
            {tab === "pinyin" && (
              <div className="absolute bottom-0 left-4 right-4 h-[2px] bg-[#c41e3a] rounded-full" />
            )}
          </button>

          {/* 工具按钮组 */}
          <div className="flex items-center flex-shrink-0">
            {/* 注音/拼音显示开关 */}
            <button
              onClick={togglePhonetic}
              disabled={useNativeLang}
              className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150
                ${useNativeLang
                  ? "text-[#d0d0d0] cursor-not-allowed opacity-40"
                  : showPhonetic
                    ? "text-[#c41e3a] bg-[#fef5f6]"
                    : "text-[#c0c7cf] hover:text-[#6b7280]"
                }`}
              title={useNativeLang
                ? "Disabled in native language mode"
                : showPhonetic
                  ? (script === "traditional" ? "Hide bopomofo" : "Hide pinyin")
                  : (script === "traditional" ? "Show bopomofo" : "Show pinyin")
              }
            >
              <span className="text-[10px] font-bold leading-none">
                {script === "traditional" ? "注" : "拼"}
              </span>
            </button>

            {/* 母语/中文切换开关（母语非中文时显示） */}
            {!isChineseNative && (
              <button
                onClick={toggleNativeLang}
                className={`w-7 h-7 flex items-center justify-center rounded-full transition-all duration-150
                  ${useNativeLang
                    ? "text-[#c41e3a] bg-[#fef5f6]"
                    : "text-[#c0c7cf] hover:text-[#6b7280]"
                  }`}
                title={useNativeLang ? "Switch to Chinese" : "Switch to native language"}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
              </button>
            )}

            {/* 关闭按钮 */}
            <button
              onClick={onClose}
              className="w-7 h-7 flex items-center justify-center flex-shrink-0 text-[#9aa0a6] hover:text-[#6b7280] transition-colors"
            >
              <svg width="12" height="12" viewBox="0 0 14 14" fill="none">
                <path d="M2 2L12 12M12 2L2 12" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
              </svg>
            </button>
          </div>
        </div>

        {/* Tab 内容 */}
        <div className="flex-1 overflow-hidden">
          {tab === "wordbook" ? (
            <WordBook
              open={true}
              onClose={onClose}
              onStartReview={onStartReview}
              lang={lang}
              script={script}
              t={t}
              refreshKey={refreshKey}
              embedded
              requireLogin={requireLogin}
              onRequireLogin={onRequireLogin}
              showPhonetic={effectiveShowPhonetic}
            />
          ) : (
            <PinyinSidebar open={true} onClose={onClose} t={t} lang={lang} script={script} embedded
              showPhonetic={effectiveShowPhonetic} useNativeLang={useNativeLang} />
          )}
        </div>

        {/* 右侧拖拽手柄 */}
        <div
          onMouseDown={onMouseDown}
          className="absolute top-0 right-0 w-1.5 h-full cursor-col-resize group z-10
            hover:bg-[#c41e3a]/20 active:bg-[#c41e3a]/30 transition-colors"
        >
          {/* 中间可视指示器 */}
          <div className="absolute top-1/2 -translate-y-1/2 right-0 w-1 h-8 rounded-full
            bg-[#d0d0d0] group-hover:bg-[#c41e3a]/50 transition-colors" />
        </div>
      </div>
    </>
  );
}
