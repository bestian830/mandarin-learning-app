// 单词本：多卡组管理（卡组列表 + 卡组详情）
// embedded=true 时嵌入 ToolsSidebar，不渲染自己的遮罩和外壳

import { useState, useCallback, useEffect, useRef } from "react";
import type { FlashCard, Deck } from "../types/index";
import type { Strings, Lang, ScriptMode } from "../i18n";
import { useFlashcards, type FlashcardsBackend } from "../lib/useFlashcards";
import SpeakerButton from "./SpeakerButton";
import { pinyinToBopomofo } from "../data/pinyin";

// 内联备注编辑器：点击显示输入框，失焦或回车保存
function NoteEditor({ card, deckId, fc, onUpdate }: {
  card: FlashCard;
  deckId: string;
  fc: FlashcardsBackend;
  onUpdate: (note: string) => void;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(card.note ?? "");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) inputRef.current?.focus();
  }, [editing]);

  const save = useCallback(async () => {
    setEditing(false);
    const trimmed = value.trim();
    if (trimmed === (card.note ?? "")) return;
    onUpdate(trimmed);
    try {
      await fc.updateNote(card.id, deckId, trimmed);
    } catch (err) {
      console.error("[NoteEditor] save failed", err);
    }
  }, [value, card.id, card.note, deckId, fc, onUpdate]);

  if (editing) {
    return (
      <input
        ref={inputRef}
        type="text"
        value={value}
        onChange={e => setValue(e.target.value)}
        onBlur={save}
        onKeyDown={e => { if (e.key === "Enter") save(); if (e.key === "Escape") setEditing(false); }}
        className="w-full text-[11px] text-[#78716c] leading-snug mt-1.5 px-1.5 py-1 rounded border border-[#e0e0e0] bg-[#fafaf8]
          focus:outline-none focus:border-[#c41e3a] transition-colors"
        placeholder="Add a note..."
      />
    );
  }

  return (
    <p
      onClick={() => setEditing(true)}
      className={`text-[11px] leading-snug mt-1.5 cursor-text rounded px-1 -mx-1 hover:bg-[#f5f5f5] transition-colors min-h-[1.2rem]
        ${card.note ? "text-[#78716c]" : "text-[#c4c4c4] italic"}`}
    >
      {card.note || "Add a note..."}
    </p>
  );
}

interface Props {
  open: boolean;
  onClose: () => void;
  onStartReview: (cards: FlashCard[]) => void;
  lang: Lang;
  script?: ScriptMode;
  t: Strings;
  refreshKey: number;
  embedded?: boolean;       // 嵌入 ToolsSidebar 时为 true
  requireLogin?: boolean;   // 未登录时显示登录提示
  onRequireLogin?: () => void;
  showPhonetic?: boolean;   // 是否显示拼音/注音标注
}

