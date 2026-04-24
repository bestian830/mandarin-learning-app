// Onboarding 向导：3 步完成用户档案初始化
// Step 0: native language（必填，无默认；选中后切换 i18n 语言渲染后续步骤）
// Step 1: HSK level（可选，Skip 跳到 Goal）
// Step 2: learning goal 多选标签（可选，Skip 或 Get Started 均可提交）
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import { onboard } from "../api/auth";
import { useUserStore } from "../store/user";
import {
  EN_STRINGS, LANGUAGES, loadTranslations, saveLang, type Lang, type Strings,
} from "../i18n";

// Goal 选项：key 用于后端存储，labelKey 用于 i18n 渲染
const GOAL_OPTIONS: { key: string; labelKey: keyof Strings }[] = [
  { key: "study",        labelKey: "goalStudy" },
  { key: "work",         labelKey: "goalWork" },
  { key: "conversation", labelKey: "goalConversation" },
  { key: "travel",       labelKey: "goalTravel" },
  { key: "culture",      labelKey: "goalCulture" },
  { key: "exam",         labelKey: "goalExam" },
  { key: "family",       labelKey: "goalFamily" },
];

// ─── Step 0：母语选择（必填）─────────────────────────────
function StepLang({
  value, onChange, t,
}: { value: Lang | ""; onChange: (v: Lang) => void; t: Strings }) {
  const [search, setSearch] = useState("");
  const filtered = LANGUAGES.filter(
    (l) => l.native.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917]">{t.onbNativeTitle}</h2>
        <p className="text-sm text-[#6b7280] mt-1">{t.onbNativeSubtitle}</p>
      </div>
      <input
        type="text"
        placeholder={t.onbNativeSearch}
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="w-full rounded-xl border border-[#e5e5e5] px-3.5 py-2.5 text-sm
          outline-none focus:border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/10"
      />
      <div className="flex flex-col gap-1 max-h-64 overflow-y-auto">
        {filtered.map((l) => (
          <button
            key={l.code}
            type="button"
            onClick={() => onChange(l.code)}
            className={`text-left px-3.5 py-2.5 rounded-xl text-sm transition-colors cursor-pointer
              ${value === l.code
                ? "bg-[#c41e3a] text-white font-medium"
                : "hover:bg-[#f5f5f4] text-[#1c1917]"
              }`}
          >
            {l.native}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 1：HSK 等级（可选）────────────────────────────
function StepHSK({
  value, onChange, t,
}: { value: number; onChange: (v: number) => void; t: Strings }) {
  const levels = [
    { value: 0, label: t.onbHskBeginner },
    { value: 1, label: t.onbHskLevel1 },
    { value: 2, label: t.onbHskLevel2 },
    { value: 3, label: t.onbHskLevel3 },
    { value: 4, label: t.onbHskLevel4 },
    { value: 5, label: t.onbHskLevel5 },
    { value: 6, label: t.onbHskLevel6 },
  ];

  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-lg font-semibold text-[#1c1917]">{t.onbHskTitle}</h2>
      <div className="flex flex-col gap-2">
        {levels.map((l) => (
          <button
            key={l.value}
            type="button"
            onClick={() => onChange(l.value)}
            className={`text-left px-4 py-3 rounded-xl text-sm font-medium border transition-colors cursor-pointer
              ${value === l.value
                ? "bg-[#c41e3a] text-white border-[#c41e3a]"
                : "bg-white border-[#e5e5e5] text-[#1c1917] hover:border-[#c41e3a]/40"
              }`}
          >
            {l.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Step 2：学习目标（多选标签，可选）──────────────────
function StepGoal({
  value, onChange, t,
}: { value: string[]; onChange: (v: string[]) => void; t: Strings }) {
  function toggle(key: string) {
    if (value.includes(key)) {
      onChange(value.filter((k) => k !== key));
    } else {
      onChange([...value, key]);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h2 className="text-lg font-semibold text-[#1c1917]">{t.onbGoalTitle}</h2>
        <p className="text-sm text-[#6b7280] mt-1">{t.onbGoalSubtitle}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {GOAL_OPTIONS.map((opt) => (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            className={`px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors cursor-pointer
              ${value.includes(opt.key)
                ? "bg-[#c41e3a] text-white border-[#c41e3a]"
                : "bg-white border-[#e5e5e5] text-[#1c1917] hover:border-[#c41e3a]/40"
              }`}
          >
            {t[opt.labelKey]}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── 主组件 ─────────────────────────────────────────────

export default function OnboardingPage() {
  const navigate = useNavigate();
  const setOnboarded = useUserStore((s) => s.setOnboarded);

  const [step, setStep] = useState(0);
  const [lang, setLang] = useState<Lang | "">(""); // 空字符串表示未选择（必填）
  const [hsk, setHsk] = useState(0);
  const [goals, setGoals] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // i18n：初始英文，用户选定母语后切换
  const [t, setT] = useState<Strings>(EN_STRINGS);
  useEffect(() => {
    if (!lang) return;
    loadTranslations(lang).then(setT);
  }, [lang]);

  const totalSteps = 3;

  // 各步骤 Continue 按钮启用条件（Get Started/Skip 始终可点）
  function canContinue() {
    if (step === 0) return !!lang;
    return true;
  }

  // 处理"继续"（含最终提交）
  async function handleContinue() {
    if (step < totalSteps - 1) {
      setStep(step + 1);
      return;
    }
    await submit();
  }

  // 处理"跳过当前步骤"
  async function handleSkipStep() {
    // 第一步不允许跳过（母语必填，UI 层也会隐藏按钮，这里做双保险）
    if (step === 0) return;
    // 最后一步跳过 = 提交（保留已填字段，未填的走默认值）
    if (step === totalSteps - 1) {
      await submit();
      return;
    }
    setStep(step + 1);
  }

  // 最终提交
  async function submit() {
    if (!lang) return; // 理论上不会走到这里
    setLoading(true);
    setError("");
    try {
      await onboard({
        nativeLanguage: lang,
        hskLevelSelf: hsk,
        learningGoals: goals,
      });
      // 持久化 UI 语言选择，让 Home 等页面也用同一语言
      saveLang(lang);
      setOnboarded(true);
      navigate("/", { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Onboarding failed, please try again");
    } finally {
      setLoading(false);
    }
  }

  // 进度/按钮文案（模板字符串 {cur}/{total} 替换）
  const stepText = t.onbStepOf
    .replace("{cur}", String(step + 1))
    .replace("{total}", String(totalSteps));

  return (
    <div className="min-h-screen bg-[#fafaf8] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="bg-[#c41e3a] w-9 h-9 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold" style={{ fontFamily: "'Playfair Display', serif" }}>文</span>
          </div>
        </div>

        {/* 进度条 */}
        <div className="flex gap-1.5 mb-6">
          {Array.from({ length: totalSteps }).map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors ${
                i <= step ? "bg-[#c41e3a]" : "bg-[#e5e5e5]"
              }`}
            />
          ))}
        </div>
        <p className="text-xs text-[#9aa0a6] mb-6">{stepText}</p>

        {/* 步骤内容 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 shadow-sm mb-4 min-h-[320px]">
          {step === 0 && <StepLang value={lang} onChange={setLang} t={t} />}
          {step === 1 && <StepHSK value={hsk} onChange={setHsk} t={t} />}
          {step === 2 && <StepGoal value={goals} onChange={setGoals} t={t} />}
        </div>

        {error && <p className="text-sm text-[#c41e3a] mb-3">{error}</p>}

        <div className="flex gap-3">
          {step > 0 && (
            <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
              ← {t.onbBack}
            </Button>
          )}
          <Button
            onClick={handleContinue}
            disabled={!canContinue()}
            loading={loading}
            className="flex-1"
          >
            {step === totalSteps - 1 ? `${t.onbGetStarted} →` : `${t.onbContinue} →`}
          </Button>
        </div>

        {/* Skip：第一步不显示（母语必填）；其余步骤显示 */}
        {step > 0 && (
          <button
            type="button"
            onClick={handleSkipStep}
            className="w-full text-center text-sm text-[#9aa0a6] hover:text-[#6b7280] mt-4 cursor-pointer"
          >
            {t.onbSkipStep}
          </button>
        )}
      </div>
    </div>
  );
}
