import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, Alert, Image } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { useTranslation } from '../../i18n';
import { anonName, anonAvatar } from '../../utils/anonName';

export default function ApplicationsScreen({ route, navigation }: any) {
  const { task } = route.params;
  const { lang } = useTranslation();
  const queryClient = useQueryClient();

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['applications', task.id],
    queryFn: async () => {
      const { data } = await client.get(`/api/tasks/${task.id}/applications`);
      return data.data || [];
    },
  });

  const accept = useMutation({
    mutationFn: async (applicationId: string) => {
      await client.post(`/api/tasks/${task.id}/applications/${applicationId}/accept`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applications', task.id] });
      Alert.alert(
        lang === 'lt' ? 'Priimta!' : 'Accepted!',
        lang === 'lt' ? 'Vykdytojas priskirtas užduočiai.' : 'Tasker has been assigned to the task.'
      );
      navigation.goBack();
    },
  });

  const reject = useMutation({
    mutationFn: async (applicationId: string) => {
      await client.post(`/api/tasks/${task.id}/applications/${applicationId}/reject`);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['applications', task.id] }),
  });

  const getStatusColor = (s: string) => ({ PENDING: '#F59E0B', ACCEPTED: '#10B981', REJECTED: '#EF4444' } as any)[s] || '#6B7280';
  const getStatusLabel = (s: string) => lang === 'lt'
    ? ({ PENDING: 'Laukiama', ACCEPTED: 'Priimta', REJECTED: 'Atmesta' } as any)[s] || s
    : s;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← {lang === 'lt' ? 'Atgal' : 'Back'}</Text>
        </TouchableOpacity>
        <Text style={s.title}>{lang === 'lt' ? 'Paraiškos' : 'Applications'}</Text>
        <Text style={s.count}>{applications.length}</Text>
      </View>

      <Text style={s.taskTitle} numberOfLines={2}>{task.title}</Text>

      {isLoading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>
      ) : applications.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>📋</Text>
          <Text style={s.emptyTitle}>{lang === 'lt' ? 'Dar nėra paraiškų' : 'No applications yet'}</Text>
          <Text style={s.emptySub}>{lang === 'lt' ? 'Vykdytojai dar nesikreipė dėl šios užduoties.' : 'No taskers have applied yet.'}</Text>
        </View>
      ) : (
        <FlatList
          data={applications}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16 }}
          renderItem={({ item }: any) => (
            <View style={s.card}>
              <View style={s.applicantRow}>
                <View style={s.avatar}>
                  {item.applicant?.profilePhoto
                    ? <Image source={{ uri: item.applicant.profilePhoto }} style={s.avatarImg} />
                    : <Text style={s.avatarText}>{anonAvatar(item.applicant?.name)}</Text>}
                </View>
                <View style={s.applicantInfo}>
                  <Text style={s.applicantName}>{anonName(item.applicant?.name, 'tasker')}</Text>
                  <View style={s.statsRow}>
                    {item.applicant?.taskerRating > 0 && (
                      <Text style={s.stat}>★ {item.applicant.taskerRating.toFixed(1)}</Text>
                    )}
                    <Text style={s.stat}>✓ {item.applicant?.completedTasksCount || 0} {lang === 'lt' ? 'užduotys' : 'tasks'}</Text>
                    {item.applicant?.idVerificationStatus === 'VERIFIED' && (
                      <Text style={s.verified}>🔒 {lang === 'lt' ? 'Patvirtintas' : 'Verified'}</Text>
                    )}
                  </View>
                </View>
                <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
                  <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
                </View>
              </View>

              <View style={s.priceRow}>
                <Text style={s.priceLabel}>{lang === 'lt' ? 'Pasiūlyta kaina:' : 'Proposed price:'}</Text>
                <Text style={s.price}>€{item.proposedPrice}</Text>
              </View>

              {item.message && (
                <Text style={s.message} numberOfLines={3}>{item.message}</Text>
              )}

              {item.estimatedDuration && (
                >⏱ {item.estimatedDuration}</Text>
              )}

              {item.status === 'PENDING' && (
                <View style={s.actions}>
                  <TouchableOpacity
                    style={s.rejectBtn}
                    onPress={() => Alert.alert(
                      lang === 'lt' ? 'Atmesti?' : 'Reject?',
                      '',
                      [{ text: lang === 'lt' ? 'Ne' : 'No', style: 'cancel' },
                       { text: lang === 'lt' ? 'Taip' : 'Yes', style: 'destructive', onPress: () => reject.mutate(item.id) }]
                    )}
                  >
                    <Text style={s.rejectText}>{lang === 'lt' ? '✕ Atmesti' : '✕ Reject'}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={s.acceptBtn}
                    onPress={() => Alert.alert(
                      lang === 'lt' ? 'Priimti?' : 'Accept?',
                      lang === 'lt' ? 'Ar norite priskirti šį vykdytoją?' : 'Assign this tasker to your task?',
                      [{ text: lang === 'lt' ? 'Ne' : 'No', style: 'cancel' },
                       { text: lang === 'lt' ? 'Taip' : 'Yes', onPress: () => accept.mutate(item.id) }]
                    )}
                  >
                    <Text style={s.acceptText}>{lang === 'lt' ? '✓ Priimti' : '✓ Accept'}</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8, gap: 12 },
  back: { color: '#1FB6AE', fontWeight: '600', fontSize: 16 },
  title: { flex: 1, fontSize: 20, fontWeight: '800', color: '#111827' },
  count: { backgroundColor: '#1FB6AE', color: '#fff', fontWeight: '700', fontSize: 13, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  taskTitle: { fontSize: 14, color: '#6B7280', paddingHorizontal: 20, paddingBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  applicantRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 12 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1FB6AE', justifyContent: 'center', alignItems: 'center', overflow: 'hidden' },
  avatarImg: { width: 48, height: 48 },
  avatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  applicantInfo: { flex: 1 },
  applicantName: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 4 },
  statsRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  stat: { fontSize: 12, color: '#6B7280' },
  verified: { fontSize: 12, color: '#1FB6AE', fontWeight: '600' },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  priceRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  priceLabel: { fontSize: 13, color: '#6B7280' },
  price: { fontSize: 20, fontWeight: '800', color: '#1FB6AE' },
  message: { fontSize: 13, color: '#374151', lineHeight: 18, marginBottom: 8, fontStyle: 'italic' },
  duration: { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 4 },
  rejectBtn: { flex: 1, borderWidth: 2, borderColor: '#EF4444', borderRadius: 10, padding: 12, alignItems: 'center' },
  rejectText: { color: '#EF4444', fontWeight: '700', fontSize: 14 },
  acceptBtn: { flex: 2, backgroundColor: '#10B981', borderRadius: 10, padding: 12, alignItems: 'center' },
  acceptText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
