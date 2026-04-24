// 声调音高曲线 SVG 示意图
// 横轴 = 时间，纵轴 = 音高（上高下低）

interface Props {
  tone:    number;  // 1-4 或 0（轻声）
  color?:  string;
  size?:   number;  // viewBox 宽度，默认 56
}

// 每条折线/曲线的 SVG path（viewBox: 0 0 56 36）
const PATHS: Record<number, string> = {
  1: "M4,9 L52,9",                          // 高平调 (55)
  2: "M4,26 L52,6",                         // 上升调 (35)
  3: "M4,10 C14,28 38,28 52,16",            // 曲折调 (214) 先降后升
  4: "M4,6 L52,26",                         // 降调   (51)
  0: "M18,19 L38,19",                       // 轻声   短横
};

// 每声对应的数字序号（Chao 五度标记法）
const CHAO: Record<number, string> = {
  1: "55", 2: "35", 3: "214", 4: "51", 0: "·",
};

export default function ToneContour({ tone, color = "#c41e3a", size = 56 }: Props) {
  const path = PATHS[tone] ?? PATHS[0];

  return (
    <svg
      viewBox={`0 0 56 36`}
      width={size}
      height={size * 36 / 56}
      aria-label={`声调曲线 ${CHAO[tone]}`}
    >
      {/* 纵向参考线（低/中/高） */}
      {[9, 18, 27].map(y => (
        <line key={y} x1="0" y1={y} x2="56" y2={y}
          stroke="#f0f0f0" strokeWidth="1" />
      ))}
      {/* 音高曲线 */}
      <path
        d={path}
        stroke={color}
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* 起始端点 */}
      <circle
        cx={tone === 0 ? 18 : 4}
        cy={tone === 1 ? 9 : tone === 2 ? 26 : tone === 3 ? 10 : tone === 4 ? 6 : 19}
        r="3"
        fill={color}
      />
    </svg>
  );
}
