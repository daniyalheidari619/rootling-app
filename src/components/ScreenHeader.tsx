import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../store/authStore';
import client from '../api/client';

interface Props {
  title: string;
  navigation: any;
  rightComponent?: React.ReactNode;
}

export default function ScreenHeader({ title, navigation, rightComponent }: Props) {
  const { user } = useAuthStore();

  const { data } = useQuery({
    queryKey: ['notifCount'],
    queryFn: async () => {
      const { data } = await client.get('/api/notifications');
      return data.unreadCount || 0;
    },
    enabled: !!user,
    refetchInterval: 60000,
  });

  const unread = data || 0;

  return (
    <View style={s.header}>
      <Text style={s.title}>{title}</Text>
      <View style={s.right}>
        {rightComponent}
        <TouchableOpacity onPress={() => navigation.navigate('Notifications')} style={s.bell}>
          <Text style={s.bellIcon}>🔔</Text>
          {unread > 0 && (
            <View style={s.badge}>
              <Text style={s.badgeText}>{unread > 9 ? '9+' : unread}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  title: { fontSize: 28, fontWeight: '800', color: '#111827' },
  right: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  bell: { position: 'relative', padding: 4 },
  bellIcon: { fontSize: 24 },
  badge: { position: 'absolute', top: 0, right: 0, backgroundColor: '#EF4444', borderRadius: 8, minWidth: 16, height: 16, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 2 },
  badgeText: { color: '#fff', fontSize: 9, fontWeight: '800' },
});
