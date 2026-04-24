import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';
import { useTranslation } from '../../i18n';

const STATUS_FILTERS = ['ALL', 'ACTIVE', 'PENDING', 'COMPLETED', 'RECURRING'];

export default function MyTasksScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const isLt = lang === 'lt';
  const [roleFilter, setRoleFilter] = useState<'ALL' | 'POSTED' | 'ACCEPTED'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const { data: tasks = [], isLoading, refetch } = useQuery({
    queryKey: ['myTasks', user?.id],
    queryFn: async () => {
      const { data } = await client.get('/api/tasks/my-tasks');
      return data.tasks || data.data || [];
    },
    enabled: !!user,
  });

  const filtered = tasks.filter((task: any) => {
    const roleMatch = roleFilter === 'ALL' ? true :
      roleFilter === 'POSTED' ? task.clientId === user?.id :
      task.taskerId === user?.id;
    const statusMatch = statusFilter === 'ALL' ? true :
      statusFilter === 'ACTIVE' ? ['OPEN', 'ASSIGNED', 'IN_PROGRESS'].includes(task.status) :
      statusFilter === 'PENDING' ? task.status === 'PENDING_PAYMENT' :
      statusFilter === 'COMPLETED' ? task.status === 'COMPLETED' :
      statusFilter === 'RECURRING' ? task.source === 'RECURRING' : true;
    return roleMatch && statusMatch;
  });

  const getStatusColor = (status: string) => {
    const colors: any = {
      OPEN: '#10B981', ASSIGNED: '#3B82F6', IN_PROGRESS: '#8B5CF6',
      COMPLETED: '#6B7280', CANCELLED: '#EF4444', PENDING_PAYMENT: '#F59E0B',
    };
    return colors[status] || '#6B7280';
  };

  const getStatusLabel = (status: string) => {
    if (isLt) {
      const lt: any = { OPEN: 'Atvira', ASSIGNED: 'Priskirta', IN_PROGRESS: 'Vykdoma',
        COMPLETED: 'Atlikta', CANCELLED: 'Atšaukta', PENDING_PAYMENT: 'Laukia mokėjimo' };
      return lt[status] || status;
    }
    return status.replace(/_/g, ' ');
  };

  const renderTask = ({ item }: any) => (
    <TouchableOpacity style={s.card} onPress={() => navigation.navigate('TaskDetail', { task: item })}>
      <View style={s.cardHeader}>
        <Text style={s.taskTitle} numberOfLines={1}>{item.title}</Text>
        <View style={[s.statusBadge, { backgroundColor: getStatusColor(item.status) + '20' }]}>
          <Text style={[s.statusText, { color: getStatusColor(item.status) }]}>{getStatusLabel(item.status)}</Text>
        </View>
      </View>
      <Text style={s.category}>{item.category?.replace(/-/g, ' ').toUpperCase()}</Text>
      <View style={s.cardFooter}>
        <Text style={s.budget}>€{item.budget?.toFixed(2)}</Text>
        <Text style={s.role}>{item.clientId === user?.id ? (isLt ? 'Mano užduotis' : 'My task') : (isLt ? 'Priskirta man' : 'Assigned to me')}</Text>
      </View>
      {item.status === 'PENDING_PAYMENT' && (
        <TouchableOpacity style={s.payBtn} onPress={() => navigation.navigate('Payment', { taskId: item.id })}>
          <Text style={s.payBtnText}>{isLt ? 'Sumokėti' : 'Complete Payment'}</Text>
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <Text style={s.title}>{isLt ? 'Mano užduotys' : 'My Tasks'}</Text>
      </View>

      <View style={s.filterRow}>
        {(['ALL', 'POSTED', 'ACCEPTED'] as const).map(f => (
          <TouchableOpacity key={f} style={[s.filterBtn, roleFilter === f && s.filterActive]} onPress={() => setRoleFilter(f)}>
            <Text style={[s.filterText, roleFilter === f && s.filterTextActive]}>
              {f === 'ALL' ? (isLt ? 'Visos' : 'All') : f === 'POSTED' ? (isLt ? 'Paskelbtos' : 'Posted') : (isLt ? 'Priimtos' : 'Accepted')}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={s.statusRow}>
        {STATUS_FILTERS.map(f => (
          <TouchableOpacity key={f} style={[s.statusBtn, statusFilter === f && s.statusActive]} onPress={() => setStatusFilter(f)}>
            <Text style={[s.statusBtnText, statusFilter === f && s.statusTextActive]}>{f === 'ALL' ? (isLt ? 'Visos' : 'All') : f === 'ACTIVE' ? (isLt ? 'Aktyvios' : 'Active') : f === 'PENDING' ? (isLt ? 'Laukia' : 'Pending') : f === 'COMPLETED' ? (isLt ? 'Atliktos' : 'Done') : '🔄'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {isLoading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Text style={s.empty}>{isLt ? 'Nėra užduočių' : 'No tasks found'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={i => i.id}
          renderItem={renderTask}
          contentContainerStyle={{ padding: 16 }}
          refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} />}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  title: { fontSize: 24, fontWeight: '800', color: '#111827' },
  filterRow: { flexDirection: 'row', padding: 12, gap: 8, backgroundColor: '#fff' },
  filterBtn: { flex: 1, paddingVertical: 8, borderRadius: 10, backgroundColor: '#F3F4F6', alignItems: 'center' },
  filterActive: { backgroundColor: '#1FB6AE' },
  filterText: { fontSize: 13, fontWeight: '600', color: '#6B7280' },
  filterTextActive: { color: '#fff' },
  statusRow: { flexDirection: 'row', paddingHorizontal: 12, paddingBottom: 8, gap: 6, backgroundColor: '#fff' },
  statusBtn: { paddingVertical: 6, paddingHorizontal: 10, borderRadius: 8, backgroundColor: '#F3F4F6' },
  statusActive: { backgroundColor: '#111827' },
  statusBtnText: { fontSize: 11, fontWeight: '600', color: '#6B7280' },
  statusTextActive: { color: '#fff' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  taskTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: '#111827', marginRight: 8 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusText: { fontSize: 11, fontWeight: '700' },
  category: { fontSize: 11, color: '#9CA3AF', marginBottom: 8 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  budget: { fontSize: 18, fontWeight: '800', color: '#1FB6AE' },
  role: { fontSize: 12, color: '#6B7280' },
  payBtn: { marginTop: 12, backgroundColor: '#F59E0B', borderRadius: 10, padding: 10, alignItems: 'center' },
  payBtnText: { color: '#fff', fontWeight: '700', fontSize: 13 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  empty: { fontSize: 16, color: '#9CA3AF' },
});
