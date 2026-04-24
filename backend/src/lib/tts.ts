// Azure Speech Service TTS：将文本合成为 MP3 音频
// 根据语言代码选择合适的神经语音

// 语言代码 → Azure 神经语音名称（女声优先）
// zh-tw 单独映射为台湾腔，确保 x-bopomo phoneme SSML 发音准确
const VOICE_MAP: Record<string, string> = {
  "zh-tw": "zh-TW-HsiaoChenNeural",
  "zh-cn": "zh-CN-XiaoxiaoNeural",
  zh: "zh-CN-XiaoxiaoNeural",
  en: "en-US-JennyNeural",
  ja: "ja-JP-NanamiNeural",
  ko: "ko-KR-SunHiNeural",
  fr: "fr-FR-DeniseNeural",
  de: "de-DE-KatjaNeural",
  es: "es-ES-ElviraNeural",
  ru: "ru-RU-SvetlanaNeural",
  pt: "pt-BR-FranciscaNeural",
  it: "it-IT-ElsaNeural",
  nl: "nl-NL-FennaNeural",
  pl: "pl-PL-ZofiaNeural",
  ar: "ar-SA-ZariyahNeural",
  th: "th-TH-PremwadeeNeural",
  vi: "vi-VN-HoaiMyNeural",
  tr: "tr-TR-EmelNeural",
  id: "id-ID-GadisNeural",
  hi: "hi-IN-SwaraNeural",
};

// 从 BCP-47 标签提取语音映射键
// 先尝试完整小写匹配（如 "zh-TW" → "zh-tw"），再取主代码（如 "en-US" → "en"）
function toLangPrefix(lang: string): string {
  const lower = lang.toLowerCase();
  if (VOICE_MAP[lower]) return lower;
  return lower.split("-")[0];
}

export async function synthesize(text: string, lang: string, bopomo = false): Promise<Buffer> {
  const key = process.env.AZURE_SPEECH_KEY!;
  const region = process.env.AZURE_SPEECH_REGION!;

  const prefix = toLangPrefix(lang);
  const voiceName = VOICE_MAP[prefix] ?? "en-US-JennyNeural";

  // 用语音名称推导 xml:lang（如 zh-CN-XiaoxiaoNeural → zh-CN）
  const xmlLang = voiceName.split("-").slice(0, 2).join("-");

  // bopomo 模式：使用注音符号 phoneme 标签，精确控制声母/韵母/声调
  // 适用于拼音教学中需要播放孤立音节（如纯韵母 ㄚˊ = á）的场景
  const voiceBody = bopomo
    ? `<phoneme alphabet="x-bopomo">${text}</phoneme>`
    : escapeXml(text);

  const ssml = `<speak version="1.0" xmlns="http://www.w3.org/2001/10/synthesis" xml:lang="${xmlLang}">
  <voice name="${voiceName}">${voiceBody}</voice>
</speak>`;

  const res = await fetch(
    `https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Content-Type": "application/ssml+xml",
        "X-Microsoft-OutputFormat": "audio-24khz-48kbitrate-mono-mp3",
      },
      body: ssml,
      signal: AbortSignal.timeout(10000),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Azure Speech error: ${res.status} ${errText}`);
  }

  const buf = await res.arrayBuffer();
  return Buffer.from(buf);
}

function escapeXml(str: string): string {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
