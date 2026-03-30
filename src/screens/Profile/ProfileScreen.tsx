import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Image } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

export default function ProfileScreen({ navigation }: any) {
  const { user, logout } = useAuthStore();

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await client.get(`/api/auth/users/${user!.id}`);
      return data.user || data;
    },
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', user?.id],
    queryFn: async () => {
      const { data } = await client.get(`/api/auth/users/${user!.id}/reviews`);
      return data.reviews || [];
    },
    enabled: !!user,
  });

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>👤</Text>
        <Text style={styles.emptyTitle}>Sign in to view your profile</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Login')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.linkBtn} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.linkText}>Create Account</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (isLoading) return <View style={styles.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>;

  const displayUser = profile || user;
  const initials = displayUser.name?.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.hero}>
        <View style={styles.avatarContainer}>
          {displayUser.profilePhoto ? (
          <Image source={{ uri: displayUser.profilePhoto }} style={styles.avatarImg} />
          ) : (
            <View style={styles.avatar}><Text style={styles.avatarText}>{initials}</Text></View>
          )}
          {displayUser.idVerificationStatus === 'VERIFIED' && (
            <View style={styles.verifiedBadge}><Text style={styles.verifiedText}>✓</Text></View>
          )}
        </View>
        <Text style={styles.name}>{displayUser.name}</Text>
        <Text style={styles.email}>{displayUser.email}</Text>
        {displayUser.taskerRating > 0 && <Text style={styles.rating}>★ {displayUser.taskerRating.toFixed(1)} tasker rating</Text>}
      </View>

      <View style={styles.statsRow}>
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{displayUser.completedTasksCount || 0}</Text>
          <Text style={styles.statLabel}>Completed</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={stylestNumber}>{displayUser.taskerRatingCount || 0}</Text>
          <Text style={styles.statLabel}>Reviews</Text>
        </View>
        <View style={styles.statDivider} />
        <View style={styles.statItem}>
          <Text style={styles.statNumber}>{displayUser.clientRating > 0 ? displayUser.clientRating.toFixed(1) : '—'}</Text>
          <Text style={styles.statLabel}>Client Rating</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Trust & Safety</Text>
        <View style={styles.badgeRow}>
          {displayUser.idVerificationStatus === 'VERIFIED' && <View style={styles.badge}><Text style={styles.badgeText}>✓ ID Verified</Text></View>}
          {displayUser.isSubscriber && <View style={[styles.badge, styles.badgePro]}><Text style={styles.badgeText}>⭐ Pro</Text></View>}
          <View style={styles.badge}><Text style={styles.badgeText}>🔒 Secure</Text></View>
        </View>
      </View>

      {reviews.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recent Reviews</Text>
          {reviews.slice(0, 3).map((review: any) => (
            <View key={review.id} style={styles.reviewCard}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewerName}>{review.reviewer?.name || 'Anonymous'}</Text>
                <Text style={styles.reviewRating}>{'★'.repeat(review.rating)}</Text>
              </View>
              {review.comment && <Text style={styles.reviewComment}>{review.comment}</Text>}
            </View>
          ))}
        </View>
      )}

      <View style={styles.section}>
        <TouchableOpacity style={styles.actionItem} onPress={() => navigation.navigate('Messages')}>
          <Text style={styles.actionText}>💬 My Messages</Text>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionItem, styles.logoutItem]} onPress={logout}>
          <Text style={styles.logoutText}>Sign Out</Text>
        </TouchableOpacity>
      </View>
      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  btn: { backgroundColor: '#1FB6AE', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12, marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  linkBtn: { padding: 8 },
  linkText: { color: '#1FB6AE', fontWeight: '600' },
  hero: { alignItems: 'center', paddingTop: 60, paddingBottom: 24, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#E5E7EB' },
  avatarContainer: { position: 'relative', marginBottom: 12 },
  avatar: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#1FB6AE', justifyContent: 'center', alignItems: 'center' },
  avatarImg: { width: 80, height: 80, borderRadius: 40 },
  avatarText: { fontSize: 32, fontWeight: '700', color: '#fff' },
  verifiedBadge: { position: 'absolute', bottom: 0, right: 0, width: 24, height: 24, borderRadius: 12, backgroundColor: '#1FB6AE', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#fff' },
  verifiedText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  name: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 4 },
  email: { fontSize: 14, color: '#6B7280', marginBottom: 4 },
  rating: { fontSize: 14, color: '#F59E0B', fontWeight: '600' },
  statsRow: { flexDirection: 'row', backgroundColor: '#fff', marginTop: 12, padding: 20 },
  statItem: { flex: 1, alignItems: 'center' },
  statNumber: { fontSize: 24, fontWeight: '800', color: '#111827' },
  statLabel: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  statDivider: { width: 1, backgroundColor: '#E5E7EB' },
  section: { padding: 20 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 12 },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  badge: { backgroundColor: '#F0FAFA', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 },
  badgePro: { backgroundColor: '#FEF3C7' },
  badgeText: { color: '#1FB6AE', fontWeight: '600', fontSize: 13 },
  reviewCard: { backgroundColor: '#fff', borderRadius: 12, padding: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  reviewHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  reviewerName: { fontWeight: '600', color: '#111827' },
  reviewRating: { color: '#F59E0B' },
  reviewComment: { color: '#6B7280', fontSize: 13, lineHeight: 18 },
  actionItem: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  actionText: { color: '#111827', fontWeight: '600' },
  actionArrow: { color: '#9CA3AF' },
  logoutItem: { justifyContent: 'center', borderColor: '#FEE2E2', backgroundColor: '#FFF5F5' },
  logoutText: { color: '#EF4444', fontWeight: '600', textAlign: 'center' },
});
