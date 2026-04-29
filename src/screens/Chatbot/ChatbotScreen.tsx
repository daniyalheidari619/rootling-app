import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Linking } from 'react-native';
import { useTranslation } from '../../i18n';

export default function ChatbotScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>Back</Text>
        </TouchableOpacity>
        <Text style={s.title}>AI Assistant</Text>
      </View>
      <View style={s.content}>
        <Text style={s.emoji}>🤖</Text>
        <Text style={s.heading}>{isLt ? 'Netrukus!' : 'Coming Soon!'}</Text>
        <Text style={s.desc}>{isLt ? 'AI asistentas bus prieinamas netrukus.' : 'The AI assistant will be available soon. Contact us by email in the meantime.'}</Text>
        <TouchableOpacity style={s.webBtn} onPress={() => Linking.openURL('https://root-ling.com')}>
          <Text style={s.webBtnText}>{isLt ? 'Atidaryti svetainę' : 'Open Website'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.emailBtn} onPress={() => Linking.openURL('mailto:support@root-ling.com')}>
          <Text style={s.emailBtnText}>support@root-ling.com</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 14, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 },
  emoji: { fontSize: 64, marginBottom: 24 },
  heading: { fonSize: 24, fontWeight: '800', color: '#111827', marginBottom: 16, textAlign: 'center' },
  desc: { fontSize: 15, color: '#6B7280', textAlign: 'center', lineHeight: 22, marginBottom: 32 },
  webBtn: { backgroundColor: '#1FB6AE', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12, width: '100%', alignItems: 'center' },
  webBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  emailBtn: { backgroundColor: '#F3F4F6', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: '100%', alignItems: 'center' },
  emailBtnText: { color: '#374151', fontWeight: '600', fontSize: 14 },
});
