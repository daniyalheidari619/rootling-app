import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function TermsScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  returnle={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Naudojimo sąlygos' : 'Terms of Service'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.updated}>{isLt ? 'Atnaujinta: 2024 m.' : 'Last updated: 2024'}</Text>
        <Text style={s.desc}>{isLt ? 'Naudodamiesi Root-ling platforma sutinkate su šiomis naudojimo sąlygomis. Išsamias sąlygas rasite:' : 'By using Root-ling, you agree to these terms of service. For full terms, visit:'}</Text>
        <Text style={s.link}>root-ling.com/terms</Text>
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isLt ? 'Pagrindiniai punktai' : 'Key points'}</Text>
          <Text style={s.point}>{isLt ? '• Turite būti bent 18 metų amžiaus' : '• You must be at least 18 years old'}</Text>
          <Text style={s.point}>{isLt ? '• Mokėjimai tvarkomi per Stripe' : '• Payments are processed through Stripe'}</Text>
          <Text style={s.point}>{isLt ? '• Root-ling taiko 15% platformos mokestį' : '• Root-ling charges a 15% platform fee'}</Text>
          <Text style={s.point}>{isLt ? '• Draudžiama skelbti neteisėtas užduotis' : '• Posting illegal tasks is prohibited'}</Text>
          <Text style={s.point}>{isLt ? '• Ginčai sprendžiami per platformos palaikymą' : '• Disputes are resolved through platform support'}</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 20, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  updated: { fontSize: 12, color: '#9CA3AF', marginBottom: 12 },
  desc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 8 },
  link: { fontSize: 14, color: '#1FB6AE', fontWeight: '600', marginBottom: 20 },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 20 },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 12 },
  point: { fontSize: 13, color: '#6B7280', lineHeight: 24 },
});
