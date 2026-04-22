import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  TextInput, ActivityIndicator, Alert, Switch, KeyboardAvoidingView, Platform
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';
import client from '../../api/client';

const DAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const DAYS_LT = ['Sekmadienis', 'Pirmadienis', 'Antradienis', 'Trečiadienis', 'Ketvirtadienis', 'Penktadienis', 'Šeštadienis'];

interface Props {
  route: { params: { category: string } };
  navigation: any;
}

export default function RecurringPostScreen({ route, navigation }: Props) {
  const { category } = route.params;
  const { user } = useAuthStore();
  const { t, lang= useTranslation();
  const isLt = lang === 'lt';
  const DAYS = isLt ? DAYS_LT : DAYS_EN;

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: '',
    description: '',
    location: '',
    budget: '',
    frequency: 'weekly' as 'weekly' | 'biweekly' | 'monthly',
    dayOfWeek: 1,
    preferredTime: '09:00',
    occurrences: 4,
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    untilCancelled: false,
    notes: '',
  });

  const canRecurring = user?.isSubscriber &&
    (user?.subscriptionRole === 'task_maker' || user?.subscriptionRole === 'both');

  const getSummary = () => {
    if (!form.title || !form.budget) return null;
    const freqMap = { weekly: isLt ? 'Kas savaitę' : 'Weekly', biweekly: isLt ? 'Kas 2 sav.' : 'Biweekly', monthly: isLt ? 'Kas mėnesį' : 'Monthly' };
    return {
      freq: `${freqMap[form.frequency]} (${DAYS[form.dayOfWeek]})`,
      period: `${isLt ? 'Nuo' : 'From'} ${form.startDate}${form.untilCancelled ? ` ${isLt ? 'iki atšaukimo' : 'until cancelled'}` : form.endDate ? ` ${isLt ? 'iki' : 'to'} ${form.endDate}` : ''}`,
      price: `€${form.budget} ${isLt ? 'už kartą' : 'per occurrence'}`,
    };
  };

  const handleSubmit = async () => {
    if (!canRecurring) {
      Alert.alert(t('recurring.subscribersOnly'), t('recurring.upgradePro
        { text: t('common.cancel'), style: 'cancel' },
        { text: isLt ? 'Peržiūrėti planus' : 'View Plans', onPress: () => navigation.navigate('Subscription') }
      ]);
      return;
    }
    if (!form.title || !form.budget || !form.location) {
      return Alert.alert(t('common.error'), isLt ? 'Užpildykite visus privalomus laukus' : 'Please fill all required fields');
    }
    setLoading(true);
    try {
      await client.post('/api/recurring', { ...form, category });
      Alert.alert(isLt ? 'Sukurta!' : 'Created!', t('recurring.createBtn'), [
        { text: t('common.ok'), onPress: () => navigation.navigate('Profile') }
      ]);
    } catch (e: any) {
      const err = e?.response?.data?.error;
      if (err === 'recurring.notSubscriber') {
        Alert.alert(t('recurring.subscribersOnly'), t('recurring.notSubscriber'));
        navigation.navigate('Subscription');
      } else {
        Alert.alert(t('common.error'), e?.response?.data?.message || 'Failed');
      }
    } finally { setLoading(false); }
  };

  if (!canRecurring) {
    return (
      <View style={s.lockContainer}>
        <Text style={s.lockIcon}>🔒</Text>
        <Text style={s.lockTitle}>{t('recurring.subscribersOnly')}</Text>
        <Text style={s.lockDesc}>{t('recurring.subscribersOnlyDesc') || t('recurring.upgradePrompt')}</Text>
        <TouchableOpacity style={s.upgradeBtn} onPress={() => navigation.navigate('Subscription')}>
          <Text style={s.upgradeBtnText}>{isLt ? 'Peržiūrėti planus' : 'View Plans'}</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backLink}>
          <Text style={s.backLinkText}>{t('common.back')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const summary = getSummary();

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={s.container} contentContainerStyle={s.content}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={s.back}>{t('common.back')}</Text>
          </TouchableOpacity>
          <Text style={s.title}>🔄 {t('recurring.title')}</Text>
          <Text style={s.premiumBadge}>⭐ {t('recurring.premiumFeature')}</Text>
        </View>

        {/* Task Details */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>{t('recurring.taskDetails')}</Text>
          <Text style={s.label}>{isLt ? 'Pavadinimas' : 'Title'} *</Text>
          <TextInput st value={form.title} onChangeText={v => setForm(f => ({...f, title: v}))}
            placeholder={isLt ? 'pvz. Savaitinis valymas' : 'e.g. Weekly cleaning'} placeholderTextColor="#9CA3AF" />
          <Text style={s.label}>{isLt ? 'Aprašymas' : 'Description'} *</Text>
          <TextInput style={[s.input, { height: 100 }]} value={form.description}
            onChangeText={v => setForm(f => ({...f, description: v}))} multiline
            placeholder={isLt ? 'Ko jums reikia kiekvieną kartą...' : 'What you need each time...'} placeholderTextColor="#9CA3AF" />
          <Text style={s.label}>{isLt ? 'Vieta' : 'Location'} *</Text>
          <TextInput style={s.input} value={form.location} onChangeText={v => setForm(f => ({...f, location: v}))}
            placeholder={isLt ? 'pvz. Vilnius' : 'e.g. Vilnius'} placeholderTextColor="#9CA3AF" />
        </View>

        {/* Schedule */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>📅 {t('recurring.schedule')}</Text>

          <Text style={s.label}>{t('recurring.frequency')}</Text>
          <View style={s.row}>
            {(['weekly', 'biweekly', 'monthly'] as const).map(f => (
              <TouchableOpacity key={f} style={[s.chip, form.frequency === f && s.chipActive]}
                onPress={() => setForm(p => ({...p, frequency: f}))}>
                <Text style={[s.chipText, form.frequency === f && s.chipTextActive]}>
                  {t(`recurring.${f}`)}
                </Text>
              </TouchableOpacity>
            ))}
          </

          <Text style={s.label}>{t('recurring.dayOfWeek')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 16 }}>
            {DAYS.map((d, i) => (
              <TouchableOpacity key={i} style={[s.dayChip, form.dayOfWeek === i && s.chipActive]}
                onPress={() => setForm(p => ({...p, dayOfWeek: i}))}>
                <Text style={[s.chipText, form.dayOfWeek === i && s.chipTextActive]}>{d.slice(0, 3)}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          <View style={s.row}>
            <View style={{ flex: 1 }}>
              <Text style={s.label}>{t('recurring.startDate')}</Text>
              <TextInput style={s.input} value={form.startDate}
                onChangeText={v => setForm(p => ({...p, startDate: v}))}
                placeholder="YYYY-MM-DD" placeholderTextColor="#9CA3AF" keyboardType="numbers-and-punctuation" />
            </View>
            <View style={{ flex: 1, marginLeft: 8 }}>
              <Text style={s.label}>{t('recurring.preferredTime')}</Text>
              <TextInput style={s.input} value={form.preferredTime}
                onChangeText={v => setForm(p => ({...p, preferredTime: v}))}
                placeholder="09:00" placeholderTextColor="#9CA3AF" keyboardType="numbers-and-punctuation" />
            </View>
          </View>

          <View style={s.switchRow}>
            <Text style={s.label}>{t('recurring.untilCancelled')}</Text>
            <Switch value={form.untilCancelled} onValueChange={v => setForm(p => ({...p, untilCancelled: v, endDate: ''}))}
              trackColor={{ false: '#E5E7EB', true: '#7C3AED' }} thumbColor="#fff" />
          </View>

          {!form.untilCancelled && (
            <>
              <Text style={s.label}>{t('recurring.endDate')}</Text>
              <TextInput style={s.input} value={form.endDate}
                onChangeText={v => setForm(p => ({...p, endDate: v}))}
                placeholder="YYYY-MM-DD" placeholderTextColor="#9CA3AF" keyboardType="numbers-and-punctuation" />

              <Text style={s.label}>{t('recurring.occurrences')}</Text>
              <View style={s.row}>
                {[2, 4, 8, 12].map(n => (
                  <TouchableOpacity key={n} style={[s.chip, form.occurrences === n && s.chipActive]}
                    onPress={() => setForm(p => ({...p, occurrences: n}))}>
                    <Text style={[s.chipText, form.occurrences === n && s.chipTextActive]}>{n}x</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </>
          )}
        </View>

        {/* Price */}
        <View style={s.card}>
          <Text style={s.sectionTitle}>💶 {t('recurring.pricePerOccurrence')} *</Text>
          <View style={s.budgetRow}>
            <Text style={s.euroSign}>€</Text>
            <TextInput style={[s.input, { flex: 1 }]} value={form.budget}
              onChangeText={v => setForm(p => ({...p, budget: v}))}
              placeholder="0.00" placeholderTextColor="#9CA3AF" keyboardType="numeric" />
          </View>
          <Text style={s.hint}>💡 {t('recurring.paymentNote')}</Text>
        </View>

        {/* Notes */}
        <View style={s.card}>
          <Text style={s.label}>{t('recurring.notes')}</Text>
          <TextInput style={[s.input, { height: 80 }]} value={form.notes}
            onChangeText={v => setForm(f => ({...f, notes: v}))} multiline
            placeholder={isLt ? 'Papildoma informacija...' : 'Additional info...'} placeholderTextColor="#9CA3AF" />
        </View>

        {/* Summary */}
        {summary && (
          <View style={s.summaryCard}>
            <Text style={s.summaryTitle}>🔄 {t('recurring.summary')}</Text>
            <View style={s.summaryRow}><Text style={s.summaryIcon}>📋</Text><Text style={s.summaryText}>{form.title}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryIcon}>🔄</Text><Text style={s.summaryText}>{summary.freq}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryIcon}>📅</Text><Text style={s.summaryText}>{summary.period}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryIcon}>💶</Text><Text style={s.summaryText}>{summary.price}</Text></View>
            <View style={s.summaryRow}><Text style={s.summaryIcon}>💳</Text><Text style={s.summaryText}>{t('recurring.paymentNote')}</Text></View>
          </View>
        )}

        <TouchableOpacity style={s.submitBtn} onPress={handleSubmit} disabled={loading}>
          {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.submitBtnText}>🔄 {t('recurring.createBtn')}</Text>}
        </TouchableOpacity>
        <View style={{ height: 40 }} />
      </ScrollView>
    </KeyboardAvoidingVie StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  content: { padding: 16 },
  lockContainer: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: '#F7F9FB' },
  lockIcon: { fontSize: 56, marginBottom: 16 },
  lockTitle: { fontSize: 22, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  lockDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', lineHeight: 20, marginBottom: 24 },
  upgradeBtn: { backgroundColor: '#7C3AED', borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, marginBottom: 12 },
  upgradeBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  backLink: { padding: 8 },
  backLinkText: { color: '#6B7280', fontSize: 14 },
  header: { marginBottom: 16 },
  back: { color: '#1FB6AE', fontWeight: '600', fontSize: 15, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: '#111827', marginBottom: 4 },
  premiumBadge: { fontSize: 12, color: '#7C3AED', fontWeight: '600' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6, marginTop: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 15, color: '#111827', backgroundColor: '#F9FAFB', marginBottom: 4 },
  row: { flexDirection: 'row', gap: 8, marginBottom: 8 },
  chip: { flex: 1, paddingVertical: 10, alignItems: 'center', borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB' },
  chipActive: { backgroundColor: '#7C3AED', borderColor: '#7C3AED' },
  chipText: { fontSize: 12, fontWeight: '600', color: '#374151' },
  chipTextActive: { color: '#fff' },
  dayChip: { paddingVertical: 8, paddingHorizontal: 12, borderRadius: 10, backgroundColor: '#F3F4F6', borderWidth: 1.5, borderColor: '#E5E7EB', marginRight: 6 },
  switchRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginVertical: 8 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  euroSign: { fontSize: 22, fontWeight: '700', color: '#7C3AED' },
  hint: { fontSize: 12, color: '#6B7280', marginTop: 4, lineHeight: 18 },
  summaryCard: { backgroundColor: '#F5F3FF', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#C4B5FD' },
  summaryTitle: { fontSize: 16, fontWeight: '700', color: '#5B21B6', marginBottom: 12 },
  summaryRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  summaryIcon: { fontSize: 16, marginTop: 1 },
  summaryText: { fontSize: 13, color: '#374151', flex: 1, lineHeight: 18 },
  submitBtn: { backgroundColor: '#7C3AED', borderRadius: 14, padding: 16, alignItems: 'center' },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 16 },
});
