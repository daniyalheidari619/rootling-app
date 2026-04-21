import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert, Linking } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import client from '../../api/client';

const FEATURES: Record<string, { en: string[]; lt: string[] }> = {
  tasker: { en: ['Apply to unlimited tasks', 'Priority in search results', 'Advanced analytics'], lt: ['Neribotai prisijunkite prie užduočių', 'Prioritetas paieškos rezultatuose', 'Išplėstinė analitika'] },
  task_maker: { en: ['Post unlimited tasks', 'Choose your tasker', 'Boost tasks for free', 'Recurring tasks'], lt: ['Skelbkite neribotai užduočių', 'Pasirinkite savo vykdytoją', 'Nemokamai reklamuokite užduotis', 'Pasikartojančios užduotys'] },
  both: { en: ['Everything in Tasker plan', 'Everything in Client plan', 'Best value'], lt: ['Visos vykdytojo funkcijos', 'Visos kliento funkcijos', 'Geriausia vertė'] },
};

export default function SubscriptionScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const [interval, setInterval] = useState<'monthly' | 'annual'>('monthly');
  const [loading, setLoading] = useState<string | null>(null);

  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const { data } = await client.get('/api/subscriptions/plans');
      return data.plans || [];
    },
  });

  const { data: currentSub } = useQuery({
    queryKey: ['currentSub'],
    queryFn: async () => {
      const { data } = await client.get('/api/subscriptions/current');
      return data;
    },
    enabled: !!user,
  });

  const filtered = plans.filter((p: any) => p.interval === interval);

  const getColor = (role: string) =>
    role === 'tasker' ? '#1FB6AE' : role === 'task_maker' ? '#6366F1' : '#F59E0B';

  const getLabel = (role: string) => {
    if (lang === 'lt') return role === 'tasker' ? 'Vykdytojui' : role === 'task_maker' ? 'Klientui' : 'Abiem';
    return role === 'tasker' ? 'For Taskers' : role === 'task_maker' ? 'For Clients' : 'For Both';
  };

  const subscribe = async (plan: any) => {
    if (!user) return Alert.alert('Error', 'Please sign in first');
    setLoading(plan.id);
    try {
      const { data } = await client.post('/api/subscriptions/checkout', {
        planId: plan.id,
        successUrl: 'https://root-ling.com/profile?tab=billing&success=true',
        cancelUrl: 'https://root-ling.com/profile?tab=billing',
      });
      if (data.url) await Linking.openURL(data.url);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Failed to start checkout');
    } finally {
      setLoading(null);
    }
  };

  const cancelSub = () => {
    Alert.alert(
      lang === 'lt' ? 'Atšaukti prenumeratą?' : 'Cancel subscription?',
      lang === 'lt' ? 'Prenumerata bus aktyvi iki laikotarpio pabaigos.' : 'Your subscription stays active until period end.',
      [
        { text: lang === 'lt' ? 'Pasilikti' : 'Keep', style: 'cancel' },
        { text: lang === 'lt' ? 'Atšaukti' : 'Cancel', style: 'destructive', onPress: async () => {
          try { await client.post('/api/subscriptions/cancel'); } catch {}
        }},
      ]
    );
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <TouchableOpacity onPress={() => navigation.goBack()} style={s.back}>
        <Text style={s.backText}>← {lang === 'lt' ? 'Atgal' : 'Back'}</Text>
      </TouchableOpacity>
      <Text style={s.title}>{lang === 'lt' ? 'Prenumeratos planai' : 'Subscription Plans'}</Text>
      <Text style={s.subtitle}>{lang === 'lt' ? 'Pasirinkite planą' : 'Unlock more features'}</Text>

      {currentSub?.isSubscriber && (
        <View style={s.activeBadge}>
          <Text style={s.activeBadgeText}>Active: {currentSub.plan?.replace(/_/g, ' ').toUpperCase()}</Text>
          <TouchableOpacity onPress={cancelSub}><Text style={s.cancelText}>{lang === 'lt' ? 'Atšaukti' : 'Cancel'}</Text></TouchableOpacity>
        </View>
      )}

      <View style={s.toggle}>
        {(['monthly', 'annual'] as const).map(i => (
          <TouchableOpacity key={i} style={[s.toggleBtn, interval === i && s.toggleActive]} onPress={() => setInterval(i)}>
            <Text style={[s.toggleText, interval === i && s.toggleActiveText]}>
              {i === 'monthly' ? (lang === 'lt' ? 'Mėnesinis' : 'Monthly') : (lang === 'lt' ? 'Metinis (-30%)' : 'Annual (-30%)')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.map((plan: any) => {
        const color = getColor(plan.role);
        const features = FEATURES[plan.role]?.[lang] || FEATURES[plan.role]?.en || [];
        const isCurrent = currentSub?.plan === plan.id;
        return (
          <View key={plan.id} style={[s.card, isCurrent && { borderColor: color, borderWidth: 2 }]}>
            <View style={[s.cardHeader, { backgroundColor: color }]}>
              <Text style={s.cardLabel}>{getLabel(plan.role)}</Text>
              <Text style={s.cardPrice}>€{plan.price}<Text style={s.cardPer}>/{interval === 'monthly' ? 'mo' : 'yr'}</Text></Text>
              {interval === 'annual' && <Text style={s.cardMonthly}>≈ €{(plan.price / 12).toFixed(2)}/mo</Text>}
            </View>
            <View style={s.cardBody}>
              {features.map((f: string, i: number) => (
                <View key={i} style={s.feature}>
                  <Text style={[s.featureCheck, { color }]}>✓</Text>
                  <Text style={s.featureText}>{f}</Text>
                </View>
              ))}
              {isCurrent ? (
                <View style={[s.btn, { backgroundColor: color + '20' }]}>
                  <Text style={[s.btnText, { color }]}>{lang === 'lt' ? 'Dabartinis planas' : 'Current Plan'}</Text>
                </View>
              ) : (
                <TouchableOpacity style={[s.btn, { backgroundColor: color }]} onPress={() => subscribe(plan)} disabled={loading === plan.id}>
                  {loading === plan.id ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{lang === 'lt' ? 'Prenumeruoti' : 'Subscribe'}</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      <View style={s.freeCard}>
        <Text style={s.freeTitle}>{lang === 'lt' ? 'Nemokamas planas' : 'Free Plan'}</Text>
        <Text style={s.freeDesc}>{lang === 'lt' ? 'Skelbkite ir atlikite užduotis be prenumeratos.' : 'Post and complete tasks without a subscription.'}</Text>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  content: { padding: 20, paddingTop: 60 },
  back: { marginBottom: 16 },
  backText: { color: '#1FB6AE', fontWeight: '600', fontSize: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  activeBadge: { backgroundColor: '#F0FAFA', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#1FB6AE', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  activeBadgeText: { fontSize: 14, fontWeight: '700', color: '#1FB6AE', flex: 1 },
  cancelText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  toggle: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  toggleActiveText: { color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { padding: 20 },
  cardLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  cardPrice: { fontSize: 36, fontWeight: '800', color: '#fff' },
  cardPer: { fontSize: 16, color: 'rgba(255,255,255,0.8)' },
  cardMonthly: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  cardBody: { padding: 20 },
  feature: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  featureCheck: { fontSize: 16, fontWeight: '700' },
  featureText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  btn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  freeCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  freeTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280', marginBottom: 6 },
  freeDesc: { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },
});
