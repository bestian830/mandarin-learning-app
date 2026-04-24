import { useState, useRef, useEffect } from "react";
import { LANGUAGES, type Lang } from "../i18n";

interface Props {
  lang: Lang;
  onChange: (lang: Lang) => void;
}

export default function LangSwitcher({ lang, onChange }: Props) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const current = LANGUAGES.find(l => l.code === lang)!;

  return (
    <div ref={ref} className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => setOpen(v => !v)}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium transition-all duration-150
          ${open
            ? "border-[#c41e3a] bg-[#fef5f6] text-[#c41e3a]"
            : "border-[#e4e4e4] bg-white text-[#6b7280] hover:border-[#c41e3a] hover:text-[#c41e3a]"
          }`}
      >
        {/* 地球图标 */}
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"/>
          <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
        </svg>
        {current.native}
        <svg
          width="10" height="10" viewBox="0 0 10 10" fill="none"
          className={`transition-transform duration-150 ${open ? "rotate-180" : ""}`}
        >
          <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      {/* 下拉列表 */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-40 max-h-72 overflow-y-auto rounded-xl bg-white border border-[#ebebeb] shadow-[0_4px_20px_rgba(0,0,0,0.1)] z-50">
          {LANGUAGES.map(l => (
            <button
              key={l.code}
              onClick={() => { onChange(l.code); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs transition-colors duration-100
                ${l.code === lang
                  ? "bg-[#fef5f6] text-[#c41e3a] font-medium"
                  : "text-[#1c1917] hover:bg-[#fafafa]"
                }`}
            >
              <span className="flex items-center justify-between">
                {l.native}
                {l.code === lang && (
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M1.5 5L4 7.5L8.5 2.5" stroke="#c41e3a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                )}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
