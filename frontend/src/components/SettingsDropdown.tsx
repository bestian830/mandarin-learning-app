// 右上角设置下拉：Profile 入口 + 语言切换 + 登录/登出
import { useState, useRef, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LANGUAGES, type Lang, type ScriptMode, type Strings } from "../i18n";
import { useUserStore } from "../store/user";

interface Props {
  lang: Lang;
  onLangChange: (lang: Lang) => void;
  script: ScriptMode;
  onScriptChange: (s: ScriptMode) => void;
  t: Strings;
}

export default function SettingsDropdown({ lang, onLangChange, script, onScriptChange, t }: Props) {
  const user = useUserStore(s => s.user);
  const signOut = useUserStore(s => s.signOut);
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [langOpen, setLangOpen] = useState(false);
  const [scriptOpen, setScriptOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setLangOpen(false);
        setScriptOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open]);

  const currentLang = LANGUAGES.find(l => l.code === lang);

  const handleSignOut = async () => {
    await signOut();
    setOpen(false);
    navigate("/", { replace: true });
  };

  return (
    <div ref={ref} className="relative">
      {/* 触发按钮 */}
      <button
        onClick={() => { setOpen(v => !v); setLangOpen(false); }}
        className={`w-9 h-9 flex items-center justify-center rounded-full border transition-all duration-150
          ${open
            ? "border-[#c41e3a] bg-[#fef5f6] text-[#c41e3a]"
            : "border-[#e4e4e4] bg-white text-[#6b7280] hover:border-[#c41e3a] hover:text-[#c41e3a]"
          }`}
        title={t.navSettings}
      >
        {user ? (
          // 已登录：显示头像首字母
          <span className="text-xs font-bold">
            {(user.name ?? user.email).slice(0, 1).toUpperCase()}
          </span>
        ) : (
          // 未登录：齿轮图标
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        )}
      </button>

      {/* 下拉面板 */}
      {open && (
        <div className="absolute top-full right-0 mt-2 w-56 rounded-2xl bg-white border border-[#ebebeb] shadow-[0_8px_32px_rgba(0,0,0,0.12)] z-50 overflow-hidden">
          {/* 用户信息 / 登录入口 */}
          {user ? (
            <Link
              to="/profile"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-3.5 hover:bg-[#fafaf8] transition-colors border-b border-[#f0f0f0]"
            >
              <div className="w-9 h-9 rounded-full bg-[#c41e3a] flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                {user.image
                  ? <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
                  : (user.name ?? user.email).slice(0, 1).toUpperCase()
                }
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#1c1917] truncate">{user.name ?? "User"}</div>
                <div className="text-[11px] text-[#9aa0a6] truncate">{user.email}</div>
              </div>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="text-[#c0c7cf] flex-shrink-0">
                <path d="M5 3L9 7L5 11" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ) : (
            <div className="px-4 py-3 border-b border-[#f0f0f0]">
              <Link
                to="/auth/login"
                onClick={() => setOpen(false)}
                className="block w-full text-center py-2 rounded-xl bg-[#c41e3a] text-white text-sm font-semibold
                  hover:bg-[#a31830] transition-colors"
              >
                {t.authSignIn}
              </Link>
              <div className="text-center mt-2">
                <Link
                  to="/auth/register"
                  onClick={() => setOpen(false)}
                  className="text-[11px] text-[#9aa0a6] hover:text-[#c41e3a] transition-colors"
                >
                  {t.authNoAccount} {t.authRegister}
                </Link>
              </div>
            </div>
          )}

          {/* 语言切换 */}
          <div className="border-b border-[#f0f0f0]">
            <button
              onClick={() => setLangOpen(v => !v)}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#fafaf8] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
                </svg>
                <span className="text-sm text-[#1c1917]">{currentLang?.native}</span>
              </div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                className={`text-[#9aa0a6] transition-transform duration-150 ${langOpen ? "rotate-180" : ""}`}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {/* 语言列表 */}
            {langOpen && (
              <div className="max-h-48 overflow-y-auto bg-[#fafaf8]">
                {LANGUAGES.map(l => (
                  <button
                    key={l.code}
                    onClick={() => { onLangChange(l.code); setLangOpen(false); }}
                    className={`w-full text-left px-8 py-2 text-xs transition-colors
                      ${l.code === lang
                        ? "text-[#c41e3a] font-medium bg-[#fef5f6]"
                        : "text-[#1c1917] hover:bg-white"
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

          {/* 简繁体切换 */}
          <div className="border-b border-[#f0f0f0]">
            <button
              onClick={() => { setScriptOpen(v => !v); setLangOpen(false); }}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#fafaf8] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 5h12M9 3v2M5.5 5a7.5 7.5 0 0 0 6 8"/>
                  <path d="M8 5a7.5 7.5 0 0 1-1.5 8"/>
                  <path d="M14 17l3-6 3 6M15 15h4"/>
                </svg>
                <span className="text-sm text-[#1c1917]">
                  {script === "simplified" ? t.scriptSimplified : t.scriptTraditional}
                </span>
              </div>
              <svg width="10" height="10" viewBox="0 0 10 10" fill="none"
                className={`text-[#9aa0a6] transition-transform duration-150 ${scriptOpen ? "rotate-180" : ""}`}>
                <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            {scriptOpen && (
              <div className="bg-[#fafaf8]">
                {([
                  { value: "simplified" as ScriptMode, label: t.scriptSimplified },
                  { value: "traditional" as ScriptMode, label: t.scriptTraditional },
                ]).map(opt => (
                  <button
                    key={opt.value}
                    onClick={() => { onScriptChange(opt.value); setScriptOpen(false); }}
                    className={`w-full text-left px-8 py-2 text-xs transition-colors
                      ${opt.value === script
                        ? "text-[#c41e3a] font-medium bg-[#fef5f6]"
                        : "text-[#1c1917] hover:bg-white"
                      }`}
                  >
                    <span className="flex items-center justify-between">
                      {opt.label}
                      {opt.value === script && (
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

          {/* 登出 */}
          {user && (
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-[#6b7280] hover:text-[#c41e3a] hover:bg-[#fafaf8] transition-colors"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                <polyline points="16 17 21 12 16 7"/>
                <line x1="21" y1="12" x2="9" y2="12"/>
              </svg>
              {t.profileSignOut}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
