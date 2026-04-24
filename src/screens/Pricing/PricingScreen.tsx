import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function PricingScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>← {isLt ? 'Atgal' : 'Back'}</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Kainos' : 'Pricing'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Platformos mokesčiai' : 'Platform Fees'}</Text>
          <View style={s.feeRow}>
            <Text style={s.feeLabel}>{isLt ? 'Standartinis mokestis' : 'Standard fee'}</Text>
            <Text style={s.feeValue}>15%</Text>
          </View>
          <View style={s.feeRow}>
            <Text style={s.feeLabel}>{isLt ? 'Su promo kodu' : 'With promo code'}</Text>
            <Text style={s.feeValue}>12%</Text>
          </View>
          <Text style={s.note}>{isLt ? 'Vykdytojas visada gauna 85% biudžeto.' : 'Tasker always receives 85% of the budget.'}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Kaip paskirstomi pinigai' : 'How money is split'}</Text>
          <View style={s.split}>
            <View style={[s.splitBar, { flex: 85, backgroundColor: '#1FB6AE' }]}><Text style={s.splitText}>85%</Text></View>
            <View style={[s.splitBar, { flex: 15, backgroundColor: '#6366F1' }]}><Text style={s.splitText}>15%</Text></View>
          </View>
          <View style={s.splitLabels}>
            <Text style={s.splitLabel}>{isLt ? 'Vykdytojas' : 'Tasker'}</Text>
            <Text style={s.splitLabel}>Root-ling</Text>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Minimalios kainos' : 'Minimum Prices'}</Text>
          <Text style={s.minDesc}>{isLt ? 'Kiekviena kategorija turi minimalią kainą pagal užduoties tipą ir vietą. Ją matysite kuriant užduotį.' : 'Each category has a minimum price based on task type and location. You will see it when creating a task.'}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Premium</Text>
          <Text style={s.premDesc}>{isLt ? 'Premium prenumerata suteikia prieigą prie pasikartojančių užduočių ir kitų funkcijų.' : 'Premium subscription unlocks recurring tasks and other advanced features.'}</Text>
          <TouchableOpacity style={s.premBtn} onPress={() => navigation.navigate('Subscription')}>
            <Text style={s.premBtnText}>{isLt ? 'Peržiūrėti planus' : 'View Plans'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backrderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 16 },
  feeRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 },
  feeLabel: { fontSize: 14, color: '#6B7280' },
  feeValue: { fontSize: 16, fontWeight: '800', color: '#1FB6AE' },
  note: { fontSize: 12, color: '#9CA3AF', marginTop: 8 },
  split: { flexDirection: 'row', height: 40, borderRadius: 10, overflow: 'hidden', marginBottom: 8 },
  splitBar: { justifyContent: 'center', alignItems: 'center' },
  splitText: { color: '#fff', fontWeight: '800', fontSize: 12 },
  splitLabels: { flexDirection: 'row', justifyContent: 'space-between' },
  splitLabel: { fontSize: 12, color: '#6B7280' },
  minDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20 },
  premDesc: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 16 },
  premBtn: { backgroundColor: '#6366F1', borderRadius: 12, padding: 14, alignItems: 'center' },
  premBtnText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
