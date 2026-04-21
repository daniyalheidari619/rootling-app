import { anonName, anonAvatar } from '../../utils/anonName';
import { useTranslation } from '../../i18n';
import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function MessagesScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const { data, isLoading } = useQuery({
    queryKey: ['conversations'],
    queryFn: async () => {
      const { data } = await client.get('/api/messages/conversations');
      return data.conversations || [];
    },
    enabled: !!user,
    refetchInterval: 15000,
  });

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>{t('auth.signInMessages')}</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Profile')}>
        <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>;

  if (!data?.length) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>💬</Text>
        <Text style={styles.emptyTitle}>{t('messages.noConversations')}</Text>
        <Text style={styles.emptySub}>{t('messages.applyToStart')}</Text>
      </View>
    );
  }

  const renderItem = ({ item }: any) => {
    const otherUser = item.senderId === user.id ? item.receiver : item.sender;
    const mins = Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000);
    const timeAgo = mins < 60 ? `${mins}m` : mins < 1440 ? `${Math.floor(mins/60)}h` : `${Math.floor(mins/1440)}d`;
    return (
      <TouchableOpacity style={styles.item} onPress={() => navigation.navigate('ChatScreen', { taskId: item.taskId, otherUser })}>
        <View style={styles.avatar}><Text style={styles.avatarText}>{anonAvatar(otherUser?.name)}</Text></View>
        <View style={styles.itemContent}>
          <View style={styles.itemHeader}>
            <Text style={styles.itemName}>{anonName(otherUser?.name, 'tasker')}</Text>
            <Text style={styles.itemTime}>{timeAgo}</Text>
          </View>
          <Text style={styles.itemTask} numberOfLines={1}>📋 {item.task?.title || 'Task'}</Text>
          <Text style={styles.itemMessage} numberOfLines={1}>{item.content}</Text>
        </View>
        {!item.read && item.receiverId === user.id && <View style={styles.unreadDot} />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}><Text style={styles.headerTitle}>{t('messages.title')}</Text></View>
      <FlatList data={data} keyExtractor={(item) => item.id} renderItem={renderItem} contentContainerStyle={{ paddingBottom: 20 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
  btn: { marginTop: 20, backgroundColor: '#1FB6AE', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700' },
  item: { flexDirection: 'row', padding: 16, backgroundColor: '#fff', marginHorizontal: 16, marginTop: 8, borderRadius: 14, alignItems: 'center', gap: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1FB6AE', justifyContent: 'center', alignItems: 'center' },
  avatarText: { color: '#fff', fontSize: 18, fontWeight: '700' },
  itemContent: { flex: 1 },
  itemHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  itemName: { fontSize: 15, fontWeight: '700', color: '#111827' },
  itemTime: { fontSize: 12, color: '#9CA3AF' },
  itemTask: { fontSize: 12, color: '#1FB6AE', marginBottom: 2 },
  itemMessage: { fontSize: 13, color: '#6B7280' },
  unreadDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#1FB6AE' },
});
