import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, Linking,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import client from '../../api/client';

const PLAN_FEATURES: Record<string, string[]> = {
  tasker: ['Apply to unlimited tasks', 'Priority in search results', 'Advanced analytics', 'No commission on first 3 tasks/month'],
  task_maker: ['Post unlimited tasks', 'Choose your tasker (not first-come-first-serve)', 'Boost tasks for free', 'Recurring tasks'],
  both: ['Everything in Tasker plan', 'Everything in Task Maker plan', 'Best value for power users'],
};

const PLAN_FEATURES_LT: Record<string, string[]> = {
  tasker: ['Neribotai prisijunkite prie užduočių', 'Prioritetas paieškos rezultatuose', 'Išplėstinė analitika', 'Jokio komisinio pirmžduotims/mėn'],
  task_maker: ['Skelbkite neribotai užduočių', 'Pasirinkite savo vykdytoją', 'Nemokamai reklamuokite užduotis', 'Pasikartojančios užduotys'],
  both: ['Visos vykdytojo plano funkcijos', 'Visos kliento plano funkcijos', 'Geriausia vertė aktyviems naudotojams'],
};

export default function SubscriptionScreen() {
  const { user } = useAuthStore();
  const { t, lang } = useTranslation();
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

  const filteredPlans = plans.filter((p: any) => p.interval === interval);

  const getPlanLabel = (role: string) => {
    if (role === 'tasker') return lang === 'lt' ? 'Vykdytojui' : 'For Taskers';
    if (role === 'task_maker') return lang === 'lt' ? 'Klientui' : 'For Clients';
    return lang === 'lt' ? 'Abiem' : 'For Both';
  };

  const getPlanColor = (role: string) => {
    if (role === 'tasker') return '#1FB6AE';
    if (role === 'task_maker') return '#6366F1';
    return '#F59E0B';
  };

  const handleSubscribe = async (plan: any) => {
    if (!user) return Alert.alert('Error', 'Please sign in first');
    setLoading(plan.id);
    try {
      const { data } = await client.post('/api/subscriptions/checkout', {
        planId: plan.id,
        successUrl: 'https://root-ling.com/profile?tab=billing&success=true',
        cancelUrl: 'https://root-ling.com/profile?tab=billing',
      });
      if (data.url) {
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.error || 'Faart checkout');
    } finally {
      setLoading(null);
    }
  };

  const handleCancel = async () => {
    Alert.alert(
      lang === 'lt' ? 'Atšaukti prenumeratą?' : 'Cancel subscription?',
      lang === 'lt' ? 'Jūsų prenumerata bus aktyvios iki laikotarpio pabaigos.' : 'Your subscription will remain active until the end of the billing period.',
      [
        { text: lang === 'lt' ? 'Pasilikti' : 'Keep it', style: 'cancel' },
        {
          text: lang === 'lt' ? 'Atšaukti' : 'Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await client.post('/api/subscriptions/cancel');
              Alert.alert('Done', lang === 'lt' ? 'Prenumerata atšaukta.' : 'Subscription cancelled.');
            } catch (e: any) {
              Alert.alert('Error', e?.response?.data?.error || 'Failed to cancel');
            }
          },
        },
      ]
    );
  };

  const annualSavings = (monthly: number) => {
    const annualPlan = plans.find((p: any) => p.role === 'tasker' && p.interval === 'annual');
    if (!annualPlan) return null;
    const monthlyTotal = monthly * 12;
    const savings = Math.round(((monthlyTotal - annualPlan.price) / monthlyTotal) * 100);
    return savings > 0 ? savings : null;
  };

  return (
    <ScrollView style={s.container} contentContainerStyle={s.content}>
      <Text style={s.title}>{lang === 'lt' ? 'Prenumeratos planai' : 'Subscription Plans'}</Text>
      <Text style={s.subtitle}>
        {lang === 'lt' ? 'Pasirinkite planą ir gaukite daugiau iš Root-ling' : 'Unlock more features with a premium plan'}
      </Text>

      {currentSub?.isSubscriber && (
        <View style={s.activeBadge}>
          <Text style={s.activeBadgeText}>
            ⭐ {lang === 'lt' ? 'Aktyvus planas:' : 'Active plan:'} {currentSub.plan?.replace(/_/g, ' ').toUpperCase()}
          </Text>
          <TouchableOpacity onPress={handleCancel} style={s.cancelBtn}>
            <Text style={s.cancelBtnText}>{lang === 'lt' ? 'Atšaukti' : 'Cancel'}</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={s.toggleRow}>
        <TouchableOpacity
          style={[s.toggleBtn, interval === 'monthly' && s.toggleActive]}
          onPress={() => setInterval('monthly')}
        >
          <Text style={[s.toggleText, interval === 'monthly' && s.toggleActiveText]}>
            {lang === 'lt' ? 'Mėnesinis' : 'Monthly'}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[s.toggleBtn, interval === 'annual' && s.toggleActive]}
          onPress={() => setInterval('annual')}
        >
          <Text style={[s.toggleText, interval === 'annual' && s.toggleActiveText]}>
            {lang === 'lt' ? 'Metinis' : 'Annual'}
          </Text>
          <View style={s.saveBadge}>
            <Text style={s.saveBadgeText}>{lang === 'lt' ? 'Taupyk 30%' : 'Save 30%'}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {filteredPlans.map((plan: any) => {
        const color = getPlanColor(plan.role);
        const features = (lang === 'lt' ? PLAN_FEATURES_LT : PLAN_FEATURES)[plan.role] || [];
        const isCurrentPlan = currentSub?.plan === plan.id;
        const monthlyEquiv = interval === 'annual' ? (plan.price / 12).toFixed(2) : null;

        return (
          <View key={plan.id} style={[s.planCard, isCurrentPlan && { borderColor: color, borderWidth: 2 }]}>
            <View style={[s.planHeader, { backgroundColor: color }]}>
              <Text style={s.planLabel}>{getPlanLabel(plan.role)}</Text>
              <View style={s.priceRow}>
                <Text style={s.price}>€{plan.price}</Text>
                <Text style={s.pricePer}>/{interval === 'monthly' ? (lang === 'lt' ? 'mėn' : 'mo') : (lang === 'lt' ? 'metai' : 'yr')}</Text>
              </View>
              {monthlyEquiv && (
                <Text style={s.monthlyEquiv}>≈ €{monthlyEquiv}/{lang === 'lt' ? 'mėn' : 'mo'}</Text>
              )}
            </View>
            <View style={s.planBody}>
              {features.map((f, i) => (
                <View key={i} style={s.featureRow}>
                  <Text style={[s.featureCheck, { color }]}>✓</Text>
                  <Text style={s.featureText}>{f}</Text>
                </View>
              ))}
              {isCurrentPlan ? (
                <View style={[s.currentPlanBtn, { backgroundColor: color + '20' }]}>
                  <Text style={[s.currentPlanText, { color }]}>✓ {lang === 'lt' ? 'Dabartinis planas' : 'Current Plan'}</Text>
                </View>
              ) : (
                <TouchableOpacity
                  style={[s.subscribeBtn, { backgroundColor: color }]}
                  onPress={() => handleSubscribe(plan)}
                  disabled={loading === plan.id}
                >
                  {loading === plan.id
                    ? <ActivityIndicator color="#fff" />
                    : <Text style={s.subscribeBtnText}>{lang === 'lt' ? 'Prenumeruoti' : 'Subscribe'}</Text>}
                </TouchableOpacity>
              )}
            </View>
          </View>
        );
      })}

      <View style={s.freeCard}>
        <Text style={s.freeTitle}>{lang === 'lt' ? 'Nemokamas planas' : 'Free Plan'}</Text>
        <Text style={s.freeDesc}>
          {lang === 'lt'
            ? 'Skelbkite ir atlikite užduotis be prenumeratos. Pirmasis ateinanysis gauna užduotį.'
            : 'Post and complete tasks without a subscription. First-come-first-serve assignment.'}
        </Text>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#6B7280', marginBottom: 24 },
  activeBadge: { backgroundColor: '#F0FAFA', borderRadius: 12, padding: 14, marginBottom: 16, borderWidth: 1, borderColor: '#1FB6AE', flexDirection: 'row', justifyContent: 'space-between', alignItemeText: { fontSize: 14, fontWeight: '700', color: '#1FB6AE', flex: 1 },
  cancelBtn: { marginLeft: 8 },
  cancelBtnText: { color: '#EF4444', fontWeight: '600', fontSize: 13 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#F3F4F6', borderRadius: 12, padding: 4, marginBottom: 24 },
  toggleBtn: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, flexDirection: 'row', justifyContent: 'center', gap: 6 },
  toggleActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 2 },
  toggleText: { fontSize: 14, fontWeight: '600', color: '#6B7280' },
  toggleActiveText: { color: '#111827' },
  saveBadge: { backgroundColor: '#D1FAE5', borderRadius: 8, paddingHorizontal: 6, paddingVertical: 2 },
  saveBadgeText: { fontSize: 10, fontWeight: '700', color: '#065F46' },
  planCard: { backgroundColor: '#fff', borderRadius: 16, marginBottom: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
  planHeader: { padding: 20 },
  planLabel: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.85)', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 4 },
  price: { fontSize: 36, fontWeight: '800', color: '#fff' },
  pricePer: { fontSize: 16, color: 'rgba(255,255,255,0.8)', fontWeight: '500' },
  monthlyEquiv: { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4 },
  planBody: { padding: 20 },
  featureRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 10 },
  featureCheck: { fontSize: 16, fontWeight: '700', marginTop: 1 },
  featureText: { fontSize: 14, color: '#374151', flex: 1, lineHeight: 20 },
  subscribeBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  subscribeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  currentPlanBtn: { borderRadius: 12, padding: 14, alignItems: 'center', marginTop: 8 },
  currentPlanText: { fontWeight: '700', fontSize: 15 },
  freeCard: { backgroundColor: '#F9FAFB', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#E5E7EB' },
  freeTitle: { fontSize: 18, fontWeight: '700', color: '#6B7280', marginBottom: 6 },
  freeDesc: { fontSize: 14, color: '#9CA3AF', lineHeight: 20 },
});
