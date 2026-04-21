import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations, LanguageCode, DEFAULT_LANGUAGE } from './translations';

const LANG_KEY = 'app_language';
let currentLang: LanguageCode = 'en';
const listeners: Set<() => void> = new Set();

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
  await AsyncStorage.setItem(LANG_KEY, lang);
  listeners.forEach(l => l());
}

export function getLanguage(): LanguageCode {
  return currentLang;
}

export function useTranslation() {
  const [, forceUpdate] = useState(0);

  useEffect(() => {
    const update = () => forceUpdate(n => n + 1);
    listeners.add(update);
    return () => { listeners.delete(update); };
  }, []);

  const t = (key: string, fallback?: string): string => {
    return translations[currentLang]?.[key] ?? translations['en']?.[key] ?? fallback ?? key;
  };

  return { t, lang: currentLang, setLanguage };
}
