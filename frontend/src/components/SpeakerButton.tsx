import { useState, useCallback, useRef } from "react";

interface Props {
  text: string;
  lang: string;
  rate?: number;
  size?: "sm" | "md";
}

export default function SpeakerButton({ text, lang, rate = 1, size = "md" }: Props) {
  const [speaking, setSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objUrlRef = useRef<string | null>(null);

  const handleClick = useCallback(async () => {
    // 正在播放时点击 → 停止
    if (speaking) {
      audioRef.current?.pause();
      setSpeaking(false);
      return;
    }

    // 释放上次的 blob URL
    if (objUrlRef.current) {
      URL.revokeObjectURL(objUrlRef.current);
      objUrlRef.current = null;
    }

    setSpeaking(true);
    try {
      const url = `/api/tts?text=${encodeURIComponent(text)}&lang=${encodeURIComponent(lang)}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`TTS error: ${res.status}`);

      const blob = await res.blob();
      const objUrl = URL.createObjectURL(blob);
      objUrlRef.current = objUrl;

      const audio = new Audio(objUrl);
      audio.playbackRate = rate;
      audioRef.current = audio;

      audio.onended = () => {
        setSpeaking(false);
        URL.revokeObjectURL(objUrl);
        objUrlRef.current = null;
      };
      audio.onerror = () => setSpeaking(false);

      await audio.play();
    } catch {
      setSpeaking(false);
    }
  }, [text, lang, rate, speaking]);

  const isSm = size === "sm";
  const btnCls = isSm ? "w-7 h-7" : "w-9 h-9";
  const iconCls = isSm ? "w-3.5 h-3.5" : "w-[18px] h-[18px]";

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      {speaking && (
        <span className="absolute inset-0 rounded-full bg-[#c41e3a] animate-ping opacity-[0.15]" />
      )}
      <button
        onClick={handleClick}
        title={speaking ? "Stop" : "Listen"}
        className={`
          relative ${btnCls} rounded-full flex items-center justify-center
          transition-all duration-200
          ${speaking
            ? "bg-[#c41e3a] text-white shadow-[0_0_0_3px_rgba(196,30,58,0.12)]"
            : "bg-transparent border border-[#e0e0e0] text-[#b0b7bf] hover:border-[#c41e3a] hover:text-[#c41e3a] hover:bg-[#fef5f6]"
          }
        `}
      >
        <svg
          className={iconCls}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={isSm ? 2.5 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
          <path d="M15.54 8.46a5 5 0 0 1 0 7.07" style={{ opacity: speaking ? 1 : 0.6 }} />
          {speaking && <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />}
        </svg>
      </button>
    </div>
  );
}
