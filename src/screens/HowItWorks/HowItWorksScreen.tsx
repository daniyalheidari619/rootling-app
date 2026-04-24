import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function HowItWorksScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  const steps = [
    { icon: '📋', titleEn: 'Post a Task', titleLt: 'Skelbti užduotį', descEn: 'Describe what you need, set your budget, and choose a category.', descLt: 'Aprašykite, ko jums reikia, nustatykite biudžetą ir pasirinkite kategoriją.' },
    { icon: '👥', titleEn: 'Receive Applications', titleLt: 'Gauti paraiškas', descEn: 'Taskers apply to your task. Review profiles and ratings.', descLt: 'Vykdytojai kreipiasi dėl jūsų užrėkite profilius ir įvertinimus.' },
    { icon: '✅', titleEn: 'se a Tasker', titleLt: 'Pasirinkti vykdytoją', descEn: 'Accept the best applicant. Payment is held securely by Stripe.', descLt: 'Priimkite geriausią kandidatą. Mokėjimas saugiai laikomas per Stripe.' },
    { icon: '🎯', titleEn: 'Task Completed', titleLt: 'Užduotis atlikta', descEn: 'Confirm completion and the tasker receives payment within 1-3 days.', descLt: 'Patvirtinkite atlikimą ir vykdytojas gauna mokėjimą per 1-3 dienas.' },
  ];

  const taskerSteps = [
    { icon: '🔍', titleEn: 'Browse Tasks', titleLt: 'Naršyti užduotis', descEn: 'Find tasks matching your skills and location.', descLt: 'Raskite užduotis pagal įgūdžius ir vietą.' },
    { icon: '💬', titleEn: 'Apply or Negotiate', titleLt: 'Kreiptis arba derėtis', descEn: 'Express interest or propose a different price.', descLt: 'Išreikškite susidomėjimą arba pasiūlykite kitą kainą.' },
    { icon: '🔧', titleEn: 'Complete the Task', titleLt: 'Atlikti užduotį', descEn: 'Do the work and the client confirms completion.', descLt: 'Atlikite darbą ir klientas patvirtina atlikimą.' },
    { icon: '💶', titleEn: 'Get Paid', titleLt: 'Gauti apmokėjimą', descEn: 'Funds arrive in your bank account within 1-3 business days.', descLt: 'Lėšos pasiekia jūsų banko sąskaitą per 1-3 darbo dienas.' },
  ];

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← {isLt ? 'Atgal' : 'Back'}</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Kaip tai veikia' : 'How It Works'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isLt ? '👤 Klientams' : '👤 For Clients'}</Text>
          {steps.map((step, i) => (
            <View key={i} style={s.step}>
              <View style={s.stepIcon}><Text style={{ fontSize: 24 }}>{step.icon}</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{isLt ? step.titleLt : step.titleEn}</Text>
                <Text style={s.stepDesc}>{isLt ? step.descLt : step.descEn}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.section}>
          <Text style={s.sectionTitle}>{isLt ? '🔧 Vykdytojams' : '🔧 For Taskers'}</Text>
          {taskerSteps.map((step, i) => (
            <View key={i} style={s.step}>
              <View style={s.stepIcon}><Text style={{ fontSize: 24 }}>{step.icon}</Text></View>
              <View style={s.stepContent}>
                <Text style={s.stepTitle}>{isLt ? step.titleLt : step.titleEn}</Text>
                <Text style={s.stepDesc}>{isLt ? step.descLt : step.descEn}</Text>
              </View>
            </View>
          ))}
        </View>
        <View style={s.security}>
          <Text style={s.securityTitle}>🔒 {isLt ? 'Saugūs mokėjimai' : 'Secure Payments'}</Text>
          <Text style={s.securityDesc}>{isLt ? 'Visi mokėjimai tvarkomi per Stripe. Pinigai laikomi iki užduoties atlikimo patvirtinimo.' : 'All payments are processed by Stripe. Funds are held until task completion is confirmed.'}</Text>
        </View>
        <TouchableOpacity style={s.postBtn} onPress={() => navigation.navigate('Post')}>
          <Text style={s.postBtnText}>{isLt ? 'Skelbti užduotį' : 'Post a Task'}</Text>
        </TouchableOpacity>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  section: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  step: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  stepIcon: { width: 48, height: 48, backgroundColor: '#F0FDF4', borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  stepContent: { flex: 1 },
  stepTitle: { fontSize: 14, fontWeight: '700', color: '#111827', marginBottom: 4 },
  stepDesc: { fontSize: 13, color: '#6B7280', lineHeight: 18 },
  security: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginBottom: 16 },
  securityTitle: { fontSize: 15, fontWeight: '700', color: '#1E40AF', marginBottom: 8 },
  securityDesc: { fontSize: 13, color: '#3B82F6', lineHeight: 18 },
  postBtn: { backgroundColor: '#1FB6AE', borderRadius: 14, padding: 18, alignItems: 'center', marginBottom: 32 },
  postBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
