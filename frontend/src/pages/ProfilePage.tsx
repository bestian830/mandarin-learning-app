// 个人档案页：修改学习设置 + 账号管理
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import { getStudentCore, patchStudentCore, patchName, type StudentCore } from "../api/auth";
import { useUserStore } from "../store/user";
import {
  EN_STRINGS, LANGUAGES, loadTranslations, saveLang, type Lang, type Strings,
} from "../i18n";

// Goal 选项与 OnboardingPage 保持一致（key 存库，labelKey 渲染）
const GOAL_OPTIONS: { key: string; labelKey: keyof Strings }[] = [
  { key: "study",        labelKey: "goalStudy" },
  { key: "work",         labelKey: "goalWork" },
  { key: "conversation", labelKey: "goalConversation" },
  { key: "travel",       labelKey: "goalTravel" },
  { key: "culture",      labelKey: "goalCulture" },
  { key: "exam",         labelKey: "goalExam" },
  { key: "family",       labelKey: "goalFamily" },
];

export default function ProfilePage() {
  const navigate = useNavigate();
  // 分成独立选择器：Zustand v5 要求 selector 返回稳定引用，返回新对象会触发警告/循环
  const user = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);
  const signOut = useUserStore((s) => s.signOut);

  const [core, setCore] = useState<StudentCore | null>(null);
  const [displayName, setDisplayName] = useState(user?.name ?? "");
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  // i18n：按 core.nativeLanguage 渲染；未加载时用英文兜底
  const [t, setT] = useState<Strings>(EN_STRINGS);
  useEffect(() => {
    if (!core?.nativeLanguage) return;
    loadTranslations(core.nativeLanguage as Lang).then(setT);
  }, [core?.nativeLanguage]);

  useEffect(() => {
    if (!user) { navigate("/auth/login"); return; }
    getStudentCore().then(setCore).catch(() => {});
  }, [user, navigate]);

  function updateCore(patch: Partial<StudentCore>) {
    setCore((prev) => prev ? { ...prev, ...patch } : prev);
    setDirty(true);
    setSuccess(false);
  }

  function toggleGoal(key: string) {
    if (!core) return;
    const goals = core.learningGoals.includes(key)
      ? core.learningGoals.filter((k) => k !== key)
      : [...core.learningGoals, key];
    updateCore({ learningGoals: goals });
  }

  async function handleSave() {
    if (!core) return;
    setSaving(true);
    setError("");
    try {
      // 同时更新名字和核心档案
      const [updatedUser, updatedCore] = await Promise.all([
        displayName.trim() !== (user?.name ?? "")
          ? patchName(displayName.trim())
          : Promise.resolve(user!),
        patchStudentCore({
          nativeLanguage: core.nativeLanguage ?? undefined,
          hskLevelSelf: core.hskLevelSelf,
          learningGoals: core.learningGoals,
        }),
      ]);
      setUser(updatedUser);
      setCore(updatedCore);
      // 母语若变了，同步更新全局 UI 语言
      if (updatedCore.nativeLanguage) {
        saveLang(updatedCore.nativeLanguage as Lang);
      }
      setDirty(false);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handleSignOut() {
    await signOut();
    navigate("/", { replace: true });
  }

  if (!user || !core) return null;

  const initials = (user.name ?? user.email).slice(0, 1).toUpperCase();

  const HSK_LEVELS = [
    { value: 0, label: t.onbHskBeginner },
    { value: 1, label: t.onbHskLevel1 },
    { value: 2, label: t.onbHskLevel2 },
    { value: 3, label: t.onbHskLevel3 },
    { value: 4, label: t.onbHskLevel4 },
    { value: 5, label: t.onbHskLevel5 },
    { value: 6, label: t.onbHskLevel6 },
  ];

  return (
    <div className="min-h-screen bg-[#fafaf8]">
      {/* 顶部导航 */}
      <div className="sticky top-0 bg-[#fafaf8]/90 backdrop-blur-sm border-b border-[#e5e5e5] px-4 py-3 flex items-center justify-between z-10">
        <Link to="/" className="text-sm text-[#6b7280] hover:text-[#1c1917] flex items-center gap-1">
          ← {t.profileBack}
        </Link>
        <span className="text-sm font-semibold text-[#1c1917]">{t.profileTitle}</span>
        <Button
          variant="primary"
          onClick={handleSave}
          loading={saving}
          disabled={!dirty}
          className="px-3 py-1.5 text-sm"
        >
          {success ? `✓ ${t.profileSaved}` : t.profileSave}
        </Button>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8 space-y-6">
        {/* 用户头像 + 名字 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-[#c41e3a] flex items-center justify-center text-white text-xl font-bold flex-shrink-0">
            {user.image
              ? <img src={user.image} alt="" className="w-full h-full rounded-full object-cover" />
              : initials
            }
          </div>
          <div className="flex-1 min-w-0">
            <Input
              value={displayName}
              onChange={(e) => { setDisplayName(e.target.value); setDirty(true); }}
              placeholder="Your name"
              className="font-medium"
            />
            <p className="text-sm text-[#9aa0a6] mt-1 truncate">{user.email}</p>
          </div>
        </div>

        {/* 学习档案 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 space-y-5">
          <h2 className="text-sm font-semibold text-[#1c1917] uppercase tracking-wider">
            {t.profileLearningProfile}
          </h2>

          {/* 母语 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#374151]">{t.profileNativeLanguage}</label>
            <select
              value={core.nativeLanguage ?? ""}
              onChange={(e) => updateCore({ nativeLanguage: e.target.value })}
              className="w-full rounded-xl border border-[#e5e5e5] px-3.5 py-2.5 text-sm
                bg-white text-[#1c1917] outline-none focus:border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/10"
            >
              {LANGUAGES.map((l) => (
                <option key={l.code} value={l.code}>{l.native}</option>
              ))}
            </select>
          </div>

          {/* 中文水平 */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-[#374151]">{t.profileChineseLevel}</label>
            <select
              value={core.hskLevelSelf}
              onChange={(e) => updateCore({ hskLevelSelf: Number(e.target.value) })}
              className="w-full rounded-xl border border-[#e5e5e5] px-3.5 py-2.5 text-sm
                bg-white text-[#1c1917] outline-none focus:border-[#c41e3a] focus:ring-2 focus:ring-[#c41e3a]/10"
            >
              {HSK_LEVELS.map((l) => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
          </div>

          {/* 学习目标（多选标签） */}
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-[#374151]">{t.profileLearningGoals}</label>
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((opt) => (
                <button
                  key={opt.key}
                  type="button"
                  onClick={() => toggleGoal(opt.key)}
                  className={`px-3 py-1 rounded-full text-sm font-medium border transition-colors cursor-pointer
                    ${core.learningGoals.includes(opt.key)
                      ? "bg-[#c41e3a] text-white border-[#c41e3a]"
                      : "bg-white border-[#e5e5e5] text-[#1c1917] hover:border-[#c41e3a]/40"
                    }`}
                >
                  {t[opt.labelKey]}
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* 账号 */}
        <div className="bg-white rounded-2xl border border-[#e5e5e5] p-6 space-y-4">
          <h2 className="text-sm font-semibold text-[#1c1917] uppercase tracking-wider">
            {t.profileAccount}
          </h2>
          <div className="text-sm text-[#6b7280]">
            <span className="text-[#1c1917] font-medium">{t.authEmail}: </span>{user.email}
          </div>
          <Button variant="danger" onClick={handleSignOut} className="px-0 text-sm">
            {t.profileSignOut}
          </Button>
        </div>

        {error && <p className="text-sm text-[#c41e3a]">{error}</p>}
      </div>
    </div>
  );
}
