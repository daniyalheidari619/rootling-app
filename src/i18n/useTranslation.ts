import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode } from './translations';

const LANG_KEY = 'app_language';
let currentLang: LanguageCode = 'en';
const listeners = new Set<() => void>();

export async function loadLanguage() {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'lt') {
      currentLang = stored;
      listeners.forEach(l => l());
    }
  } catch {}
}

export async function setLanguage(lang: LanguageCode) {
  currentLang = lang;
  try { await AsyncStorage.setItem(LANG_KEY, lang); } catch {}
  listeners.forEach(l => l());
}

export function getLanguage(): LanguageCode {
  return currentLang;
}

export function useTranslation() {
  const [lang, setLang] = useState<LanguageCode>(currentLang);

  useEffect(() => {
    const update = () => setLang(currentLang);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? fallback ?? key;
  }, [lang]);

  return { t, lang, setLanguage };
}
