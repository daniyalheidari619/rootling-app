import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator } from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import { useQuery, useMutation } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

export default function AmbassadorScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const isLt = lang === 'lt';
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ambassador'],
    queryFn: async () => {
      const { data } = await client.get('/api/ambassador/dashboard');
      return data;
    },
  });

  const register = useMutation({
    mutationFn: async () => {
      const { data } = await client.post('/api/ambassador/upgrade', { email: user?.email, password, inviteCode: code.toUpperCase() });
      return data;
    },
    onSuccess: () => { refetch(); Alert.alert(isLt ? 'Sėkmė' : 'Success', isLt ? 'Tapote ambasadoriumi!' : 'You are now an ambassador!'); },
    onError: (e: any) => Alert.alert('Error', e?.response?.data?.message || 'Failed'),
  });

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>;

  const isAmbassador = data?.isAmbassador || user?.isAmbassador;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'Ambasadorių programa' : 'Ambassador Program'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {!isAmbassador ? (
          <View style={s.card}>
            <Text style={s.cardTitle}>{isLt ? 'Tapkite ambasadoriumi' : 'Become an Ambassador'}</Text>
            <Text style={s.desc}>{isLt ? 'Dalinkitės Root-ling su draugais ir uždirbkite 3% nuo kiekvienos užduoties, kuriai naudojamas jūsų kodas.' : 'Share Root-ling with friends and earn 3% from every task using your promo code.'}</Text>
            <Text style={s.label}>{isLt ? 'Pasirinkite savo kodą' : 'Choose your code'}</Text>
            <TextInput
              style={s.input}
              value={code}
              onChangeText={setCode}
              placeholder={isLt ? 'Įveskite pakvietimo kodą' : 'Enter invite code'}
              autoCapitalize="characters"
              placeholderTextColor="#9CA3AF"
            />
            <Text style={s.label}>{isLt ? 'Slaptažodis' : 'Password'}</Text>
            <TextInput
              style={s.input}
              value={password}
             onChangeText={setPassword}
              placeholder={isLt ? 'Jūsų slaptažodis' : 'Your password'}
              secureTextEntry
              placeholderTextColor="#9CA3AF"
            />
            <TouchableOpacity style={s.btn} onPress={() => register.mutate()} disabled={!code || !password || register.isPending}>
              <Text style={s.btnText}>{register.isPending ? '...' : (isLt ? 'Registruotis' : 'Register')}</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <>
            <View style={s.card}>
              <Text style={s.cardTitle}>{isLt ? 'Jūsų promo kodas' : 'Your Promo Code'}</Text>
              <TouchableOpacity style={s.codeBox} onPress={() => { Clipboard.setString(data?.code || ''); Alert.alert(isLt ? 'Nukopijuota' : 'Copied'); }}>
                <Text style={s.code}>{data?.code || user?.ambassadorCode}</Text>
                <Text style={s.copyHint}>{isLt ? 'Palieskite kopijuoti' : 'Tap to copy'}</Text>
              </TouchableOpacity>
            </View>
            <View style={s.card}>
              <Text style={s.cardTitle}>{isLt ? 'Pajamos' : 'Earnings'}</Text>
              <View style={s.statRow}>
                <View style={s.stat}>
                  <Text style={s.statValue}>€{(data?.totalEarnings || 0).toFixed(2)}</Text>
                  <Text style={s.statLabel}>{isLt ? 'Viso uždirbta' : 'Total earned'}</Text>
                </View>
                <View style={s.stat}>
                  <Text style={s.statValue}>{data?.totalUses || 0}</Text>
                  <Text style={s.statLabel}>{isLt ? 'Kodo naudojimai' : 'Code uses'}</Text>
                </View>
              </View>
            </View>
            <View style={s.infoCard}>
              <Text style={s.infoTitle}>ℹ️ {isLt ? 'Kaip veikia' : 'How it works'}</Text>
              <Text style={s.infoText}>{isLt ? 'Kai kas nors naudoja jūsų kodą skelbdamas užduotį, jūs gaunate 3% nuo tos užduoties biudžeto.' : 'When someone uses your code when posting a task, you earn 3% of that task budget.'}</Text>
            </View>
          </>
        )}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 20, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  cardTitle: { fontSize: 16, fontWeight: '800', color: '#111827', marginBottom: 12 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 20, marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 8 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, padding: 12, fontSize: 16, color: '#111827', marginBottom: 16, fontWeight: '700', letterSpacing: 2 },
  btn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 14, alignItems: 'center' },
  btnText: { color: '#fff', fontWeight: '800', fontSize: 15 },
  codeBox: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 20, alignItems: 'center', borderWidth: 2, borderColor: '#1FB6AE', borderStyle: 'dashed' },
  code: { fontSize: 28, fontWeight: '900', color: '#1FB6AE', letterSpacing: 4 },
  copyHint: { fontSize: 11, color: '#6B7280', marginTop: 4 },
  statRow: { flexDirection: 'row', gap: 16 },
  stat: { flex: 1, backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: '900', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  infoCard: { backgroundColor: '#EFF6FF', borderRadius: 16, padding: 16, marginBottom: 16 },
  infoTitle: { fontSize: 14, fontWeight: '700', color: '#1E40AF', marginBottom: 8 },
  infoText: { fontSize: 13, color: '#3B82F6', lineHeight: 18 },
});
