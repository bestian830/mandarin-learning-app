import { useState, useRef } from "react";
import type { FormEvent } from "react";

interface Props {
  value: string;
  onChange: (v: string) => void;
  onSearch: (query: string) => void;
  loading: boolean;
  compact?: boolean;
  placeholder?: string;
  onToggleVocab?: () => void;
  vocabOpen?: boolean;
  vocabTitle?: string;
}

// 浏览器支持检测（模块级，只执行一次）
const SpeechRecognitionAPI =
  (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
const speechSupported = !!SpeechRecognitionAPI;

export default function SearchBar({
  value,
  onChange,
  onSearch,
  loading,
  compact = false,
  placeholder = "What's in your thought?",
  onToggleVocab,
  vocabOpen = false,
  vocabTitle,
}: Props) {
  const [listening, setListening] = useState(false);
  const recognitionRef = useRef<any>(null);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (value.trim() && !loading) onSearch(value.trim());
  };

  const toggleMic = () => {
    // 正在听 → 停止
    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
      return;
    }

    const rec = new SpeechRecognitionAPI();
    rec.continuous = false;      // 一句话结束自动停
    rec.interimResults = true;   // 实时显示识别中的文字
    rec.lang = "";               // 跟随浏览器语言设置，支持多语言

    rec.onresult = (e: any) => {
      const transcript = Array.from(e.results as any[])
        .map((r: any) => r[0].transcript)
        .join("");
      const isFinal = (e.results as any)[e.results.length - 1].isFinal;
      onChange(transcript);
      if (isFinal) {
        setListening(false);
      }
    };
    rec.onerror = () => setListening(false);
    rec.onend = () => setListening(false);

    recognitionRef.current = rec;
    rec.start();
    setListening(true);
  };

  const iconSize = compact ? "w-3.5 h-3.5" : "w-4 h-4";

  return (
    <form onSubmit={handleSubmit} className={`w-full ${compact ? "" : "max-w-xl"}`}>
      <div
        className={`search-input flex items-center bg-white border border-[#dfe1e5] rounded-full
          transition-shadow duration-200 hover:shadow-md
          ${compact ? "h-10 px-4 gap-2" : "h-12 px-5 gap-3"}`}
      >
        {/* 放大镜图标 */}
        <svg
          className={`text-[#9aa0a6] flex-shrink-0 ${compact ? "w-4 h-4" : "w-5 h-5"}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>

        {/* 输入框 */}
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className={`flex-1 outline-none bg-transparent text-[#202124] placeholder-[#9aa0a6] ${
            compact ? "text-sm" : "text-base"
          }`}
          disabled={loading}
          autoFocus={!compact}
          aria-label="Search for a Chinese translation"
        />

        {/* 麦克风按钮 */}
        <div className="relative flex-shrink-0">
          {/* 脉冲光圈（仅识别中显示） */}
          {listening && (
            <span className="absolute inset-0 rounded-full bg-[#c41e3a] opacity-30 animate-ping" />
          )}
          <button
            type="button"
            onClick={toggleMic}
            disabled={!speechSupported || loading}
            title={
              !speechSupported
                ? "请使用 Chrome 或 Safari 以使用语音输入"
                : listening
                  ? "点击停止"
                  : "点击语音输入"
            }
            className={`relative flex items-center justify-center rounded-full transition-all duration-150
              ${compact ? "w-6 h-6" : "w-7 h-7"}
              ${!speechSupported || loading
                ? "text-[#d1d5db] cursor-not-allowed"
                : listening
                  ? "bg-[#c41e3a] text-white shadow-[0_0_0_3px_rgba(196,30,58,0.15)]"
                  : "text-[#9aa0a6] hover:text-[#c41e3a]"
              }`}
            aria-label={listening ? "停止语音输入" : "开始语音输入"}
          >
            {listening ? (
              /* 识别中：实心麦克风 */
              <svg className={iconSize} viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 1a4 4 0 0 1 4 4v6a4 4 0 0 1-8 0V5a4 4 0 0 1 4-4z"/>
                <path d="M19 10a1 1 0 0 0-2 0 5 5 0 0 1-10 0 1 1 0 0 0-2 0 7 7 0 0 0 6 6.92V19H9a1 1 0 0 0 0 2h6a1 1 0 0 0 0-2h-2v-2.08A7 7 0 0 0 19 10z"/>
              </svg>
            ) : (
              /* 空闲：描边麦克风 */
              <svg className={iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <rect x="9" y="1" width="6" height="11" rx="3"/>
                <path d="M19 10a7 7 0 0 1-14 0M12 19v4M8 23h8"/>
              </svg>
            )}
          </button>
        </div>

        {/* 词库展开按钮 */}
        {onToggleVocab && (
          <button
            type="button"
            onClick={onToggleVocab}
            title={vocabTitle}
            className={`flex-shrink-0 flex items-center justify-center rounded-full border transition-all duration-150
              ${compact ? "w-6 h-6" : "w-7 h-7"}
              ${vocabOpen
                ? "border-[#c41e3a] bg-[#fef5f6] text-[#c41e3a]"
                : "border-[#e0e0e0] bg-white text-[#9aa0a6] hover:border-[#c41e3a] hover:text-[#c41e3a]"
              }`}
          >
            <svg width={compact ? "9" : "11"} height={compact ? "9" : "11"} viewBox="0 0 10 10" fill="none"
              className={`transition-transform duration-200 ${vocabOpen ? "rotate-180" : ""}`}>
              <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        )}

        {/* 加载/提交按钮 */}
        {loading ? (
          <div
            className={`flex-shrink-0 rounded-full border-2 border-[#c41e3a] border-t-transparent spinner ${
              compact ? "w-4 h-4" : "w-5 h-5"
            }`}
          />
        ) : value.trim() ? (
          <button
            type="submit"
            className={`flex-shrink-0 bg-[#c41e3a] hover:bg-[#a31b31] active:bg-[#8b1728] rounded-full
              flex items-center justify-center transition-colors duration-150 ${
                compact ? "w-6 h-6" : "w-8 h-8"
              }`}
            aria-label="Search"
          >
            <svg
              className={`text-white ${compact ? "w-3 h-3" : "w-4 h-4"}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        ) : null}
      </div>
    </form>
  );
}
