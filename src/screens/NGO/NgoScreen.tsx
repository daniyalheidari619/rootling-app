import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function NgoScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  const stepsLt = ['1. Registruokite savo organizacija', '2. Skelbkite savanoriu uzduotis', '3. Savanoriai gali kreiptis be mokesciu', '4. Koordinuokite per platformos zinutes'];
  const stepsEn = ['1. Register your organization', '2. Post volunteer tasks', '3. Volunteers can apply for free', '4. Coordinate via platform messages'];
  const steps = isLt ? stepsLt : stepsEn;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'NVO palaikymas' : 'NGO Support'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.banner}>
          <Text style={s.bannerEmoji}>🤝</Text>
          <Text style={s.bannerTitle}>{isLt ? 'Savanoriu uzduotys' : 'Volunteer Tasks'}</Text>
          <Text style={s.bannerDesc}>{isLt ? 'Root-ling palaiko NVO ir labdaros organizacijas, leisdama skelbti nemokamas savanoriu uzduotis.' : 'Root-ling supports NGOs and charities by allowing them to post free volunteer tasks.'}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Kaip tai veikia' : 'How it works'}</Text>
          {steps.map((step, i) => (
            <Text key={i} style={s.cardDesc}>{step}</Text>
          ))}
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Tinkami subjektai' : 'Eligible entities'}</Text>
          <Text style={s.cardDesc}>{isLt ? 'Registruotos NVO, labdaros fondai, bendrumeniines organizacijos ir kiti ne pelno siekiantys subjektai.' : 'Registered NGOs, charitable foundations, community organizations, and other non-profit entities.'}</Text>
        </View>
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>{isLt ? 'Susisiekite su mumis' : 'Contact us'}</Text>
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
  banner: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  bannerEmoji: { fontSize: 48, marginBottom: 12 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8,extAlign: 'center' },
  bannerDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  cardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 24 },
  contactCard: { backgroundColor: '#1FB6AE', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 32 },
  contactTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8 },
  contactEmail: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