export default function WordBook({ open, onClose, onStartReview, lang, script = "simplified", t, refreshKey, embedded, requireLogin, onRequireLogin, showPhonetic = true }: Props) {
  const fc = useFlashcards();

  // null = 卡组列表视图，string = 卡组详情视图
  const [currentDeckId, setCurrentDeckId] = useState<string | null>(null);
  const [decks, setDecks] = useState<Deck[]>([]);
  const [deckStats, setDeckStats] = useState<Record<string, { total: number; dueToday: number }>>({});
  const [loadingDecks, setLoadingDecks] = useState(false);

  // 卡组详情内的 state
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [addInput, setAddInput] = useState("");
  const [adding, setAdding] = useState(false);
  const [addError, setAddError] = useState("");

  // 新建卡组 state
  const [newDeckInput, setNewDeckInput] = useState("");
  const [creatingDeck, setCreatingDeck] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const newDeckRef = useRef<HTMLInputElement>(null);

  // 加载卡组列表数据
  const reloadDecks = useCallback(async () => {
    setLoadingDecks(true);
    try {
      // 云端版会发 GET /api/decks 并填充缓存；本地版是 no-op
      await fc.reload();
    } catch (err) {
      console.error("[WordBook] reload decks failed", err);
    }
    try {
      const res = await fetch("/api/words/overrides");
      if (res.ok) {
        const list: Array<{ word: string; pinyin_override: string }> = await res.json();
        const map: Record<string, string> = {};
        for (const r of list) map[r.word] = r.pinyin_override;
        fc.applyPinyinOverrides(map);
      }
    } catch { /* 网络失败不影响展示 */ }
    const allDecks = fc.getDecks();
    setDecks(allDecks);
    const stats: Record<string, { total: number; dueToday: number }> = {};
    for (const d of allDecks) stats[d.id] = { total: fc.getAll(d.id).length, dueToday: 0 };
    setDeckStats(stats);
    setLoadingDecks(false);
  }, [fc]);

  // 加载某卡组内的词汇（缓存已由 reloadDecks 填充，这里只读）
  const reloadCards = useCallback((deckId: string) => {
    setCards(fc.getAll(deckId));
  }, [fc]);

  // 视图切换或 refreshKey 变化时刷新
  useEffect(() => {
    if (currentDeckId === null) {
      reloadDecks();
    } else {
      reloadCards(currentDeckId);
    }
  }, [currentDeckId, refreshKey, reloadDecks, reloadCards]);

  // 打开侧边栏时聚焦
  useEffect(() => {
    if (!open) return;
    if (currentDeckId === null) {
      setTimeout(() => newDeckRef.current?.focus(), 300);
    } else {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [open, currentDeckId]);

  // 进入卡组详情
  const enterDeck = useCallback((id: string) => {
    fc.setActiveDeckId(id);
    setCurrentDeckId(id);
  }, [fc]);

  // 返回卡组列表
  const backToList = useCallback(() => {
    setCurrentDeckId(null);
    setAddInput("");
    setAddError("");
  }, []);

  // 新建卡组
  const handleCreateDeck = useCallback(async () => {
    const name = newDeckInput.trim();
    if (!name || creatingDeck) return;
    setCreatingDeck(true);
    try {
      const deck = await fc.createDeck(name);
      setNewDeckInput("");
      enterDeck(deck.id);
    } catch (err) {
      console.error("[WordBook] create deck failed", err);
    } finally {
      setCreatingDeck(false);
    }
  }, [newDeckInput, creatingDeck, enterDeck, fc]);

  // 删除卡组
  const handleDeleteDeck = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await fc.deleteDeck(id);
    } catch (err) {
      console.error("[WordBook] delete deck failed", err);
    }
    await reloadDecks();
  }, [reloadDecks, fc]);

  // 删除词汇
  const handleRemove = useCallback(async (cardId: string) => {
    if (!currentDeckId) return;
    try {
      await fc.remove(cardId, currentDeckId);
    } catch (err) {
      console.error("[WordBook] remove card failed", err);
      return;
    }
    reloadCards(currentDeckId);
    setDeckStats(prev => ({
      ...prev,
      [currentDeckId]: { total: fc.getAll(currentDeckId).length, dueToday: 0 },
    }));
  }, [currentDeckId, reloadCards, fc]);

  // 手动添加词汇到当前卡组（只允许中文字符）
  const handleManualAdd = useCallback(async () => {
    if (!currentDeckId) return;
    const word = addInput.trim();
    if (!word || adding) return;

    // 只允许中文字符（简体+繁体），拒绝拼音、英文等
    const chineseOnly = /^[\u4e00-\u9fff\u3400-\u4dbf\uf900-\ufaff]+$/;
    if (!chineseOnly.test(word)) {
      setAddError(t.wbChineseOnly || "Please enter Chinese characters only");
      return;
    }

    if (fc.exists(word)) {
      setAddError(t.wbAlreadySaved || "Already saved");
      return;
    }
    setAdding(true);
    setAddError("");
    try {
      // 调用搜索 API 获取拼音/繁体，同时会在词库中记录查询次数
      const searchRes = await fetch("/api/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: word }),
      });
      const searchData = await searchRes.json();

      // 拼接所有分词的拼音（排除标点）
      const fullPinyin = (searchData.segments ?? [])
        .filter((s: any) => s.category !== "punct")
        .map((s: any) => s.pinyin)
        .filter(Boolean)
        .join(" ");

      await fc.add({
        word: searchData.simplified || word,
        traditional: searchData.traditional || word,
        pinyin: fullPinyin || searchData.pinyin || "",
        pos: searchData.segments?.length === 1 ? searchData.segments[0].category : "other",
        meaning: "",
      }, currentDeckId);
      setAddInput("");
      reloadCards(currentDeckId);
    } catch {
      setAddError("Failed to add word");
    } finally {
      setAdding(false);
    }
  }, [addInput, adding, t, currentDeckId, reloadCards, fc]);

  // box 等级指示色
  const boxColor = (box: number) => {
    const colors = ["", "#ef5350", "#ff9800", "#ffc107", "#66bb6a", "#43a047"];
    return colors[box] || "#e0e0e0";
  };

  const currentDeck = decks.find(d => d.id === currentDeckId);

  // 未登录提示
  if (embedded && requireLogin) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-[#b0b7bf] px-6">
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 opacity-40">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
          <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
        </svg>
        <span className="text-sm text-[#6b7280] text-center mb-3">{t.loginToSave}</span>
        <button
          onClick={onRequireLogin}
          className="px-4 py-2 rounded-xl bg-[#c41e3a] text-white text-sm font-semibold hover:bg-[#a31830] transition-colors"
        >
          {t.authSignIn}
        </button>
      </div>
    );
  }

  // 内容渲染（embedded 模式不含外壳）
  const content = (
    <>
        {/* ── 卡组列表视图 ── */}
        {currentDeckId === null ? (
          <>

            {/* 卡组列表 */}
            <div className="flex-1 overflow-y-auto">
              {loadingDecks && decks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#b0b7bf]">
                  <div className="w-6 h-6 rounded-full border-2 border-[#e0e0e0] border-t-[#c41e3a] animate-spin" />
                </div>
              ) : decks.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#b0b7bf]">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-3 opacity-50">
                    <rect x="4" y="3" width="24" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 10H22M10 15H22M10 20H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs">{t.wbEmpty || "No decks yet"}</span>
                </div>
              ) : (
                <div>
                  {decks.map(deck => {
                    const stat = deckStats[deck.id] ?? { total: 0, dueToday: 0 };
                    return (
                      <button
                        key={deck.id}
                        onClick={() => enterDeck(deck.id)}
                        className="w-full px-5 py-3.5 border-b border-[#f8f8f8] hover:bg-[#fafaf8]
                          transition-colors text-left flex items-center gap-3 group"
                      >
                        {/* 卡组信息 */}
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold text-[#1c1917] truncate">{deck.name}</div>
                          <div className="text-[11px] text-[#9aa0a6] mt-0.5">
                            {stat.total} {t.wbWords || "words"}
                          </div>
                        </div>

                        {/* 删除 + 右箭头 */}
                        <div className="flex items-center gap-1 flex-shrink-0">
                          {!deck.isDefault && (
                          <button
                            onClick={(e) => handleDeleteDeck(deck.id, e)}
                            className="w-6 h-6 flex items-center justify-center rounded-full
                              opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all duration-150"
                            title="Delete deck"
                          >
                            <svg width="11" height="11" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3H10M4.5 3V2C4.5 1.45 4.95 1 5.5 1H6.5C7.05 1 7.5 1.45 7.5 2V3M5 5.5V8.5M7 5.5V8.5M3 3L3.5 10C3.5 10.55 3.95 11 4.5 11H7.5C8.05 11 8.5 10.55 8.5 10L9 3"
                                stroke="#ef5350" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                          )}
                          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#c0c7cf]">
                            <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                          </svg>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 底部：新建卡组 */}
            <div className="px-5 py-3 border-t border-[#f0f0f0] flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={newDeckRef}
                  type="text"
                  value={newDeckInput}
                  onChange={e => setNewDeckInput(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleCreateDeck()}
                  placeholder={t.wbNewDeckPlaceholder || "New deck name..."}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] bg-[#fafaf8]
                    focus:outline-none focus:border-[#c41e3a] transition-colors placeholder:text-[#c4c4c4]"
                />
                <button
                  onClick={handleCreateDeck}
                  disabled={!newDeckInput.trim() || creatingDeck}
                  className="px-3 py-2 rounded-lg bg-[#c41e3a] text-white text-sm font-medium
                    hover:bg-[#a31830] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                  </svg>
                </button>
              </div>
            </div>
          </>
        ) : (
          /* ── 卡组详情视图 ── */
          <>
            {/* 头部：返回 + 卡组名 + 关闭 */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] flex-shrink-0">
              <div className="flex items-center gap-2 min-w-0">
                <button
                  onClick={backToList}
                  className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 3L5 7L9 11" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </button>
                <div className="min-w-0">
                  <h2 className="text-sm font-bold text-[#1c1917] truncate">{currentDeck?.name}</h2>
                  <p className="text-[11px] text-[#9aa0a6] mt-0.5">
                    {cards.length} {t.wbWords || "words"}
                  </p>
                </div>
              </div>
              {!embedded && (
                <button
                  onClick={onClose}
                  className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors flex-shrink-0"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M2 2L12 12M12 2L2 12" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round"/>
                  </svg>
                </button>
              )}
            </div>

            {/* 复习按钮：有卡就显示 */}
            {cards.length > 0 && (
              <div className="px-5 py-3 border-b border-[#f0f0f0] flex-shrink-0">
                <button
                  onClick={() => onStartReview(cards)}
                  className="w-full py-2.5 rounded-xl bg-[#c41e3a] text-white text-sm font-semibold
                    hover:bg-[#a31830] transition-colors duration-150 flex items-center justify-center gap-2"
                >
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M3 1.5L11.5 7L3 12.5V1.5Z" fill="currentColor"/>
                  </svg>
                  {t.wbStartReview || "Start Review"}
                </button>
              </div>
            )}

            {/* 词汇列表 */}
            <div className="flex-1 overflow-y-auto">
              {cards.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-48 text-[#b0b7bf]">
                  <svg width="32" height="32" viewBox="0 0 32 32" fill="none" className="mb-3 opacity-50">
                    <rect x="4" y="3" width="24" height="26" rx="3" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M10 10H22M10 15H22M10 20H18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  <span className="text-xs">{t.wbEmpty || "No words saved yet"}</span>
                </div>
              ) : (
                <div>
                  {cards.map(card => (
                    <div
                      key={card.id}
                      className="px-5 py-3 border-b border-[#f8f8f8] hover:bg-[#fafaf8] transition-colors group"
                    >
                      <div className="flex items-start gap-3">
                        {/* Box 等级色点 */}
                        <span
                          className="w-1.5 h-1.5 rounded-full flex-shrink-0 mt-2"
                          style={{ backgroundColor: boxColor(card.box) }}
                          title={`Box ${card.box}`}
                        />

                        {/* 中央内容 */}
                        <div className="min-w-0 flex-1">
                          <div className="flex gap-2 flex-wrap">
                            {[...(script === "traditional" ? (card.traditional || card.word) : card.word)].map((char, i) => {
                              const syllables = card.pinyin.split(/\s+/);
                              const py = syllables[i] || "";
                              return (
                                <div key={i} className="flex flex-col items-center">
                                  <span className="chinese text-[1.05rem] font-bold text-[#1c1917] leading-tight"
                                    lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>
                                    {char}
                                  </span>
                                  {showPhonetic && (
                                    <span className="text-[9px] text-[#4285f4] leading-none mt-0.5 whitespace-nowrap">
                                      {script === "traditional" ? pinyinToBopomofo(py) : py}
                                    </span>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                          <NoteEditor
                            card={card}
                            deckId={currentDeckId!}
                            fc={fc}
                            onUpdate={(note) => {
                              setCards(prev => prev.map(c => c.id === card.id ? { ...c, note } : c));
                            }}
                          />
                        </div>

                        {/* 右侧操作按钮 */}
                        <div className="flex items-center gap-0.5 flex-shrink-0">
                          <SpeakerButton text={card.word} lang="zh-CN" rate={1} size="sm" />
                          <button
                            onClick={() => handleRemove(card.id)}
                            className="w-7 h-7 flex items-center justify-center rounded-full
                              opacity-0 group-hover:opacity-100 hover:bg-red-50 transition-all duration-150"
                            title={t.wbRemove || "Remove"}
                          >
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                              <path d="M2 3H10M4.5 3V2C4.5 1.45 4.95 1 5.5 1H6.5C7.05 1 7.5 1.45 7.5 2V3M5 5.5V8.5M7 5.5V8.5M3 3L3.5 10C3.5 10.55 3.95 11 4.5 11H7.5C8.05 11 8.5 10.55 8.5 10L9 3"
                                stroke="#ef5350" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 底部：手动添加 */}
            <div className="px-5 py-3 border-t border-[#f0f0f0] flex-shrink-0">
              <div className="flex gap-2">
                <input
                  ref={inputRef}
                  type="text"
                  value={addInput}
                  onChange={e => { setAddInput(e.target.value); setAddError(""); }}
                  onKeyDown={e => e.key === "Enter" && handleManualAdd()}
                  placeholder={t.wbAddPlaceholder || "Type Chinese word..."}
                  className="flex-1 px-3 py-2 text-sm rounded-lg border border-[#e0e0e0] bg-[#fafaf8]
                    focus:outline-none focus:border-[#c41e3a] transition-colors placeholder:text-[#c4c4c4]"
                />
                <button
                  onClick={handleManualAdd}
                  disabled={!addInput.trim() || adding}
                  className="px-3 py-2 rounded-lg bg-[#c41e3a] text-white text-sm font-medium
                    hover:bg-[#a31830] disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
                >
                  {adding ? (
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  ) : (
                    <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                      <path d="M7 2V12M2 7H12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                    </svg>
                  )}
                </button>
              </div>
              {addError && (
                <p className="text-[11px] text-red-500 mt-1">{addError}</p>
              )}
            </div>
          </>
        )}
    </>
  );

  // 嵌入模式：直接返回内容
  if (embedded) {
    return <div className="flex flex-col h-full">{content}</div>;
  }

  // 独立模式：带遮罩和滑动面板
  return (
    <>
      {open && (
        <div
          className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-300"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-[340px] max-w-[85vw] bg-white shadow-2xl z-50
          transform transition-transform duration-300 ease-[cubic-bezier(0.4,0,0.2,1)]
          flex flex-col
          ${open ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* 头部（独立模式才显示） */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-[#f0f0f0] flex-shrink-0">
          <h2 className="text-sm font-bold text-[#1c1917]">{t.wbTitle || "Word Book"}</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-[#f5f5f5] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 2L12 12M12 2L2 12" stroke="#9aa0a6" strokeWidth="1.8" strokeLinecap="round"/>
            </svg>
          </button>
        </div>
        {content}
      </div>
    </>
  );
}
