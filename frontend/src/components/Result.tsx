import { useState, useRef, useEffect, useCallback } from "react";
import type { SearchResult, Segment, Deck } from "../types/index";
import type { Lang, ScriptMode, Strings } from "../i18n";
import SpeakerButton from "./SpeakerButton";
import { useFlashcards } from "../lib/useFlashcards";
import { useUserStore } from "../store/user";
import { pinyinToBopomofo } from "../data/pinyin";

interface Props {
  data: SearchResult;
  query: string;
  lang: Lang;
  script?: ScriptMode;
  t: Strings;
  onWordAdded?: () => void; // 通知父组件单词本数据已变
}

type SpeedValue = 0.5 | 0.75 | 1.0 | 1.25 | 1.5 | 2.0;

const SPEEDS: { value: SpeedValue; label: string }[] = [
  { value: 0.5,  label: "0.5×" },
  { value: 0.75, label: "0.75×" },
  { value: 1.0,  label: "1×" },
  { value: 1.25, label: "1.25×" },
  { value: 1.5,  label: "1.5×" },
  { value: 2.0,  label: "2×" },
];

function isChinese(char: string): boolean {
  return /[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]/.test(char);
}

function toLangTag(azureLang: string): string {
  const lower = azureLang?.toLowerCase() ?? "en";
  if (lower.startsWith("zh")) return "zh-CN";
  const map: Record<string, string> = {
    en: "en-US", ja: "ja-JP", ko: "ko-KR", de: "de-DE",
    fr: "fr-FR", es: "es-ES", ru: "ru-RU", pt: "pt-PT",
    it: "it-IT", nl: "nl-NL", pl: "pl-PL", ar: "ar-SA",
    hi: "hi-IN", th: "th-TH", vi: "vi-VN", tr: "tr-TR",
    id: "id-ID",
  };
  return map[lower] ?? "en-US";
}

// 不显示词性的分类
const NO_TOOLTIP = new Set(["punct"]);

