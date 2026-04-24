// 拼音/注音教学侧边栏 v4
// 默认全中文内容（每个字下方标注拼音或注音），可通过外部 prop 切换母语模式
// Tab 结构：总览 / 声母 / 韵母 / 整体认读 / 书写规则
// 音频来源：frontend/public/audio/{initials,finals,whole}/*.mp3（本地静态文件）

import { useState, useCallback } from "react";
import ToneContour from "./ToneContour";
import PhoneticText from "./PhoneticText";
import {
  INITIALS, FINALS, WHOLE_SYLLABLE_GROUPS, WHOLE_SYLLABLES,
  SPELLING_RULES, BOPOMOFO_RULES,
  applyTone, applyBopomoTone,
  type InitialEntry, type FinalEntry,
} from "../data/pinyin";
import {
  TAB_LABELS, GROUP_KEY_MAP,
  OV_TITLE, OV_INTRO, OV_INITIAL, OV_FINAL, OV_INITIAL_DESC, OV_FINAL_DESC,
  OV_TONE_TITLE, OV_TONE_DESC, OV_OPTIONAL, OV_EXAMPLES,
  OV_WHOLE_TITLE, OV_WHOLE_DESC,
  RULE1_TITLE, RULE1_NOTE, RULE2_TITLE, RULE2_NOTE, RULE3_TITLE, RULE3_NOTE,
  BP_RULE1_TITLE, BP_RULE1_NOTE, BP_RULE2_TITLE, BP_RULE2_NOTE, BP_RULE3_TITLE, BP_RULE3_NOTE,
  type ZhText,
} from "../data/pinyinGuideZh";
import type { Strings, Lang, ScriptMode } from "../i18n";

// ── 类型 ─────────────────────────────────────────────────────────────────────

type Tab = "overview" | "initials" | "finals" | "whole" | "rules";

// ── 音频工具 ──────────────────────────────────────────────────────────────────

function toAudioKey(pinyin: string): string {
  return pinyin.replace("ü", "v");
}

function playAudio(path: string) {
  new Audio(path).play().catch(e => console.warn("[audio]", e));
}

function playInitial(initial: string) {
  playAudio(`/audio/initials/${initial}.mp3`);
}

function playFinalTone(final: string, tone: number) {
  playAudio(`/audio/finals/${toAudioKey(final)}${tone}.mp3`);
}

function playWholeTone(syllable: string, tone: number) {
  playAudio(`/audio/whole/${syllable}${tone}.mp3`);
}

// ── 辅助：中文文本渲染 ──────────────────────────────────────────────────────

function ZhOrNative({ zh, nativeText, script, useNative, showPhonetic, className }: {
  zh: ZhText;
  nativeText: string;
  script: ScriptMode;
  useNative: boolean;
  showPhonetic?: boolean;
  className?: string;
}) {
  if (useNative) {
    return <span className={className}>{nativeText}</span>;
  }
  return (
    <PhoneticText
      simplified={zh.s}
      traditional={zh.t}
      pinyin={zh.py}
      script={script}
      showPhonetic={showPhonetic}
      className={className}
    />
  );
}

// ── 子组件 ────────────────────────────────────────────────────────────────────

function ToneRow({
  pinyin, bopomo, playFn, isZhuyin,
}: {
  pinyin: string;
  bopomo?: string;
  playFn: (tone: number) => void;
  isZhuyin?: boolean;
}) {
  const tones = [1, 2, 3, 4] as const;
  return (
    <div className="flex gap-1.5 flex-wrap mt-1.5 px-1 pb-1">
      {tones.map(tone => {
        const marked = isZhuyin && bopomo ? applyBopomoTone(bopomo, tone) : applyTone(pinyin, tone);
        return (
          <button
            key={tone}
            onClick={e => { e.stopPropagation(); playFn(tone); }}
            className="
              flex items-center gap-1 px-2 py-1 rounded-lg
              bg-white border border-[#e8e8e8] hover:border-[#c41e3a] hover:bg-[#fef5f6]
              transition-all duration-150 select-none
            "
          >
            <span className="font-mono text-xs font-bold text-[#c41e3a]">{marked}</span>
            <svg width="10" height="10" viewBox="0 0 12 12" fill="none" className="text-[#9aa0a6]">
              <path d="M2 1.5L10 6L2 10.5V1.5Z" fill="currentColor"/>
            </svg>
          </button>
        );
      })}
    </div>
  );
}

function ExpandableBtn({
  label, expanded, onClick,
}: {
  label: string; expanded: boolean; onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`
        px-3 py-1.5 rounded-lg text-sm font-mono font-semibold border transition-all duration-150 select-none
        ${expanded
          ? "border-[#c41e3a] bg-[#fef5f6] text-[#c41e3a]"
          : "border-[#e8e8e8] bg-white text-[#1c1917] hover:border-[#c41e3a] hover:text-[#c41e3a] hover:bg-[#fef5f6]"
        }
      `}
    >
      {label}
    </button>
  );
}

