// 简繁体互转，使用 opencc-js（本地转换，无 API 调用）
import * as opencc from "opencc-js";

const cnToTw = opencc.Converter({ from: "cn", to: "tw" });
const twToCn = opencc.Converter({ from: "tw", to: "cn" });

export function toTraditional(simplified: string): string {
  return cnToTw(simplified);
}

export function toSimplified(traditional: string): string {
  return twToCn(traditional);
}