// 单个词段（带 hover 浮动卡 + 收藏按钮）
function SegmentGroup({ seg, lang, script = "simplified", t, context, onWordAdded }: {
  seg: Segment;
  lang: Lang;
  script?: ScriptMode;
  t: Strings;
  context: string;      // 来源整句简体
  onWordAdded?: () => void;
}) {
  const fc = useFlashcards();
  const user = useUserStore(s => s.user);
  const [saved, setSaved] = useState(false);
  const [adding, setAdding] = useState(false);
  const [pickingDeck, setPickingDeck] = useState(false);
  const [decks, setDecks] = useState<Deck[]>(() => fc.getDecks());
  const [showLoginHint, setShowLoginHint] = useState(false);

  // 登录后 cache 预热完成时刷新 decks 和 saved 状态
  useEffect(() => {
    if (!user) { setDecks([]); setSaved(false); return; }
    let cancelled = false;
    (async () => {
      try { await fc.reload(); } catch { /* 首次加载失败不阻塞 */ }
      if (cancelled) return;
      setDecks(fc.getDecks());
      setSaved(fc.exists(seg.word));
    })();
    return () => { cancelled = true; };
  }, [user, fc, seg.word]);

  // 执行添加到指定卡组（不管理 adding 状态，由 handleAdd 统一管理）
  const doAdd = useCallback(async (deckId: string) => {
    setPickingDeck(false);
    try {
      await fc.add({
        word: seg.word,
        traditional: seg.traditional ?? seg.word,
        pinyin: seg.pinyin,
        pos: seg.category,
        meaning: "",
        context,
      }, deckId);
      setSaved(true);
      onWordAdded?.();
    } catch (err) {
      console.error("[Result] add word failed", err);
    }
  }, [seg, context, onWordAdded, fc]);

  // 点击 "+" 按钮：未登录跳登录页，已登录拉取最新 deck 列表
  const handleAdd = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (saved || adding) return;
    // 未登录 → 提示需要先登录
    if (!user) {
      setShowLoginHint(true);
      setTimeout(() => setShowLoginHint(false), 2500);
      return;
    }
    setAdding(true);
    try {
      // 确保拿到最新 deck 列表（cache 可能还没预热）
      try { await fc.reload(); } catch { /* ignore */ }
      const latest = fc.getDecks();
      setDecks(latest);

      if (latest.length === 0) {
        // 自动创建默认卡组后直接添加
        const newDeck = await fc.createDeck(t.wbDefaultDeckName || "My Words");
        setDecks([newDeck]);
        await doAdd(newDeck.id);
      } else if (latest.length === 1) {
        await doAdd(latest[0].id);
      } else {
        // 多卡组 → 弹出选择器
        setPickingDeck(true);
      }
    } finally {
      setAdding(false);
    }
  }, [saved, adding, user, fc, t, doAdd]);

  // 繁体模式：取 seg.traditional 的字符来对应显示
  const tradChars = seg.traditional ? [...seg.traditional] : [];
  const isTraditional = script === "traditional";

  // 字符渲染（共用）
  const charNodes = seg.chars.map(({ char, pinyin }, i) =>
    char === " " ? (
      <div key={i} className="w-1.5" />
    ) : (
      <div key={i} className="flex flex-col items-center" style={{ minWidth: "1.5rem" }}>
        <span className="chinese text-3xl font-bold text-[#1c1917] leading-tight" lang={isTraditional ? "zh-Hant" : "zh-Hans"}>
          {isTraditional ? (tradChars[i] ?? char) : char}
        </span>
        {pinyin && (
          <span className="text-[10px] text-[#4285f4] mt-0.5 leading-none whitespace-nowrap">
            {isTraditional ? pinyinToBopomofo(pinyin) : pinyin}
          </span>
        )}
      </div>
    )
  );

  // 标点 —— 不加 tooltip
  if (NO_TOOLTIP.has(seg.category)) return <>{charNodes}</>;

  return (
    <div className="relative group/seg">
      {/* 字符行 */}
      <div className="flex">{charNodes}</div>

      {/* 浮动卡片 */}
      <div
        className="absolute top-full left-0 mt-2
                   invisible opacity-0
                   group-hover/seg:visible group-hover/seg:opacity-100
                   transition-[opacity,visibility] duration-150 z-30"
      >
        <div className={`rounded-xl bg-white shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-[#ebebeb] px-3.5 py-3 relative
          ${pickingDeck ? "w-[200px]" : "w-[160px]"}`}
        >
          {/* ── 选择卡组模式 ── */}
          {pickingDeck ? (
            <>
              <div className="text-[10px] text-[#9aa0a6] font-medium mb-2 uppercase tracking-widest">
                {t.wbChooseDeck || "Add to deck"}
              </div>
              <div className="flex flex-col gap-1">
                {decks.map(deck => (
                  <button
                    key={deck.id}
                    onClick={async (e) => { e.stopPropagation(); setAdding(true); try { await doAdd(deck.id); } finally { setAdding(false); } }}
                    className="flex items-center gap-2 w-full px-2 py-1.5 rounded-lg hover:bg-[#fef5f6] transition-colors text-left"
                  >
                    <span className="text-base leading-none">📖</span>
                    <span className="text-sm font-medium text-[#1c1917] truncate">{deck.name}</span>
                  </button>
                ))}
              </div>
              <button
                onClick={(e) => { e.stopPropagation(); setPickingDeck(false); }}
                className="mt-2 text-[10px] text-[#9aa0a6] hover:text-[#6b7280] w-full text-center transition-colors"
              >
                ✕
              </button>
            </>
          ) : (
            <>
              {/* 收藏按钮 — 右上角 */}
              <button
                onClick={handleAdd}
                disabled={saved || adding}
                className={`absolute top-2 right-2 w-6 h-6 flex items-center justify-center rounded-full transition-all duration-150 ${
                  saved
                    ? "bg-[#e8f5e9] text-[#43a047] cursor-default"
                    : adding
                      ? "bg-[#f5f5f5] text-[#bdbdbd] cursor-wait"
                      : "bg-[#fef5f6] text-[#c41e3a] hover:bg-[#c41e3a] hover:text-white cursor-pointer"
                }`}
                title={saved ? "Already saved" : t.wbChooseDeck || "Add to Word Book"}
              >
                {saved ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2 6L5 9L10 3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                ) : adding ? (
                  <div className="w-3 h-3 rounded-full border-2 border-[#bdbdbd] border-t-transparent animate-spin" />
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M6 2V10M2 6H10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                )}
              </button>

              {/* 词语 */}
              <div className="flex items-baseline gap-2 flex-wrap pr-7">
                <span
                  className="chinese font-bold text-[#1c1917] leading-none"
                  style={{ fontSize: seg.word.length > 3 ? "1.1rem" : "1.35rem" }}
                  lang={isTraditional ? "zh-Hant" : "zh-Hans"}
                >
                  {isTraditional ? (seg.traditional ?? seg.word) : seg.word}
                </span>
              </div>

              {/* 拼音/注音 */}
              {seg.pinyin && (
                <div className="mt-1.5 text-[11px] leading-none text-[#4285f4]">
                  {isTraditional ? pinyinToBopomofo(seg.pinyin) : seg.pinyin}
                </div>
              )}

              {/* 未登录提示 */}
              {showLoginHint && (
                <div className="mt-2 text-[10px] text-[#c41e3a] bg-[#fef5f6] rounded-lg px-2 py-1.5 leading-snug animate-[fadeIn_0.15s_ease]">
                  {t.loginToSave}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default function Result({ data, query, lang, script = "simplified", t, onWordAdded }: Props) {
  const { simplified, segments, sourceLang } = data;
  const [zhRate, setZhRate] = useState<SpeedValue>(1.0);
  const [speedOpen, setSpeedOpen] = useState(false);
  const speedRef = useRef<HTMLDivElement>(null);

  // 点击外部关闭下拉
  useEffect(() => {
    if (!speedOpen) return;
    const handler = (e: MouseEvent) => {
      if (speedRef.current && !speedRef.current.contains(e.target as Node)) {
        setSpeedOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [speedOpen]);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-[#ebebeb] px-7 py-6 overflow-visible">

      {/* 分词展示 + 拼音（占满整行） */}
      <div className="flex flex-wrap gap-x-1 gap-y-3">
        {segments.map((seg, i) => (
          <SegmentGroup key={i} seg={seg} lang={lang} script={script} t={t} context={simplified} onWordAdded={onWordAdded} />
        ))}
      </div>

      {/* 朗读控制 */}
      <div className="mt-5 flex items-center gap-3">
        <SpeakerButton text={simplified} lang="zh-CN" rate={zhRate} />

        {/* 倍速选择器 */}
        <div ref={speedRef} className="relative">
          <button
            onClick={() => setSpeedOpen(v => !v)}
            className={`flex items-center gap-1 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150 ${
              speedOpen
                ? "border-[#c41e3a] bg-[#fef5f6] text-[#c41e3a]"
                : zhRate !== 1.0
                  ? "border-[#c41e3a] bg-white text-[#c41e3a]"
                  : "border-[#e4e4e4] bg-white text-[#9aa0a6] hover:border-[#c41e3a] hover:text-[#c41e3a]"
            }`}
          >
            {SPEEDS.find(s => s.value === zhRate)?.label ?? "1×"}
            <svg
              width="10" height="10" viewBox="0 0 10 10" fill="none"
              className={`transition-transform duration-150 ${speedOpen ? "rotate-180" : ""}`}
            >
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          {speedOpen && (
            <div className="absolute top-full left-0 mt-2 w-24 rounded-xl bg-white border border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.1)] overflow-hidden z-50">
              {SPEEDS.map(({ value, label }) => {
                const active = zhRate === value;
                return (
                  <button
                    key={value}
                    onClick={() => { setZhRate(value); setSpeedOpen(false); }}
                    className={`w-full text-left px-3.5 py-2 text-xs font-medium transition-colors duration-100 ${
                      active
                        ? "bg-[#fef5f6] text-[#c41e3a]"
                        : "text-[#1c1917] hover:bg-[#fafafa]"
                    }`}
                  >
                    <span className="flex items-center justify-between">
                      {label}
                      {active && (
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                          <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#c41e3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* 原文 + 朗读 */}
      <div className="mt-5 pt-4 border-t border-[#f4f4f4] flex items-center justify-between gap-4">
        <span className="text-sm text-[#9aa0a6] leading-relaxed" style={{ fontFamily: "'DM Sans', sans-serif" }}>
          {query}
        </span>
        <SpeakerButton text={query} lang={toLangTag(sourceLang)} rate={1} size="sm" />
      </div>

    </div>
  );
}
