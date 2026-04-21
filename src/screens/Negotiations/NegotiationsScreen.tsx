import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

export default function NegotiationsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const queryClient = useQueryClient();

  const { data: negotiations = [], isLoading } = useQuery({
    queryKey: ['negotiations'],
    queryFn: async () => {
      const { data } = await client.get('/api/my-negotiations');
      return data.negotiations || data.data || [];
    },
    enabled: !!user,
  });

  const withdraw = useMutation({
    mutationFn: async (id: string) => { await client.delete(`/api/negotiations/${id}`); },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['negotiations'] }); Alert.alert(lang === 'lt' ? 'Atšaukta' : 'Withdrawn'); },
  });

  const getStatusColor = (s: string) => ({ PENDING: '#F59E0B', ACCEPTED: '#10B981', REJECTED: '#EF4444', EXPIRED: '#6B7280', WITHDRAWN: '#9CA3AF' } as any)[s] || '#6B7280';
  const getStatusLabel = (s: string) => lang === 'lt' ? ({ PENDING: 'Laukiama', ACCEPTED: 'Priimta', REJECTED: 'Atmesta', EXPIRED: 'Pasibaigė', WITHDRAWN: 'Atšaukta' } as any)[s] || s : s;

  if (!user) return <View style={s.center}><Text style={s.emptyIcon}>💬</Text><Text style={s.emptyTitle}>{lang === 'lt' ? 'Prisijunkite' : 'Sign in'}</Text></View>;
  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>;

  return (
    <View style={s.container}>
      <View style={s.header}><Text style={s.title}>{lang === 'lt' ? 'Mano pasiūlymai' : 'My Offers'}</Text></View>
      {negotiations.length === 0 ? (
        <View st.center}>
          <Text style={s.emptyIcon}>💬</Text>
          <Text style={s.emptyTitle}>{lang === 'lt' ? 'Nėra pasiūlymų' : 'No offers yet'}</Text>
          <Text style={s.emptySub}>{lang === 'lt' ? 'Čia pasirodys jūsų kainos pasiūlymai' : 'Your price offers will appear here'}</Text>
        </View>
      ) : (
        <FlatList
          data={negotiations}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: any) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('TaskDetail', { task: { id: item.task?.id } })}>
              <View style={s.cardHeader}>
                <Text style={s.taskTitle} numberOfLines={1}>{item.task?.title}</Text>
                <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                </Vi         </View>
              <View style={s.priceRow}>
                <View><Text style={s.priceLabel}>{lang === 'lt' ? 'Pradinė' : 'Original'}</Text><Text style={s.priceOld}>€{item.originalPrice}</Text></View>
                <Text style={s.arrow}>→</Text>
                <View><Text style={s.priceLabel}>{lang === 'lt' ? 'Pasiūlymas' : 'Offer'}</Text><Text style={s.priceNew}>€{item.proposedPrice}</Text></View>
              </View>
              {item.message && <Text style={s.message} numberOfLines={2}>{item.message}</Text>}
              {item.clientResponse && <View style={s.responseBox}><Text style={s.responseLabel}>{lang === 'lt' ? 'Atsakymas:' : 'Response:'}</Text><Text style={s.responseText}>{item.clientResponse}</Text></View>}
              <View style={s.footer}>
                <Text style={s.time}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                {item.status === 'PENDING' && (
                  <TouchableOpacity onPress={() => Alert.alert(lang === 'lt' ? 'Atšaukti?' : 'Withdraw?', '', [
                    { text: lang === 'lt' ? 'Ne' : 'No', style: 'cancel' },
                    { text: lang === 'lt' ? 'Taip' : 'Yes', style: 'destructive', onPress: () => withdraw.mutate(item.id) }
                  ])}>
                    <Text style={s.withdrawBtn}>{lang === 'lt' ? 'Atšaukti' : 'Withdraw'}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  taskTitle: { fontSize: 15, fontWeight: '700', color: '#111827', flex: 1, marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'center', gap: 16, marginBottom: 8 },
el: { fontSize: 11, color: '#9CA3AF', marginBottom: 2 },
  priceOld: { fontSize: 16, fontWeight: '600', color: '#6B7280' },
  priceNew: { fontSize: 20, fontWeight: '800', color: '#1FB6AE' },
  arrow: { fontSize: 20, color: '#9CA3AF' },
  message: { fontSize: 13, color: '#6B7280', fontStyle: 'italic', marginBottom: 8 },
  responseBox: { backgroundColor: '#F0FAFA', borderRadius: 8, padding: 10, marginBottom: 8 },
  responseLabel: { fontSize: 11, fontWeight: '700', color: '#1FB6AE', marginBottom: 2 },
  responseText: { fontSize: 13, color: '#374151' },
  footer: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  time: { fontSize: 12, color: '#9CA3AF' },
  withdrawBtn: { fontSize: 13, color: '#EF4444', fontWeight: '600' },
});
