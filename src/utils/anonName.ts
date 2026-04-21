import { getLanguage } from '../i18n';

export function anonName(name: string | undefined | null, role: 'tasker' | 'client'): string {
  const initial = (name || '?').charAt(0).toUpperCase();
  const lang = getLanguage();
  if (lang === 'lt') {
    return role === 'tasker' ? `Vykdytojas ${initial}.` : `Klientas ${initial}.`;
  }
  return role === 'tasker' ? `Tasker ${initial}.` : `Client ${initial}.`;
}

export function anonAvatar(name: string | undefined | null): string {
  return (name || '?').charAt(0).toUpperCase();
}
