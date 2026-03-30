import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { task: initialTask } = route.params;
  const { user } = useAuthStore();
  const [applying, setApplying] = useState(false);

  const { data: task = initialTask } = useQuery({
    queryKey: ['task', initialTask.id],
    queryFn: async () => {
      const { data } = await client.get(`/api/tasks/${initialTask.id}`);
      return data.task || data;
    },
    initialData: initialTask,
  });

  const handleApply = async () => {
    if (!user) return navigation.navigate('Login');
    setApplying(true);
    try {
      await client.post(`/api/tasks/${task.id}/interest`);
      Alert.alert('Interest Sent!', 'The client will be notified of your interest.');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send interest');
    } finally {
      setApplying(false);
    }
  };

  const handleMessage = () => {
    if (!user) return navigation.navigate('Login');
    navigation.navigate('ChatScreen', { taskId: task.id, otherUser: task.client });
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{task.category?.replace(/-/g, ' ').toUpperCase()}</Text>
          </View>
          <Text style={styles.price}>€{task.budget}</Text>
          <Text style={styles.title}>{task.title}</Text>
          {task.priority === 'HIGH' && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>⭐ Priority Task</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          {task.distance && <View style={styles.metaItem}><Text style={styles.metaText}>📍 {task.distance.toFixed(1)} km away</Text></View>}
          <View style={styles.metaItem}><Text style={styles.metaText}>📅 {formatDate(task.createdAt)}</Text></View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Description</Text>
          <Text style={styles.description}>{task.description}</Text>
        </View>
        {task.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Location</Text>
            <View style={styles.locationBox}><Text style={styles.locationText}>📍 {task.location}</Text></View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>About the Client</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>{task.client?.name?.[0]?.toUpperCase() || '?'}</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{task.client?.name || 'Anonymous'}</Text>
              {task.client?.clientRating > 0 && <Text style={styles.clientRating}>★ {task.client.clientRating.toFixed(1)}</Text>}
              {task.client?.idVerificationStatus === 'VERIFIED' && <Text style={styles.verifiedBadge}>✓ ID Verified</Text>}
            </View>
          </View>
        </View>
        <View style={styles.trustRow}>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>🔒</Text><Text style={styles.trustText}>Payment Protected</Text></View>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>Secure Platform</Text></View>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>⭐</Text><Text style={styles.trustText}>Rated Service</Text></View>
        </View>
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
          <Text style={styles.messageBtnText}>💬 Message</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} disabled={applying}>
          {applying ? <ActivityIndicator color="#fff" /> : <Text style={styles.applyBtnText}>✓ I'm Interested</Text>}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 8 },
  backBtn: { alignSelf: 'flex-start' },
  backText: { color: '#1FB6AE', fontWeight: '600', fontSize: 16 },
  heroSection: { paddingHorizontal: 20, paddingBottom: 20 },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: '#F0FAFA', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginBottom: 12 },
  categoryText: { color: '#1FB6AE', fontSize: 11, fontWeight: '700', letterSpacing: 1 },
  price: { fontSize: 42, fontWeight: '800', color: '#1FB6AE', marginBottom: 8 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', lineHeight: 28 },
  priorityBadge: { alignSelf: 'flex-start', backgroundColor: '#FEF3C7', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4, marginTop: 10 },
  priorityText: { color: '#D97706', fontSize: 12, fontWeight: '700' },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 20, gap: 12, marginBottom: 20 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: '#6B7280' },
  section: { paddingHorizontal: 20, marginBottom: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 10 },
  description: { fontSize: 15, color: '#374151', lineHeight: 22 },
  locationBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB' },
  locationText: { color: '#374151', fontSize: 14 },
  clientCard: { flexDirection: 'row', backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', gap: 14 },
  clientAvatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#1FB6AE', justifyContent: 'center', alignItems: 'center' },
  clientAvatarText: { color: '#fff', fontSize: 20, fontWeight: '700' },
  clientInfo: { flex: 1 },
  clientName: { fontSize: 16, fontWeight: '700', color: '#111827' },
  clientRating: { fontSize: 13, color: '#F59E0B', marginTop: 2 },
  verifiedBadge: { fontSize: 12, color: '#1FB6AE', fontWeight: '600', marginTop: 2 },
  trustRow: { flexDirection: 'row', justifyContent: 'space-around', paddingHorizontal: 20, marginBottom: 20 },
  trustItem: { alignItems: 'center', gap: 4 },
  trustIcon: { fontSize: 22 },
  trustText: { fontSize: 11, color: '#6B7280', textAlign: 'center' },
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 12, padding: 16, paddingBottom: 32, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  messageBtn: { flex: 1, borderWidth: 2, borderColor: '#1FB6AE', borderRadius: 12, padding: 14, alignItems: 'center' },
  messageBtnText: { color: '#1FB6AE', fontWeight: '700', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: '#1FB6AE', borderRadius: 12, padding: 14, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
