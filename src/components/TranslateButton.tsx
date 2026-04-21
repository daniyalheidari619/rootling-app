import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet, Modal } from 'react-native';
import { translateText } from '../utils/translate';
import { useTranslation } from '../i18n';

const LANGUAGES = [
  { code: 'lt', label: 'Lietuvių 🇱🇹' },
  { code: 'en', label: 'English 🇬🇧' },
  { code: 'ru', label: 'Русский 🇷🇺' },
  { code: 'de', label: 'Deutsch 🇩🇪' },
  { code: 'pl', label: 'Polski 🇵🇱' },
  { code: 'lv', label: 'Latviešu 🇱🇻' },
  { code: 'et', label: 'Eesti 🇪🇪' },
];

interface Props {
  text: string;
  style?: any;
  textStyle?: any;
}

export default function TranslateButton({ text, style, textStyle }: Props) {
  const { lang } = useTranslation();
  const [translated, setTranslated] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);
  const [selectedLang, setSelectedLang] = useState(lang);

  const handleTranslate = async (targetLang?: string) => {
    const tLang = targetLang || selectedLang;
    setLoading(true);
    setShowLangPicker(false);
    try {
      const result = await translateText(text, tLang);
      setTranslated(result);
      setShowOriginal(false);
    } catch {}
    finally { setLoading(false); }
  };

  const displayText = showOriginal ? text : (translated || text);
  const isTranslated = translated && !showOriginal;

  return (
    <View style={style}>
      <Text style={textStyle}>{displayText}</Text>

      <View style={s.row}>
        {loading ? (
          <ActivityIndicator size="small" color="#1FB6AE" style={{ marginTop: 8 }} />
        ) : (
          <>
            <TouchableOpacity onPress={() => setShowLangPicker(true)} style={s.btn}>
              <Text style={s.btnText}>🌐 {lang === 'lt' ? 'Išversti' : 'Translate'}</Text>
            </TouchableOpacity>
            {isTranslated && (
              <TouchableOpacity onPress={() => setShowOriginal(!showOriginal)} style={[s.btn, { marginLeft: 8 }]}>
                <Text style={s.btnText}>{showOriginal ? (lang === 'lt' ? 'Rodyti vertimą' : 'Show translation') : (lang === 'lt' ? 'Originalas' : 'Original')}</Text>
              </TouchableOpacity>
            )}
          </>
        )}
      </View>

      <Modal visible={showLangPicker} transparent animationType="slide">
        <View style={s.overlay}>
          <View style={s.picker}>
            <Text style={s.pickerTitle}>{lang === 'lt' ? 'Pasirinkite kalbą' : 'Select language'}</Text>
            {LANGUAGES.map(l => (
              <TouchableOpacity
                key={l.code}
                style={[s.langBtn, selectedLang === l.code && s.langBtnActive]}
                onPress={() => { setSelectedLang(l.code); handleTranslate(l.code); }}
              >
                <Text style={[s.langText, selectedLang === l.code && s.langTextActive]}>{l.label}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.cancelBtn} onPress={() => setShowLangPicker(false)}>
              <Text style={s.cancelText}>{lang === 'lt' ? 'Atšaukti' : 'Cancel'}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', marginTop: 8 },
  btn: { alignSelf: 'flex-start' },
  btnText: { fontSize: 12, color: '#1FB6AE', fontWeight: '600' },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  picker: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  pickerTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 16 },
  langBtn: { padding: 14, borderRadius: 12, marginBottom: 8, backgroundColor: '#F3F4F6' },
  langBtnActive: { backgroundColor: '#1FB6AE' },
  langText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  langTextActive: { color: '#fff' },
  cancelBtn: { marginTop: 8, padding: 14, alignItems: 'center' },
  cancelText: { color: '#6B7280', fontSize: 14 },
});
