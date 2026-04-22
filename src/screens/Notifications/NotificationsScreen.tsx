import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

export default function NotificationsScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const queryClient = useQueryClient();

  const { data: notifications = [], isLoading } = useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const { data } = await client.get('/api/notifications');
      return data.notifications || data.data || data || [];
    },
    enabled: !!user,
    refetchInterval: 30000,
  });

  const markRead = useMutation({
    mutationFn: async (id: string) => { await client.put(`/api/notifications/${id}/read`); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const markAllRead = useMutation({
    mutationFn: async () => { await client.put('/api/notifications/mark-all-read'); },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['notifications'] }),
  });

  const getIcon = (type: string) => ({ APPLICATION: '✅', MESSAGE: '💬', PAYMENT: '💳', REVIEW: '⭐', TASK_ASSIGNED: '🎯', TASK_COMPLETED: '✓', NEGOTIATION: '💬', SYSTEM: 'ℹ️', VERIFICATION: '🔒' } as any)[type] || '🔔';

  if (!user) return <View style={s.center}><Text style={s.emptyIcon}>🔔</Text><Text style={s.emptyTitle}>{lang === 'lt' ? 'Prisijunkite norėdami matyti pranešimus' : 'Sign in to view notifications'}</Text></View>;
  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>;

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>{lang === 'lt' ? 'Pranešimai' : 'Notifications'}</Text>
        {unread > 0 && <TouchableOpacity onPress={() => markAllRead.mutate()}><Text style={s.markAll}>{lang === 'lt' ? 'Pažymėti visus' : 'Mark all read'}</Text></TouchableOpacity>}
      </View>
      {notifications.length === 0 ? (
        <View style={s.center}>
          <Text style={s.emptyIcon}>🔔</Text>
          <Text style={s.emptyTitle}>{lang === 'lt' ? 'Nėra pranešimų' : 'No notifications'}</Text>
          <Text style={s.emptySub}>{lang === 'lt' ? 'Čia pasirodys jūsų pranešimai' : 'Your notifications will appear here'}</Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ paddingBottom: 20 }}
          renderItem={({ item }: any) => (
            <TouchableOpacity
              style={[s.item, !item.read && s.itemUnread]}
              onPress={() => { if (!item.read) markRead.mutate(item.id); if (item.data?.taskId) navigation.navigate('TaskDetail', { task: { id: item.data.taskId } }); }}
            >
              <Text style={s.itemIcon}>{getIcon(item.type)}</Text>
              <View style={s.itemContent}>
                <Text style={s.itemTitle}>{item.title}</Text>
                <Text style={s.itemMessage} numberOfLines={2}>{item.message}</Text>
                <Text style={s.itemTime}>{new Date(item.createdAt).toLocaleDateString(lang === 'lt' ? 'lt-LT' : 'en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}</Text>
              </View>
              {!item.read && <View style={s.unreadDot} />}
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
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  markAll: { fontSize: 13, color: '#1FB6AE', fontWeight: '600' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 8, textAlign: 'center' },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  item: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 14, alignItems: 'flex-start', gap: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  itemUnread: { backgroundColor: '#F0FAFA', borderColor: '#1FB6AE' },
  itemIcon: { fontSize: 24, marginTop: 2 },
  itemContent: { flex: 1 },
  itemTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 2 },
  itemMessage: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 4 },
  itemTime: { fontSize: 11, color: '#9CA3AF' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1FB6AE', marginTop: 4 },
});
