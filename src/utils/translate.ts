import client from '../api/client';
import { getLanguage } from '../i18n';

const cache = new Map<string, string>();

export async function translateText(text: string, targetLang?: string): Promise<string> {
  if (!text?.trim()) return text;
  const lang = targetLang || getLanguage();
  const cacheKey = `${lang}:${text}`;
  if (cache.has(cacheKey)) return cache.get(cacheKey)!;
  try {
    const { data } = await client.post('/api/translate', { text, targetLang: lang });
    const result = data.translatedText || text;
    cache.set(cacheKey, result);
    return result;
  } catch {
    return text;
  }
}