function SectionLabel({ zh, nativeText, script, useNative, showPhonetic }: {
  zh: ZhText;
  nativeText: string;
  script: ScriptMode;
  useNative: boolean;
  showPhonetic?: boolean;
}) {
  if (useNative) {
    return <div className="text-[10px] uppercase tracking-widest text-[#b0b7bf] mb-2">{nativeText}</div>;
  }
  return (
    <div className="mb-2">
      <PhoneticText
        simplified={zh.s}
        traditional={zh.t}
        pinyin={zh.py}
        script={script}
        showPhonetic={showPhonetic}
        phoneticSize="text-[5px]"
        className="text-[10px] text-[#b0b7bf]"
      />
    </div>
  );
}

// ── 主组件 ────────────────────────────────────────────────────────────────────

interface Props {
  open:     boolean;
  onClose:  () => void;
  t:        Strings;
  lang?:    Lang;
  script?:  ScriptMode;
  embedded?: boolean;
  showPhonetic?: boolean;
  useNativeLang?: boolean;   // 由 ToolsSidebar 控制
}

export default function PinyinSidebar({
  open, onClose, t, lang = "en", script = "simplified", embedded,
  showPhonetic = true, useNativeLang = false,
}: Props) {
  const isZhuyin = script === "traditional";
  const [tab, setTab]             = useState<Tab>("overview");
  const [expandedKey, setExpanded] = useState<string | null>(null);

  const tabKeys: Tab[] = ["overview", "initials", "finals", "whole", "rules"];

  const toggleExpand = useCallback((key: string) => {
    setExpanded(prev => prev === key ? null : key);
  }, []);

  // 拼音规则 vs 注音规则
  const activeRules = isZhuyin ? BOPOMOFO_RULES : SPELLING_RULES;
  const PINYIN_RULE_DATA: Record<string, { title: ZhText; note: ZhText }> = {
    "1": { title: RULE1_TITLE, note: RULE1_NOTE },
    "2": { title: RULE2_TITLE, note: RULE2_NOTE },
    "3": { title: RULE3_TITLE, note: RULE3_NOTE },
  };
  const BPMF_RULE_DATA: Record<string, { title: ZhText; note: ZhText }> = {
    "bp1": { title: BP_RULE1_TITLE, note: BP_RULE1_NOTE },
    "bp2": { title: BP_RULE2_TITLE, note: BP_RULE2_NOTE },
    "bp3": { title: BP_RULE3_TITLE, note: BP_RULE3_NOTE },
  };
  const ruleDataMap = isZhuyin ? BPMF_RULE_DATA : PINYIN_RULE_DATA;

  // 整体认读：拼音→注音映射（总览 + 整体认读 Tab 共用）
  const wholeBopomoMap = new Map(WHOLE_SYLLABLES.map(w => [w.pinyin, w.bopomo]));

  // ── 总览 Tab ─────────────────────────────────────────────────────────────

  const renderOverview = () => (
    <div className="p-4 space-y-3">
      <div>
        <h2 className="text-sm font-bold text-[#1c1917]">
          <ZhOrNative zh={OV_TITLE} nativeText={t.pyOvTitle} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
        </h2>
        <div className="text-[11px] text-[#9aa0a6] mt-0.5">
          <ZhOrNative zh={OV_INTRO} nativeText={t.pyOvIntro} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
        </div>
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center gap-3 rounded-xl border border-dashed border-[#d0d0d0] bg-[#fafaf8] px-3 py-2.5">
          <span className="font-mono text-base font-bold text-[#1c1917] w-6 text-center shrink-0">{isZhuyin ? "ㄅ" : "b"}</span>
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 flex-wrap">
              <span className="text-[11px] font-semibold text-[#1c1917]">
                <ZhOrNative zh={OV_INITIAL} nativeText={t.pyOvInitial} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
              </span>
              <span className="text-[10px] text-[#b0b7bf]">
                <ZhOrNative zh={OV_OPTIONAL} nativeText={t.pyOvOptional} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
              </span>
            </div>
            <div className="text-[10px] text-[#9aa0a6] leading-tight mt-0.5">
              <ZhOrNative zh={OV_INITIAL_DESC} nativeText={t.pyOvInitialDesc} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-[#fafaf8] px-3 py-2.5">
          <span className="font-mono text-base font-bold text-[#c41e3a] w-6 text-center shrink-0">{isZhuyin ? "ㄚ" : "ā"}</span>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#1c1917]">
              <ZhOrNative zh={OV_FINAL} nativeText={t.pyOvFinal} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            </span>
            <div className="text-[10px] text-[#9aa0a6] leading-tight mt-0.5">
              <ZhOrNative zh={OV_FINAL_DESC} nativeText={t.pyOvFinalDesc} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 rounded-xl border border-[#e8e8e8] bg-[#fafaf8] px-3 py-2.5">
          <div className="flex gap-0.5 shrink-0 w-6 justify-center">
            <ToneContour tone={2} size={20} />
          </div>
          <div className="min-w-0">
            <span className="text-[11px] font-semibold text-[#1c1917]">
              <ZhOrNative zh={OV_TONE_TITLE} nativeText={t.pyOvToneTitle} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            </span>
            <div className="text-[10px] text-[#9aa0a6] leading-tight mt-0.5">
              <ZhOrNative zh={OV_TONE_DESC} nativeText={t.pyOvToneDesc} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            </div>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#f0f0f0] bg-[#fafaf8] p-3">
        <div className="text-[10px] uppercase tracking-widest text-[#b0b7bf] mb-2">
          <ZhOrNative zh={OV_EXAMPLES} nativeText={t.pyOvExamples} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs font-semibold bg-white border border-[#e8e8e8] rounded px-1.5 py-0.5 text-[#1c1917]">{isZhuyin ? "ㄅ" : "b"}</span>
            <span className="text-[10px] text-[#b0b7bf]">+</span>
            <span className="font-mono text-xs font-semibold bg-white border border-[#e8e8e8] rounded px-1.5 py-0.5 text-[#c41e3a]">{isZhuyin ? "ㄚ" : "ā"}</span>
            <span className="text-[10px] text-[#b0b7bf]">=</span>
            <span className="font-mono text-sm font-bold text-[#c41e3a]">{isZhuyin ? "ㄅㄚ" : "bā"}</span>
            <span className="text-[11px] text-[#9aa0a6] ml-0.5">八</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-mono text-xs bg-white border border-dashed border-[#d0d0d0] rounded px-1.5 py-0.5 text-[#b0b7bf]">∅</span>
            <span className="text-[10px] text-[#b0b7bf]">+</span>
            <span className="font-mono text-xs font-semibold bg-white border border-[#e8e8e8] rounded px-1.5 py-0.5 text-[#c41e3a]">{isZhuyin ? "ㄢ" : "ān"}</span>
            <span className="text-[10px] text-[#b0b7bf]">=</span>
            <span className="font-mono text-sm font-bold text-[#c41e3a]">{isZhuyin ? "ㄢ" : "ān"}</span>
            <span className="text-[11px] text-[#9aa0a6] ml-0.5">安</span>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-[#f5e6c8] bg-[#fffbf0] p-3">
        <div className="flex items-center gap-1.5 mb-1.5">
          <span className="text-sm">⭐</span>
          <span className="text-xs font-semibold text-[#8a6400]">
            <ZhOrNative zh={OV_WHOLE_TITLE} nativeText={t.pyOvWholeTitle} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
          </span>
        </div>
        <div className="text-[11px] text-[#9aa0a6] leading-relaxed mb-2">
          <ZhOrNative zh={OV_WHOLE_DESC} nativeText={t.pyOvWholeDesc} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
        </div>
        <div className="flex flex-wrap gap-1">
          {["zhi","chi","shi","ri","zi","ci","si","yi","wu","yu","ye","yue","yuan","yin","yun","ying"].map(s => (
            <span
              key={s}
              className="font-mono text-[11px] bg-white border border-[#e8c96a] rounded-md px-1.5 py-0.5 text-[#8a6400]"
            >
              {isZhuyin ? (wholeBopomoMap.get(s) ?? s) : s}
            </span>
          ))}
        </div>
      </div>
    </div>
  );

  // ── 声母 Tab ─────────────────────────────────────────────────────────────

  const renderInitials = () => (
    <div className="p-4 space-y-4">
      {INITIALS.map(group => {
        const zh = GROUP_KEY_MAP[group.groupKey];
        const nativeText = t[group.groupKey as keyof Strings] as string;
        return (
          <div key={group.groupKey}>
            <SectionLabel zh={zh} nativeText={nativeText} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            <div className="flex flex-wrap gap-1.5">
              {group.initials.map((e: InitialEntry) => {
                const label = isZhuyin ? e.bopomo.charAt(0) : e.pinyin;
                return (
                  <button
                    key={e.pinyin}
                    onClick={() => playInitial(e.pinyin)}
                    className="
                      px-3 py-2 rounded-lg text-sm font-mono font-medium
                      border border-[#e8e8e8] bg-white text-[#1c1917]
                      hover:border-[#c41e3a] hover:text-[#c41e3a] hover:bg-[#fef5f6]
                      transition-all duration-150 select-none
                    "
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── 韵母 Tab ─────────────────────────────────────────────────────────────

  const renderFinals = () => (
    <div className="p-4 space-y-4">
      {FINALS.map(group => {
        const zh = GROUP_KEY_MAP[group.groupKey];
        const nativeText = t[group.groupKey as keyof Strings] as string;
        return (
          <div key={group.groupKey}>
            <SectionLabel zh={zh} nativeText={nativeText} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            <div className="flex flex-col gap-1.5">
              <div className="flex flex-wrap gap-1.5">
                {group.finals.map((e: FinalEntry) => {
                  const key = `final-${e.pinyin}`;
                  const isExpanded = expandedKey === key;
                  return (
                    <div key={e.pinyin} className="flex flex-col">
                      <ExpandableBtn
                        label={isZhuyin ? e.bopomo : e.pinyin}
                        expanded={isExpanded}
                        onClick={() => { toggleExpand(key); }}
                      />
                      {isExpanded && (
                        <ToneRow
                          pinyin={e.pinyin}
                          bopomo={e.bopomo}
                          isZhuyin={isZhuyin}
                          playFn={tone => playFinalTone(e.pinyin, tone)}
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── 整体认读 Tab ──────────────────────────────────────────────────────────

  const renderWhole = () => (
    <div className="p-4 space-y-4">
      {WHOLE_SYLLABLE_GROUPS.map(group => {
        const zh = GROUP_KEY_MAP[group.groupKey];
        const nativeText = t[group.groupKey as keyof Strings] as string;
        return (
          <div key={group.groupKey}>
            <SectionLabel zh={zh} nativeText={nativeText} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            <div className="flex flex-wrap gap-1.5">
              {group.syllables.map(syllable => {
                const key = `whole-${syllable}`;
                const isExpanded = expandedKey === key;
                const bopomo = wholeBopomoMap.get(syllable) ?? "";
                return (
                  <div key={syllable} className="flex flex-col">
                    <ExpandableBtn
                      label={isZhuyin ? bopomo : syllable}
                      expanded={isExpanded}
                      onClick={() => toggleExpand(key)}
                    />
                    {isExpanded && (
                      <ToneRow
                        pinyin={syllable}
                        bopomo={bopomo}
                        isZhuyin={isZhuyin}
                        playFn={tone => playWholeTone(syllable, tone)}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── 规则 Tab ──────────────────────────────────────────────────────────────

  const RULE_ICONS: Record<string, string> = {
    "1": "①", "2": "②", "3": "③",
    "bp1": "①", "bp2": "②", "bp3": "③",
  };

  const renderRules = () => (
    <div className="p-4 space-y-3">
      {activeRules.map(r => {
        const rd = ruleDataMap[r.ruleKey];
        // 拼音规则用 pyRule/pyRuleNote，注音规则用 bpRule/bpRuleNote
        const nativeTitle = t[`${isZhuyin ? "bpRule" : "pyRule"}${r.ruleKey}` as keyof Strings] as string;
        const nativeNote  = t[`${isZhuyin ? "bpRuleNote" : "pyRuleNote"}${r.ruleKey}` as keyof Strings] as string;
        return (
          <div key={r.ruleKey} className="rounded-xl border border-[#f0f0f0] bg-[#fafaf8] p-3">
            <div className="flex items-center gap-1.5 mb-1.5">
              <span className="text-xs font-mono text-[#c41e3a]">{RULE_ICONS[r.ruleKey]}</span>
              <span className="text-xs font-semibold text-[#1c1917]">
                <ZhOrNative zh={rd.title} nativeText={nativeTitle} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {r.examples.map(ex => (
                <span
                  key={ex}
                  className="font-mono text-[11px] bg-white border border-[#e8e8e8] rounded-md px-2 py-0.5 text-[#c41e3a]"
                >
                  {ex}
                </span>
              ))}
            </div>
            <div className="text-[11px] text-[#9aa0a6] leading-relaxed">
              <ZhOrNative zh={rd.note} nativeText={nativeNote} script={script} useNative={useNativeLang} showPhonetic={showPhonetic} />
            </div>
          </div>
        );
      })}
    </div>
  );

  // ── 渲染 ──────────────────────────────────────────────────────────────────

  const tabContent: Record<Tab, React.ReactNode> = {
    overview: renderOverview(),
    initials: renderInitials(),
    finals:   renderFinals(),
    whole:    renderWhole(),
    rules:    renderRules(),
  };

  // Tab 标签对应母语文本
  const nativeTabLabels: Record<Tab, string> = {
    overview: t.pyTabOverview,
    initials: t.pyTabInitials,
    finals:   t.pyTabFinals,
    whole:    t.pyTabWhole,
    rules:    t.pyTabRules,
  };

  const innerContent = (
    <>
      {/* 子 Tab 栏 */}
      <div className="flex flex-wrap border-b border-[#f0f0f0] shrink-0 items-center">
        {tabKeys.map(key => {
          const zh = TAB_LABELS[key];
          return (
            <button
              key={key}
              onClick={() => { setTab(key); setExpanded(null); }}
              className={`
                px-2 py-2 text-[11px] font-medium transition-all duration-150 whitespace-nowrap
                ${tab === key
                  ? "text-[#c41e3a] border-b-2 border-[#c41e3a]"
                  : "text-[#9aa0a6] hover:text-[#1c1917]"
                }
              `}
            >
              {useNativeLang
                ? nativeTabLabels[key]
                : <PhoneticText
                    simplified={zh.s}
                    traditional={zh.t}
                    pinyin={zh.py}
                    script={script}
                    showPhonetic={showPhonetic}
                    phoneticSize="text-[4px]"
                  />
              }
            </button>
          );
        })}
      </div>

      {/* Tab 内容区 */}
      <div className="flex-1 overflow-y-auto">
        {tabContent[tab]}
      </div>
    </>
  );

  if (embedded) {
    return <div className="flex flex-col h-full">{innerContent}</div>;
  }

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}

      <div
        className={`
          fixed left-0 top-0 h-full w-72 bg-white z-50 flex flex-col
          shadow-[4px_0_32px_rgba(0,0,0,0.10)]
          transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          ${open ? "translate-x-0" : "-translate-x-full"}
        `}
      >
        <div className="flex items-center justify-between px-4 py-3.5 border-b border-[#f0f0f0] shrink-0">
          <span className="text-sm font-semibold text-[#1c1917]">{isZhuyin ? (t.bpTitle || "Bopomofo Guide") : t.pyTitle}</span>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f4f4f4] text-[#9aa0a6] transition-colors"
          >
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M1 1l10 10M11 1L1 11" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {innerContent}
      </div>
    </>
  );
}
