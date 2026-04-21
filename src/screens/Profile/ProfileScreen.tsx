import { useTranslation, setLanguage, LANGUAGES } from '../../i18n';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Image, Alert, RefreshControl, TextInput,
  KeyboardAvoidingView, Platform,
} from 'react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import * as ImagePicker from 'expo-image-picker';
import BillingTab from './BillingTab';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

type Tab = 'overview' | 'tasks' | 'reviews' | 'verification' | 'billing' | 'settings';

const TABS = [
  { key: 'overview', label: 'Overview' },
  { key: 'tasks', label: 'My Tasks' },
  { key: 'reviews', label: 'Reviews' },
  { key: 'verification', label: 'Verification' },
  { key: 'billing', label: 'Billing' },
  { key: 'settings', label: 'Settings' },
] as const;

export default function ProfileScreen() {
  const { user, logout, setAuth } = useAuthStore();
  const { t, lang } = useTranslation();
  const [tab, setTab] = useState<Tab>('overview');
  const [refreshing, setRefreshing] = useState(false);
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editBio, setEditBio] = useState('');
  const [taskFilter, setTaskFilter] = useState<'ALL' | 'OPEN' | 'ASSIGNED' | 'COMPLETED' | 'CANCELLED'>('ALL');
  const queryClient = useQueryClient();

  const { data: profile, isLoading, refetch } = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: async () => {
      const { data } = await client.get('/api/auth/users/' + user!.id);
      return data.user || data.data || data;
    },
    enabled: !!user,
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews', user?.id],
    queryFn: async () => {
      const { data } = await client.get('/api/users/' + user!.id + '/reviews');
      return data.reviews || [];
    },
    enabled: !!user,
  });

  const { data: myTasks = [] } = useQuery({
    queryKey: ['myTasks'],
    queryFn: async () => {
      const { data } = await client.get('/api/tasks/my-tasks?includeApplied=true');
      return data.data || data.tasks || [];
    },
    enabled: !!user,
  });

  const { data: paymentMethods = [] } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const { data } = await client.get('/api/payments/payment-methods');
      return data.paymentMethods || [];
    },
    enabled: !!user,
  });

  const { data: connectStatus } = useQuery({
    queryKey: ['connectStatus'],
    queryFn: async () => {
      const { data } = await client.get('/api/payments/connect/status');
      return data;
    },
    enabled: !!user,
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      const { data } = await client.get('/api/payments/balance');
      return data;
    },
    enabled: !!user,
  });

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleSaveProfile = async () => {
    try {
      await client.put('/api/auth/profile', { name: editName, phone: editPhone, bio: editBio });
      await refetch();
      setEditingProfile(false);
      Alert.alert('Success', 'Profile updated');
    } catch (e: any) {
      Alert.alert('Error', e.response?.data?.message || 'Failed to update');
    }
  };


  const handlePhotoUpload = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.7,
      base64: true,
    });
    if (!result.canceled && result.assets[0]) {
      try {
        const asset = result.assets[0];
        const base64 = 'data:image/jpeg;base64,' + asset.base64;
        await client.put('/api/auth/profile', { profilePhoto: base64 });
        await refetch();
        Alert.alert('Success', 'Profile photo updated!');
      } catch (e: any) {
        Alert.alert('Error', 'Failed to upload photo');
      }
    }
  };
  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout },
    ]);
  };

  const getVerificationColor = (st: string) =>
    ({ VERIFIED: '#10B981', EXPIRING: '#F59E0B', EXPIRED: '#EF4444', PENDING: '#3B82F6' } as any)[st] || '#6B7280';
  const getVerificationLabel = (st: string) =>
    ({ VERIFIED: 'Verified', EXPIRING: 'Expiring Soon', EXPIRED: 'Expired', PENDING: 'Pending Review' } as any)[st] || 'Not Verified';
  const getStatusColor = (st: string) =>
    ({ OPEN: '#10B981', ASSIGNED: '#3B82F6', COMPLETED: '#6B7280', CANCELLED: '#EF4444' } as any)[st] || '#6B7280';

  if (!user) {
    return (
      <View style={s.center}>
        <Text style={{ fontSize: 48, marginBottom: 16 }}>👤</Text>
        <Text style={{ fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 }}>Sign in to view your profile</Text>
        <Text style={{ fontSize: 14, color: '#6B7280', textAlign: 'center' }}>Use the Login or Register screen to get started.</Text>
      </View>
    );
  }

  if (isLoading) return <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>;

  const vs = profile?.idVerificationStatus || 'UNVERIFIED';
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : null;

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFB' }}>
      <View style={s.header}>
        <View style={s.avatarRow}>
          <TouchableOpacity onPress={handlePhotoUpload}>
            {profile?.profilePhoto
              ? <Image source={{ uri: profile.profileImage }} style={s.avatar} />
              : <View style={[s.avatar, s.avatarFallback]}><Text style={s.avatarTxt}>{profile?.name?.[0] || '?'}</Text></View>}
            <View style={s.photoBadge}><Text style={{ fontSize: 12 }}>📷</Text></View>
          </TouchableOpacity>
          <View style={s.headerInfo}>
            <Text style={s.headerName}>{profile?.name}</Text>
            <Text style={s.headerEmail}>{profile?.email}</Text>
            <View style={[s.vBadge, { backgroundColor: getVerificationColor(vs) + '30' }]}>
              <Text style={[s.vBadgeTxt, { color: getVerificationColor(vs) }]}>{getVerificationLabel(vs)}</Text>
            </View>
          </View>
          {avgRating && <View style={s.ratingPill}><Text style={s.ratingTxt}>STAR {avgRating}</Text></View>}
        </View>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} bounces={false} style={s.tabBar} contentContainerStyle={{ flexGrow: 1 }}>
          {TABS.map(t => (
            <TouchableOpacity key={t.key} onPress={() => setTab(t.key as Tab)} style={[s.tabBtn, tab === t.key && s.tabActive]}>
              <Text style={[s.tabTxt, tab === t.key && s.tabActiveTxt]}>{t.label}</Text>
            </TouchableOpacity>
          ))}
      </ScrollView>

      <ScrollView style={s.scroll} refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#1FB6AE" />}>

        {tab === 'overview' && (
          <View style={s.section}>
            {!editingProfile ? (
              <>
                <View style={s.card}>
                  <Row label="Name" val={profile?.name} />
                  <Row label="Email" val={profile?.email} />
                  <Row label="Phone" val={profile?.phone || 'Not set'} />
                  <Row label="Bio" val={profile?.bio || 'Not set'} />
                  <Row label="Role" val={profile?.role} />
                  <Row label="Member since" val={profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : '-'} />
                </View>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => {
                  setEditName(profile?.name || '');
                  setEditPhone(profile?.phone || '');
                  setEditBio(profile?.bio || '');
                  setEditingProfile(true);
                }}>
                  <Text style={s.secondaryBtnTxt}>Edit Profile</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={s.card}>
                <Text style={s.lbl}>Full Name</Text>
                <TextInput style={s.input} value={editName} onChangeText={setEditName} />
                <Text style={s.lbl}>Phone</Text>
                <TextInput style={s.input} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />
                <Text style={s.lbl}>Bio</Text>
                <TextInput style={[s.input, { height: 80 }]} value={editBio} onChangeText={setEditBio} multiline />
                <TouchableOpacity style={s.primaryBtn} onPress={handleSaveProfile}>
                  <Text style={s.primaryBtnTxt}>Save Changes</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.secondaryBtn} onPress={() => setEditingProfile(false)}>
                  <Text style={s.secondaryBtnTxt}>Cancel</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        )}

        {tab === 'tasks' && (
          <View style={s.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }} bounces={false}>
              {['ALL', 'OPEN', 'ASSIGNED', 'COMPLETED', 'CANCELLED'].map(f => (
                <TouchableOpacity key={f} onPress={() => setTaskFilter(f as any)}
                  style={[s.filterBtn, taskFilter === f && s.filterBtnActive]}>
                  <Text style={[s.filterTxt, taskFilter === f && s.filterTxtActive]}>{f}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
            <Text style={s.sectionTitle}>My Tasks ({(myTasks || []).filter((t: any) => taskFilter === 'ALL' || t.status === taskFilter).length})</Text>
            {(myTasks || []).filter((t: any) => taskFilter === 'ALL' || t.status === taskFilter).length === 0
              ? <Empty icon="CLIPBOARD" text="No tasks yet" />
              : (myTasks || []).filter((t: any) => taskFilter === 'ALL' || t.status === taskFilter).map((task: any) => (
                <View key={task.id} style={s.card}>
                  <View style={s.row}>
                    <Text style={s.taskTitle} numberOfLines={2}>{task.title}</Text>
                    <View style={[s.statusBadge, { backgroundColor: getStatusColor(task.status) + '20' }]}>
                      <Text style={[s.statusTxt, { color: getStatusColor(task.status) }]}>{task.status}</Text>
                    </View>
                  </View>
                  <Text style={s.budget}>EUR {task.budget}</Text>
                  {task.dueDate && <Text style={s.meta}>Due: {new Date(task.dueDate).toLocaleDateString()}</Text>}
                  {task.boostType && task.boostedUntil && new Date(task.boostedUntil) > new Date() && (
                    <Text style={s.boostTxt}>{task.boostType === 'SPOTLIGHT' ? 'STAR Spotlight Active' : 'BOLT Boost Active'}</Text>
                  )}
                </View>
              ))}
          </View>
        )}

        {tab === 'reviews' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Reviews ({reviews.length})</Text>
            {avgRating && (
              <View style={[s.card, { alignItems: 'center' }]}>
                <Text style={{ fontSize: 36, fontWeight: '800', color: '#1FB6AE' }}>STAR {avgRating}</Text>
                <Text style={s.meta}>Average Rating</Text>
              </View>
            )}
            {reviews.length === 0
              ? <Empty icon="STAR" text="No reviews yet" />
              : (reviews || []).map((r: any) => (
                <View key={r.id} style={s.card}>
                  <View style={s.row}>
                    <Text style={{ fontSize: 16 }}>{'*'.repeat(r.rating)}</Text>
                    <Text style={s.meta}>{new Date(r.createdAt).toLocaleDateString()}</Text>
                  </View>
                  {r.comment && <Text style={s.reviewTxt}>{r.comment}</Text>}
                  <Text style={s.meta}>-- {r.reviewer?.name?.[0] || '?'}.</Text>
                </View>
              ))}
          </View>
        )}

        {tab === 'verification' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>ID Verification</Text>
            <View style={[s.card, { borderColor: getVerificationColor(vs), borderWidth: 2 }]}>
              <Text style={[s.verTitle, { color: getVerificationColor(vs) }]}>{getVerificationLabel(vs)}</Text>
              {vs === 'EXPIRING' && <Text style={s.warnTxt}>Your ID is expiring soon. Upload a new document to avoid restrictions.</Text>}
              {vs === 'EXPIRED' && <Text style={s.errTxt}>Your ID has expired. You cannot post or accept tasks.</Text>}
              {vs === 'UNVERIFIED' && <Text style={s.mutedTxt}>Verify your identity to post and accept tasks on Root-ling.</Text>}
              {vs === 'PENDING' && <Text style={s.mutedTxt}>Documents under review. Usually takes 1-2 business days.</Text>}
              {vs === 'VERIFIED' && profile?.idDocumentExpiry && (
                <Text style={s.mutedTxt}>Expires: {new Date(profile.idDocumentExpiry).toLocaleDateString()}</Text>
              )}
            </View>
            <View style={s.card}>
              <Text style={s.lbl}>To upload your ID documents:</Text>
              <Text style={s.mutedTxt}>Visit root-ling.com in your browser and go to Profile then Verification to upload your ID front, back, and selfie. Native camera upload is coming soon.</Text>
            </View>
          </View>
        )}

        {tab === 'billing' && <BillingTab profile={profile} />}
        {tab === 'settings' && (
          <View style={s.section}>
            <Text style={s.sectionTitle}>Settings</Text>
            <View style={s.card}>
              <Row label="Account Type" val={profile?.role || '-'} />
              <Row label="Verified" val={vs} />
            </View>
            <View style={s.card}>
              <Text style={s.lbl}>Language / Kalba</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
                {LANGUAGES.map(l => (
                  <TouchableOpacity
                    key={l.code}
                    onPress={() => setLanguage(l.code as any)}
                    style={{
                      flex: 1, padding: 12, borderRadius: 10, alignItems: 'center',
                      backgroundColor: lang === l.code ? '#1FB6AE' : '#F3F4F6',
                      borderWidth: 2, borderColor: lang === l.code ? '#1FB6AE' : '#E5E7EB',
                    }}
                  >
                    <Text style={{ fontSize: 20 }}>{l.flag}</Text>
                    <Text style={{ fontSize: 12, fontWeight: '600', color: lang === l.code ? '#fff' : '#374151', marginTop: 4 }}>{l.nativeName}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            <TouchableOpacity style={[s.primaryBtn, { backgroundColor: '#EF4444' }]} onPress={handleLogout}>
              <Text style={s.primaryBtnTxt}>Logout</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={{ height: 60 }} />
      </ScrollView>
    </View>
  );
}

function Row({ label, val }: { label: string; val?: string | null }) {
  return (
    <View style={s.infoRow}>
      <Text style={s.lbl}>{label}</Text>
      <Text style={s.infoVal} numberOfLines={2}>{val || '-'}</Text>
    </View>
  );
}

function Empty({ icon, text }: { icon: string; text: string }) {
  return (
    <View style={s.emptyWrap}>
      <Text style={s.emptyTxt}>{text}</Text>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  authWrap: { flex: 1, backgroundColor: '#F8FAFB' },
  authScroll: { flexGrow: 1, justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '800', color: '#1FB6AE', textAlign: 'center', marginBottom: 8 },
  authSub: { fontSize: 18, color: '#6B7280', textAlign: 'center', marginBottom: 32 },
  authToggle: { color: '#1FB6AE', textAlign: 'center', marginTop: 16, fontSize: 14 },
  header: { backgroundColor: '#1FB6AE', paddingHorizontal: 20, paddingTop: 60, paddingBottom: 20 },
  avatarRow: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  avatar: { width: 72, height: 72, borderRadius: 36, borderWidth: 3, borderColor: 'white' },
  avatarFallback: { backgroundColor: 'rgba(255,255,255,0.3)', justifyContent: 'center', alignItems: 'center' },
  avatarTxt: { fontSize: 28, fontWeight: '700', color: 'white' },
  photoBadge: { position: 'absolute', bottom: 0, right: 0, backgroundColor: 'white', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' },
  headerInfo: { flex: 1 },
  headerName: { fontSize: 20, fontWeight: '700', color: 'white' },
  headerEmail: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  vBadge: { borderRadius: 8, paddingHorizontal: 8, paddingVertical: 2, marginTop: 4, alignSelf: 'flex-start' },
  vBadgeTxt: { fontSize: 11, fontWeight: '600' },
  ratingPill: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 20, paddingHorizontal: 10, paddingVertical: 4 },
  ratingTxt: { color: 'white', fontWeight: '700', fontSize: 13 },
  tabBar: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#E5E7EB', maxHeight: 48, minHeight: 48 },
  tabBtn: { paddingHorizontal: 16, paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  tabActive: { borderBottomColor: '#1FB6AE' },
  tabTxt: { fontSize: 13, fontWeight: '500', color: '#6B7280' },
  tabActiveTxt: { color: '#1FB6AE', fontWeight: '700' },
  scroll: { flex: 1 },
  section: { padding: 16 },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12 },
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  infoVal: { fontSize: 14, fontWeight: '500', color: '#111827', flex: 1, textAlign: 'right' },
  lbl: { fontSize: 13, color: '#6B7280', marginBottom: 4, flex: 1 },
  input: { backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 10, paddingHorizontal: 14, paddingVertical: 12, fontSize: 15, marginBottom: 12, color: '#111827' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 },
  taskTitle: { fontSize: 15, fontWeight: '600', color: '#111827', flex: 1, marginRight: 8 },
  budget: { fontSize: 20, fontWeight: '800', color: '#1FB6AE', marginBottom: 4 },
  meta: { fontSize: 12, color: '#9CA3AF' },
  boostTxt: { fontSize: 12, color: '#D97706', fontWeight: '600', marginTop: 4 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  statusTxt: { fontSize: 11, fontWeight: '600' },
  reviewTxt: { fontSize: 14, color: '#374151', marginVertical: 4 },
  verTitle: { fontSize: 18, fontWeight: '700', marginBottom: 8 },
  warnTxt: { fontSize: 14, color: '#D97706', lineHeight: 20 },
  errTxt: { fontSize: 14, color: '#EF4444', lineHeight: 20 },
  mutedTxt: { fontSize: 14, color: '#6B7280', lineHeight: 20 },
  bigVal: { fontSize: 18, fontWeight: '700', color: '#111827' },
  emptyWrap: { alignItems: 'center', padding: 40 },
  filterBtn: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1, borderColor: '#E5E7EB', marginRight: 8, backgroundColor: 'white' },
  filterBtnActive: { backgroundColor: '#1FB6AE', borderColor: '#1FB6AE' },
  filterTxt: { fontSize: 12, fontWeight: '600', color: '#6B7280' },
  filterTxtActive: { color: 'white' },
  emptyTxt: { fontSize: 16, color: '#9CA3AF' },
  primaryBtn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#1FB6AE' },
  secondaryBtnTxt: { color: '#1FB6AE', fontWeight: '700', fontSize: 16 },
});
