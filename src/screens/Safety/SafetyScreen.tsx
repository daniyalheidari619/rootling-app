import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function SafetyScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  const tips = isLt ? [
    { icon: '🔒', title: 'Patvirtinkite tapatybe', desc: 'Visada tikrinkite, ar vykdytojas yra patvirtintas. Patvirtinti profiliai rodo zalia varnele.' },
    { icon: '💳', title: 'Mokejimai per platforma', desc: 'Niekada nemokekite grynaisiais. Visi mokejimai turi vykti per Root-ling.' },
    { icon: '📍', title: 'Susitikite viesose vietose', desc: 'Pirmą kartą susitinkant su nauju vykdytoju, rinkites viesas vietas.' },
    { icon: '⭐', title: 'Palikite atsiliepima', desc: 'Po kiekvienos uzduoties palikite atsiliepima. Tai padeda kitiems naudotojams.' },
    { icon: '🚨', title: 'Pranesskite apie problemas', desc: 'Jei jauciatesi nesaugiite: support@root-ling.com' },
  ] : [
    { icon: '🔒', title: 'Verify Identity', desc: 'Always check if a tasker is verified. Verified profiles show a green checkmark.' },
    { icon: '💳', title: 'Pay Through Platform', desc: 'Never pay with cash or directly. All payments must go through Root-ling.' },
    { icon: '📍', title: 'Meet in Public Places', desc: 'When meeting a new tasker for the first time, choose public locations.' },
    { icon: '⭐', title: 'Leave Reviews', desc: 'After each task, leave a review. This helps other users make informed decisions.' },
    { icon: '🚨', title: 'Report Problems', desc: 'If you feel unsafe or experienced fraud, contact us: support@root-ling.com' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Saugumas' : 'Safety'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.banner}>
          <Text style={s.bannerTitle}>{isLt ? 'Jusu saugumas -ritetas' : 'Your safety is our priority'}</Text>
          <Text style={s.bannerDesc}>{isLt ? 'Root-ling naudoja Stripe mokejimai ir sifruoja visus jautrius duomenis.' : 'Root-ling uses Stripe for payments and encrypts all sensitive data.'}</Text>
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
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600', marginRight: 8 },
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
