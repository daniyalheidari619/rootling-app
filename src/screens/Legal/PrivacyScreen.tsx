import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function PrivacyScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Privatumo politika' : 'Privacy Policy'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.updated}>{isLt ? 'Atnaujinta: 2024 m.' : 'Last updated: 2024'}</Text>
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isLt ? 'Kokius duomenis renkame' : 'What data we collect'}</Text>
          <Text style={s.point}>{isLt ? 'Vardas, el. pastas, telefono numeris' : 'Name, email, phone number'}</Text>
          <Text style={s.point}>{isLt ? 'Tapatybes dokumentai (tik patvirtinimui)' : 'Identity documents (for verification only)'}</Text>
          <Text style={s.point}>{isLt ? 'Mokejimų informacija (tvarkoma per Stripe)' : 'Payment information (processed via Stripe)'}</Text>
          <Text style={s.point}>{isLt ? 'Uzduociu ir zinutiu istorija' : 'Task and message history'}</Text>
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isLt ? 'BDAR teises' : 'GDPR Rights'}</Text>
          <Text style={s.desc}>{isLt ? 'Turite teise susipazinti, taisyti ar istrinti savo duomenis. Susisiekite: support@root-ling.com' : 'You have the right to access, correct, or delete your data. Contact: support@root-ling.com'}</Text>
        </View>
        <Text style={s.link}>{isLt ? 'Issami politika: root-ling.com/privacy' : 'Full policy: root-ling.com/privacy'}</Text>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600', marginRight: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  updated: { fontSize: 12, color: '#9CA3AF', marginBottom: 16 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  point: { fontSize: 13, color: '#6B7280', lineHeight: 28 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  link: { fontSize: 13, color: '#1FB6AE', fontWeight: '600', textAlign: 'center', marginBottom: 32, marginTop: 8 },
});
