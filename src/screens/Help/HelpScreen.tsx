import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

const FAQ_EN = [
  { q: 'How do I post a task?', a: 'Go to Post Task, choose One-off or Recurring, select a category, fill in the form with title, description, location and budget, then submit.' },
  { q: 'How do payments work?', a: 'Payment is authorized when you accept a tasker and held by Stripe until task completion. Tasker receives payment within 1-3 business days.' },
  { q: 'How do I verify my ID?', a: 'Go to Profile → Verification tab. Upload your ID front, back, and a selfie. Your data is encrypted and never shown publicly.' },
  { q: 'How do I apply for tasks?', a: 'Browse tasks, open one you like, and tap "It interests me". You can also negotiate the price.' },
  { q: 'What is the platform fee?', a: 'Root-ling charges 15% (or 12% with a promo code). Taskers always receive 85% of the budget.' },
  { q: 'What is Premium?', a: 'Premium unlocks recurring tasks and advanced features. See the Subscription page for plans.' },
  { q: 'How do I set up payouts?', a: 'Go to Profile → Billing tab and add your IBAN bank account. Payouts arrive within 1-3 business days after task completion.' },
  { q: 'How do I cancel a task?', a: 'Go to My Tasks, find the task, and tap Cancel. Free if no tasker assigned, partial charge may apply if tasker is assigned.' },
];

const FAQ_LT = [
  { q: 'Kaip skelbti užduotį?', a: 'Eikite į Skelbti užduotį, pasirinkite Vienkartinę arba Pasikartojančią, pasirinkite kategoriją, užpildykite formą ir pateikite.' },
  { q: 'Kaip veikia mokėjimai?', a: 'Mokėjimas autorizuojamas kai priimate vykdytoją ir laikomas per Stripe iki atlikimo. Vykdytojas gauna apmokėjimą per 1-3 darbo dienas.' },
  { q: 'Kaip patvirtinti tapatybę?', a: 'Eikite į Profilį → Patvirtinimo skirtuką. Įkelkite dokumento priekį, galą ir selfi. Duomenys šifruojami ir niekada nerodomi viešai.' },
  { q: 'Kaip kreiptis dėl užduočių?', a: 'Naršykite užduotis, atidarykite patinkančią ir spauskite "Domina". Taip pat galite derėtis dėl kainos.' },
  { q: 'Koks platformos mokestis?', a: 'Root-ling taiko 15% (arba 12% su promo kodu). Vykdytojai visada gauna 85% biudžeto.' },
  { q: 'Kas yra Premium?', a: 'Premium suteikia prkite Prenumeratos puslapį.' },
  { q: 'Kaip nustatyti išmokas?', a: 'Eikite į Profilį → Atsiskaitymo skirtuką ir pridėkite IBAN sąskaitą. Išmokos per 1-3 darbo dienas po atlikimo.' },
  { q: 'Kaip atšaukti užduotį?', a: 'Eikite į Mano užduotis, raskite užduotį ir spauskite Atšaukti. Nemokama jei vykdytojas nepriskirtas.' },
];

export default function HelpScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';
  const [expanded, setExpanded] = useState<number | null>(null);
  const faqs = isLt ? FAQ_LT : FAQ_EN;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Pagalba' : 'Help Center'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <Text style={s.subtitle}>{isLt ? 'Dažniausiai užduodami klausimai' : 'Frequently Asked Questions'}</Text>
        {faqs.map((faq, i) => (
          <TouchableOpacity key={i} style={s.faqItem} onPress={() => setExpanded(expanded === i ? null : i)}>
            <View style={s.faqHeader}>
              <Text style={s.faqQ}>{faq.q}</Text>
              <Text style={s.chevron}>{expanded === i ? '−' : '+'}</Text>
            </View>
            {expanded === i && <Text style={s.faqA}>{faq.a}</Text>}
          </TouchableOpacity>
        ))}
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>{isLt ? 'Reikia pagalbos?' : 'Need more help?'}</Text>
          <Text style={s.contactText}>support@root-ling.com</Text>
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
  subtitle: { fontSize: 14, color: '#6B7280', marginBottom: 16 },
  faqItem: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8 },
  faqHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  faqQ: { flex: 1, fontSize: 14, fontWeight: '700', color: '#111827', marginRight: 8 },
  chevron: { fontSize: 20, color: '#1FB6AE', fontWeight: '700' },
  faqA: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginTop: 12 },
  contactCard: { backgroundColor: '#1FB6AE', borderRadius: 16, padding: 20, alignItems: 'center', marginTop: 8, marginBottom: 32 },
  contactTitle: { fontSize: 15, fontWeight: '700', color: '#fff', marginBottom: 8 },
  contactText: { fontSize: 14, color: '#fff', opacity: 0.9 },
});
