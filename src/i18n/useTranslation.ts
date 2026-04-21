import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode } from './translations';

const LANG_KEY = 'app_language';
let currentLang: LanguageCode = 'en';
const listeners = new Set<(lang: LanguageCode) => void>();

export async function loadLanguage() {
  try {
    const stored = await AsyncStorage.getItem(LANG_KEY);
    if (stored === 'en' || stored === 'lt') {
      currentLang = stored;
      listeners.forEach(l => l(stored));
    }
  } catch {}
}

export async function setLanguage(lang: LanguageCode) {
  currentLang = lang;
  try { await AsyncStorage.setItem(LANG_KEY, lang); } catch {}
  listeners.forEach(l => l(lang));
}

export function getLanguage(): LanguageCode {
  return currentLang;
}

export function useTranslation() {
  const [lang, setLang] = useState<LanguageCode>(currentLang);

  useEffect(() => {
    // Read from storage on mount to catch any missed updates
    AsyncStorage.getItem(LANG_KEY).then(stored => {
      if ((stored === 'en' || stored === 'lt') && stored !== lang) {
        setLang(stored as LanguageCode);
        currentLang = stored as LanguageCode;
      }
    });

    const update = (newLang: LanguageCode) => setLang(newLang);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    return translations[lang]?.[key] ?? translations['en']?.[key] ?? fallback ?? key;
  }, [lang]);

  return { t, lang, setLanguage };
}
