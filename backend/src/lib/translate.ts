// 翻译：Azure Translator → 任意语言自动检测 → 简体中文
// 返回 sourceLang 为小写语言代码，如 "en" "ja" "ko"

export interface TranslateResult {
  text: string;
  sourceLang: string; // Azure 返回的检测语言代码，如 "en" "ja" "ko"
  pinyinStr?: string; // Azure 对输出中文的拼音转写，空格分隔，如 "zhuǎn háng"
}

export async function translateToZh(text: string): Promise<TranslateResult> {
  const key = process.env.AZURE_TRANSLATOR_KEY!;
  const region = process.env.AZURE_TRANSLATOR_REGION!;

  // toScript=Latn：同时获取中文拼音（一次请求，无额外费用）
  const res = await fetch(
    "https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&to=zh-Hans&toScript=Latn",
    {
      method: "POST",
      headers: {
        "Ocp-Apim-Subscription-Key": key,
        "Ocp-Apim-Subscription-Region": region,
        "Content-Type": "application/json",
      },
      body: JSON.stringify([{ text }]),
      signal: AbortSignal.timeout(8000),
    }
  );

  if (!res.ok) throw new Error(`Azure Translator error: ${res.status}`);

  const data = (await res.json()) as Array<{
    detectedLanguage?: { language: string; score: number };
    translations: { text: string; to: string; transliteration?: { script: string; text: string } }[];
  }>;

  const item = data[0];
  if (!item?.translations?.[0]?.text) throw new Error("Azure returned empty translation");

  return {
    text: item.translations[0].text,
    sourceLang: item.detectedLanguage?.language ?? "en",
    pinyinStr: item.translations[0].transliteration?.text,
  };
}

// 将多段文本批量翻译为目标语言
// fromLang 默认 "zh-Hans"（词频 chip）；i18n 路由传 "en" 以翻译英文源字符串
export async function translateTexts(texts: string[], toLang: string, fromLang = "zh-Hans"): Promise<string[]> {
  const key = process.env.AZURE_TRANSLATOR_KEY!;
  const region = process.env.AZURE_TRANSLATOR_REGION!;
  try {
    const res = await fetch(
      `https://api.cognitive.microsofttranslator.com/translate?api-version=3.0&from=${encodeURIComponent(fromLang)}&to=${encodeURIComponent(toLang)}`,
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(texts.map(t => ({ text: t }))),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return texts;
    const data = (await res.json()) as Array<{ translations: { text: string }[] }>;
    return data.map((item, i) => item.translations?.[0]?.text ?? texts[i]);
  } catch {
    return texts;
  }
}

// 单独调用 Azure /transliterate 接口，将简体中文转为拼音
// 用于翻译接口未返回拼音的情况（如源语言已是中文，同语言翻译不返回 transliteration）
export async function transliterateZh(text: string): Promise<string | undefined> {
  const key = process.env.AZURE_TRANSLATOR_KEY!;
  const region = process.env.AZURE_TRANSLATOR_REGION!;
  try {
    const res = await fetch(
      "https://api.cognitive.microsofttranslator.com/transliterate?api-version=3.0&language=zh-Hans&fromScript=Hans&toScript=Latn",
      {
        method: "POST",
        headers: {
          "Ocp-Apim-Subscription-Key": key,
          "Ocp-Apim-Subscription-Region": region,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([{ text }]),
        signal: AbortSignal.timeout(5000),
      }
    );
    if (!res.ok) return undefined;
    const data = (await res.json()) as Array<{ text: string }>;
    return data[0]?.text;
  } catch {
    return undefined;
  }
}
