import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function SafetyScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  const tips = isLt ? [
    { icon: '🔒', title: 'Patvirtinkite tapatybę', desc: 'Visada tikrinkite, ar vykdytojas yra patvirtintas. Patvirtinti profiliai rodo žalią varnelę.' },
    { icon: '💳', title: 'Mokėjimai per platformą', desc: 'Niekada nemokėkite grynaisiais ar tiesiogiai. Visi mokėjimai turi vykti per Root-ling, kad jūsų pinigai būtų apsaugoti.' },
    { icon: '📍', title: 'Susitikite viešose vietose', desc: 'Pirmą kartą susitinkantrinkitės viešas vietas.' },
    { icon: '🚫', title: 'Nesidalinkite asmenine informacija', desc: 'Nesidalinkite savo banko duomenimis, slaptažodžiais ar kitą asmenine informacija.' },
    { icon: '⭐', title: 'Palikite atsiliepimą', desc: 'Po kiekvienos užduoties palikite atsiliepimą. Tai padeda kitiems naudotojams.' },
    { icon: '🚨', title: 'Pranešite apie problemas', desc: 'Jei jaučiatės nesaugiai arba patyrėte sukčiavimą, nedelsdami susisiekite su mumis: support@root-ling.com' },
  ] : [
    { icon: '🔒', title: 'Verify Identity', desc: 'Always check if a tasker is verified. Verified profiles show a green checkmark.' },
    { icon: '💳', title: 'Pay Through the Platform', desc: 'Never pay with cash or directly. All payments must go through Root-ling to protect your money.' },
    { icon: '📍', title: 'Meet in Public Places', desc: 'When meeting a new tasker for the first time, choose public locations.' },
    { icon: '🚫', title: 'Do Not Share Personal Info', de
    { icon: '⭐', title: 'Leave Reviews', desc: 'After each task, leave a review. This helps other users make informed decisions.' },
    { icon: '🚨', title: 'Report Problems', desc: 'If you feel unsafe or experienced fraud, contact us immediately: support@root-ling.com' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Saugumas' : 'Safety'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.banner}>
          <Text style={s.bannerTitle}>🛡️ {isLt ? 'Jūsų saugumas — mūsų prioritetas' : 'Your safety is our priority'}</Text>
          <Text style={s.bannerDesc}>{isLt ? 'Root-ling naudoja Stripe mokėjimams ir šifruoja visus jautrius duomenis.' : 'Root-ling uses Stripe for payments and encrypts all sensitive data.'}</Text>
        </View>
        {tips.map((tip, i) => (
          <View key={i} style={s.card}>
            <Text style={s.icon}>{tip.icon}</Text>
            <View style={s.content}>
              <Text style={s.tipTitle}>{tip.title}</Text>
              <Text style={s.tipDesc}>{tip.desc}</Text>
            </View>
          </View>
        ))}
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>{isLt ? 'Reikia pagalbos?' : 'Need help?'}</Text>
          <Text style={s.contactEmail}>support@root-ling.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 20, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  banner: { backgroundColor: '#1FB6AE', borderRadius: 16, padding: 20, marginBottom: 16 },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8 },
  bannerDesc: { fontSize: 13, color: '#fff', opacity: 0.9, lineHeight: 18 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 10, flexDirection: 'row', gap: 12 },
  icon: { fontSize: 24, width: 36 },
  content: { flex: 1 },
  tipTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  tipDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  contactCard: { backgroundColor: '#FEF2F2', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  contactTitle: { fontSize: 14, fontWeight: '700', color: '#DC2626', marginBottom: 8 },
  contactEmail: { fontSize: 14, color: '#EF4444' },
});
