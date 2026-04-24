// 通用按钮：支持 primary / secondary / ghost / danger + loading 态
import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  loading?: boolean;
  fullWidth?: boolean;
}

const variants = {
  primary:   "bg-[#c41e3a] hover:bg-[#a8182f] text-white",
  secondary: "bg-white border border-[#e5e5e5] hover:bg-[#f5f5f4] text-[#1c1917]",
  ghost:     "bg-transparent hover:bg-[#f5f5f4] text-[#6b7280]",
  danger:    "bg-transparent hover:bg-red-50 text-[#c41e3a]",
};

export default function Button({
  variant = "primary",
  loading = false,
  fullWidth = false,
  className = "",
  disabled,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      {...props}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2
        rounded-xl px-4 py-2.5 text-sm font-medium
        transition-colors duration-150 cursor-pointer
        disabled:opacity-50 disabled:cursor-not-allowed
        ${variants[variant]}
        ${fullWidth ? "w-full" : ""}
        ${className}
      `}
    >
      {loading && (
        <span className="w-4 h-4 rounded-full border-2 border-current border-t-transparent animate-spin" />
      )}
      {children}
    </button>
  );
}
