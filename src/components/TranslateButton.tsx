import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ActivityIndicator, StyleSheet } from 'react-native';
import { translateText } from '../utils/translate';
import { useTranslation } from '../i18n';

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

  const handleTranslate = async () => {
    if (translated) {
      setShowOriginal(!showOriginal);
      return;
    }
    setLoading(true);
    try {
      const result = await translateText(text, lang);
      setTranslated(result);
    } catch {}
    finally { setLoading(false); }
  };

  const displayText = showOriginal ? text : (translated || text);
  const isTranslated = translated && !showOriginal;

  return (
    <View style={style}>
      <Text style={textStyle}>{displayText}</Text>
      {loading ? (
        <ActivityIndicator size="small" color="#1FB6AE" style={{ marginTop: 8 }} />
      ) : (
        <TouchableOpacity onPress={handleTranslate} style={s.btn}>
          <Text style={s.btnText}>
            {isTranslated
              ? (lang === 'lt' ? 'Rodyti originalą' : 'Show original')
              : (lang === 'lt' ? '🌐 Išversti' : '🌐 Translate')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  btn: { marginTop: 8, alignSelf: 'flex-start' },
  btnText: { fontSize: 12, color: '#1FB6AE', fontWeight: '600' },
});
