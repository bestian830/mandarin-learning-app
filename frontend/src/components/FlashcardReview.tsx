// 闪卡复习界面：全屏覆盖，卡片翻转动画，自评 + Leitner 更新

import { useState, useCallback } from "react";
import type { FlashCard } from "../types/index";
import type { Strings, ScriptMode } from "../i18n";
import { useFlashcards } from "../lib/useFlashcards";
import SpeakerButton from "./SpeakerButton";
import { pinyinToBopomofo } from "../data/pinyin";

interface Props {
  cards: FlashCard[];       // 待复习卡片队列
  onClose: () => void;
  script?: ScriptMode;
  t: Strings;
}

export default function FlashcardReview({ cards, onClose, script = "simplified", t }: Props) {
  const fc = useFlashcards();
  const [index, setIndex] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [results, setResults] = useState<string[]>([]);
  const [finished, setFinished] = useState(false);

  const current = cards[index];
  const total = cards.length;
  // 有备注的词才允许翻转
  const canFlip = !!current.note;

  // 翻转卡片
  const handleFlip = useCallback(() => {
    if (!canFlip) return;
    setFlipped(f => !f);
  }, [canFlip]);

  // 答题后进入下一张：'forgot' / 'fuzzy' / 'got_it'
  type Answer = "forgot" | "fuzzy" | "got_it";
  const handleAnswer = useCallback(async (answer: Answer) => {
    // forgot → box 回 1，fuzzy → box 不变，got_it → box+1
    const deckId = fc.getActiveDeckId();
    try {
      if (answer === "forgot") {
        await fc.reviewCard(current.id, false, deckId);
      } else if (answer === "fuzzy") {
        await fc.reviewCardFuzzy(current.id, deckId);
      } else {
        await fc.reviewCard(current.id, true, deckId);
      }
    } catch (err) {
      console.error("[FlashcardReview] review update failed", err);
      // 即便后端更新失败也继续走完流程，不卡住用户
    }
    const newResults = [...results, answer];
    setResults(newResults);

    if (index + 1 >= total) {
      setFinished(true);
    } else {
      setFlipped(false);
      setIndex(prev => prev + 1);
    }
  }, [current, index, total, results, fc]);

  // 结果统计页
  if (finished) {
    const gotItCount = results.filter(r => r === "got_it").length;
    const fuzzyCount = results.filter(r => r === "fuzzy").length;
    const forgotCount = results.filter(r => r === "forgot").length;
    return (
      <div className="fixed inset-0 z-[60] bg-[#fafaf8] flex flex-col items-center justify-center px-6">
        {/* 关闭按钮 */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-10 h-10 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="#9aa0a6" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* 完成图标 */}
        <div className="w-16 h-16 rounded-full bg-[#e8f5e9] flex items-center justify-center mb-5">
          <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
            <path d="M5 14L11 20L23 8" stroke="#43a047" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </div>

        <h2 className="text-xl font-bold text-[#1c1917] mb-2">
          {t.fcComplete || "Review Complete!"}
        </h2>

        {/* 统计：三档 */}
        <div className="flex gap-8 mt-4">
          <div className="text-center">
            <div className="text-3xl font-bold text-[#43a047]">{gotItCount}</div>
            <div className="text-xs text-[#9aa0a6] mt-1">{t.fcGotIt || "Got it"}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#ff9800]">{fuzzyCount}</div>
            <div className="text-xs text-[#9aa0a6] mt-1">{t.fcFuzzy || "Fuzzy"}</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-[#ef5350]">{forgotCount}</div>
            <div className="text-xs text-[#9aa0a6] mt-1">{t.fcForgot || "Forgot"}</div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="mt-8 px-8 py-2.5 rounded-xl bg-[#c41e3a] text-white text-sm font-semibold
            hover:bg-[#a31830] transition-colors"
        >
          {t.fcClose || "Close"}
        </button>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-[60] bg-[#fafaf8] flex flex-col">
      {/* 顶部栏：进度 + 关闭 */}
      <div className="flex items-center justify-between px-5 py-4 flex-shrink-0">
        <span className="text-sm font-medium text-[#9aa0a6]">
          {index + 1} / {total}
        </span>
        {/* 进度条 */}
        <div className="flex-1 mx-4 h-1.5 bg-[#e8e8e8] rounded-full overflow-hidden">
          <div
            className="h-full bg-[#c41e3a] rounded-full transition-all duration-300"
            style={{ width: `${((index + 1) / total) * 100}%` }}
          />
        </div>
        <button
          onClick={onClose}
          className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-[#f0f0f0] transition-colors"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M2 2L12 12M12 2L2 12" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* 中央卡片区域 */}
      <div className="flex-1 flex items-center justify-center px-6 pb-32">
        <div
          onClick={handleFlip}
          className={`w-full max-w-sm ${canFlip ? "cursor-pointer" : "cursor-default"}`}
          style={{ perspective: "1000px" }}
        >
          <div
            className="relative w-full transition-transform duration-500"
            style={{
              transformStyle: "preserve-3d",
              transform: flipped ? "rotateY(180deg)" : "rotateY(0)",
              minHeight: "280px",
            }}
          >
            {/* 正面：中文 + 拼音（逐字对齐，根据字数自适应大小） */}
            <div
              className="absolute inset-0 rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#ebebeb]
                flex flex-col items-center justify-center px-6 py-8 overflow-hidden"
              style={{ backfaceVisibility: "hidden" }}
            >
              {/* 字 + 拼音上下对齐 */}
              <div className="flex items-end gap-0.5 justify-center flex-wrap">
                {(() => {
                  const primaryText = script === "traditional" ? (current.traditional || current.word) : current.word;
                  const chars = [...primaryText];
                  const pinyins = current.pinyin.split(/\s+/);
                  const len = chars.length;
                  // 根据字数动态调整字号
                  const charSize = len <= 2 ? "text-5xl" : len <= 4 ? "text-4xl" : len <= 6 ? "text-3xl" : "text-2xl";
                  const pinyinSize = len <= 4 ? "text-sm" : "text-[11px]";
                  const cellMin = len <= 4 ? "2.5rem" : len <= 6 ? "2rem" : "1.6rem";
                  return chars.map((char, i) => {
                    const py = pinyins[i] || "";
                    const phonetic = script === "traditional" ? pinyinToBopomofo(py) : py;
                    return (
                      <div key={i} className="flex flex-col items-center" style={{ minWidth: cellMin }}>
                        <span className={`chinese ${charSize} font-bold text-[#1c1917] leading-tight`}
                          lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>
                          {char}
                        </span>
                        <span className={`${pinyinSize} text-[#4285f4] mt-0.5 whitespace-nowrap`}>
                          {phonetic}
                        </span>
                      </div>
                    );
                  });
                })()}
              </div>

              {/* 播放���钮：阻止冒泡避免触发翻卡 */}
              <div className="mt-5" onClick={e => e.stopPropagation()}>
                <SpeakerButton text={current.word} lang="zh-CN" rate={0.75} />
              </div>

              {/* 翻转提示（仅有备注的词显示） */}
              {canFlip && (
                <span className="text-[11px] text-[#c4c4c4] mt-6">
                  {t.fcTapToFlip || "Tap to flip"}
                </span>
              )}
            </div>

            {/* 背面：用户备注 */}
            <div
              className="absolute inset-0 rounded-2xl bg-white shadow-[0_8px_40px_rgba(0,0,0,0.08)] border border-[#ebebeb]
                flex flex-col items-center justify-center px-8 py-10"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <span className="chinese text-lg text-[#1c1917] text-center leading-relaxed">
                {current.note}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 底部三个按钮：始终显示 */}
      <div className="fixed bottom-0 left-0 right-0 pb-10 pt-4 flex justify-center gap-4">
        {/* 不记得 */}
        <button
          onClick={() => handleAnswer("forgot")}
          className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-white border-2 border-[#ef5350]
            text-[#ef5350] font-semibold text-sm shadow-sm
            hover:bg-red-50 active:scale-95 transition-all duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M3 3L13 13M13 3L3 13" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"/>
          </svg>
          {t.fcForgot || "Forgot"}
        </button>

        {/* 模糊 */}
        <button
          onClick={() => handleAnswer("fuzzy")}
          className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-white border-2 border-[#ff9800]
            text-[#ff9800] font-semibold text-sm shadow-sm
            hover:bg-orange-50 active:scale-95 transition-all duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="2"/>
            <path d="M6.5 7C6.5 6.17 7.17 5.5 8 5.5C8.83 5.5 9.5 6.17 9.5 7C9.5 7.83 8.5 8 8 8.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            <circle cx="8" cy="10.5" r="0.8" fill="currentColor"/>
          </svg>
          {t.fcFuzzy || "Fuzzy"}
        </button>

        {/* 记得 */}
        <button
          onClick={() => handleAnswer("got_it")}
          className="flex items-center gap-1.5 px-6 py-3 rounded-2xl bg-white border-2 border-[#43a047]
            text-[#43a047] font-semibold text-sm shadow-sm
            hover:bg-green-50 active:scale-95 transition-all duration-150"
        >
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
            <path d="M2.5 8L6 11.5L13.5 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          {t.fcGotIt || "Got it"}
        </button>
      </div>
    </div>
  );
}
