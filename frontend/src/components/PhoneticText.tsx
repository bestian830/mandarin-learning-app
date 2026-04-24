// 带拼音/注音标注的中文文字组件
// 用于导航栏标签等需要注音标注的 UI 元素

import type { ScriptMode } from "../i18n";
import { pinyinToBopomofo } from "../data/pinyin";

interface Props {
  /** 简体中文 */
  simplified: string;
  /** 繁体中文（省略时使用简体） */
  traditional?: string;
  /** 拼音（空格分隔，每个音节对应一个字） */
  pinyin: string;
  script: ScriptMode;
  className?: string;
  /** 注音字号 */
  phoneticSize?: string;
  /** 是否显示注音（false 时只显示汉字） */
  showPhonetic?: boolean;
}

export default function PhoneticText({
  simplified, traditional, pinyin, script, className,
  phoneticSize = "text-[5px]",
  showPhonetic = true,
}: Props) {
  const text = script === "traditional" ? (traditional ?? simplified) : simplified;
  const chars = [...text];
  const syllables = pinyin.split(/\s+/);

  // 不显示注音时直接输出文字
  if (!showPhonetic) {
    return <span className={className} lang={script === "traditional" ? "zh-Hant" : "zh-Hans"}>{text}</span>;
  }

  return (
    <span className={`inline-flex flex-wrap items-start gap-px ${className ?? ""}`}>
      {chars.map((char, i) => {
        const py = syllables[i] || "";
        const phonetic = script === "traditional" ? pinyinToBopomofo(py) : py;
        return (
          <span key={i} className="inline-flex flex-col items-center leading-none">
            <span>{char}</span>
            <span className={`${phoneticSize} text-[#4285f4] whitespace-nowrap`}>{phonetic}</span>
          </span>
        );
      })}
    </span>
  );
}
