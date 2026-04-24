// 通用输入框：支持 label、错误状态
import type { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export default function Input({ label, error, className = "", id, ...props }: InputProps) {
  const inputId = id ?? label?.toLowerCase().replace(/\s+/g, "-");

  return (
    <div className="flex flex-col gap-1">
      {label && (
        <label htmlFor={inputId} className="text-sm font-medium text-[#374151]">
          {label}
        </label>
      )}
      <input
        id={inputId}
        {...props}
        className={`
          w-full rounded-xl border px-3.5 py-2.5 text-sm
          bg-white text-[#1c1917] placeholder-[#9aa0a6]
          outline-none transition-colors duration-150
          ${error
            ? "border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/20"
            : "border-[#e5e5e5] focus:border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/10"
          }
          disabled:bg-[#f9fafb] disabled:text-[#6b7280]
          ${className}
        `}
      />
      {error && <p className="text-xs text-[#c41e3a]">{error}</p>}
    </div>
  );
}
