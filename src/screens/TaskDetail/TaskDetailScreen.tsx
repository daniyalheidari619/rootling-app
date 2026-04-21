import TranslateButton from '../../components/TranslateButton';
import { anonName, anonAvatar } from '../../utils/anonName';
import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  ActivityIndicator, Alert, TextInput, Modal,
} from 'react-native';
import { useQuery } from '@tanstack/react-query';
import client from '../../api/client';
import { useAuthStore } from '../../store/authStore';

export default function TaskDetailScreen({ route, navigation }: any) {
  const { task: initialTask } = route.params;
  const { user } = useAuthStore();
  const [applying, setApplying] = useState(false);
  const { t, lang } = useTranslation();
  const [showNegotiate, setShowNegotiate] = useState(false);
  const [negotiatePrice, setNegotiatePrice] = useState('');
  const [negotiateNote, setNegotiateNote] = useState('');
  const [negotiating, setNegotiating] = useState(false);

  const { data: task, isLoading: taskLoading } = useQuery({
    queryKey: ['task', initialTask.id],
    queryFn: async () => {
      const { data } = await client.get(`/api/tasks/${initialTask.id}`);
      return data.task || data.data || data;
    },
    initialData: initialTask?.title && initialTask?.client?.name ? initialTask : undefined,
  });

  if (taskLoading && !task) {
    return <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}><ActivityIndicator size="large" color="#1FB6AE" /></View>;
  }

  const safeTask = task || initialTask;

  const handleApply = async () => {
    if (!user) return navigation.navigate('Login');
    setApplying(true);
    try {
      await client.post(`/api/tasks/${safeTask.id}/apply`, {
        coverLetter: 'Interested in this task.',
        proposedBudget: task.budget,
      });
      Alert.alert(t('task.interestSent'), t('task.interestSentDesc'));
    } catch (e: any) {
      Alert.alert(t('common.error'), e?.response?.data?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleMessage = () => {
    if (!user) return navigation.navigate('Login');
    navigation.navigate('ChatScreen', { taskId: safeTask.id, otherUser: task.client });
  };

  const handleNegotiate = async () => {
    if (!negotiatePrice || isNaN(Number(negotiatePrice)) || Number(negotiatePrice) < 1) {
      return Alert.alert('Error', 'Enter a valid price');
    }
    setNegotiating(true);
    try {
      await client.post(`/api/tasks/${safeTask.id}/negotiate`, {
        proposedPrice: Number(negotiatePrice),
        message: negotiateNote,
      });
      Alert.alert(t('task.offerSent'), t('task.offerSentDesc'));
      setShowNegotiate(false);
      setNegotiatePrice('');
      setNegotiateNote('');
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send offer');
    } finally {
      setNegotiating(false);
    }
  };

  const formatDate = (d: string) => new Date(d).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
            <Text style={styles.backText}>{t('common.back')}</Text>
          </TouchableOpacity>
        </View>
        <View style={styles.heroSection}>
          <View style={styles.categoryBadge}>
            <Text style={styles.categoryText}>{(() => {
              const catMap: Record<string, string> = {
                'home-services': 'cat.homeServices',
                'moving-delivery': 'cat.movingDelivery',
                'handyman': 'cat.handyman',
                'gardening-outdoor': 'cat.gardeningOutdoor',
                'pet-care': 'cat.petCare',
                'personal-assistance': 'cat.personalAssistance',
                'elderly-special-care': 'cat.elderlySpecialCare',
                'events-hospitality': 'cat.eventsHospitality',
                'administrative-digital': 'cat.administrativeDigital',
                'seasonal-special': 'cat.seasonalSpecial',
                'other': 'cat.other',
              };
              const key = catMap[safeTask.category || ''];
              return key ? t(key).toUpperCase() : (safeTask.category || '').replace(/-/g, ' ').toUpperCase();
            })()}</Text>
          </View>
          <Text style={styles.price}>€{safeTask.budget || 0}</Text>
          <Text style={styles.title}>{safeTask.title}</Text>
          {safeTask.priority === 'HIGH' && (
            <View style={styles.priorityBadge}>
              <Text style={styles.priorityText}>{t('task.priorityTask')}</Text>
            </View>
          )}
        </View>
        <View style={styles.metaRow}>
          {safeTask.distance != null && <View style={styles.metaItem}><Text style={styles.metaText}>📍 {safeTask.distance.toFixed(1)} km away</Text></View>}
          {safeTask.createdAt && <View style={styles.metaItem}><Text style={styles.metaText}>📅 {formatDate(safeTask.createdAt)}</Text></View>}
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('task.description')}</Text>
          <TranslateButton text={safeTask.description} textStyle={styles.description} />
        </View>
        {safeTask.location && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('task.location')}</Text>
            <View style={styles.locationBox}><Text style={styles.locationText}>📍 {safeTask.location}</Text></View>
          </View>
        )}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('task.aboutClient')}</Text>
          <View style={styles.clientCard}>
            <View style={styles.clientAvatar}>
              <Text style={styles.clientAvatarText}>{anonAvatar(safeTask.client?.name)}</Text>
            </View>
            <View style={styles.clientInfo}>
              <Text style={styles.clientName}>{anonName(safeTask.client?.name, 'client')}</Text>
              {safeTask.client?.clientRating > 0 && <Text style={styles.clientRating}>★ {safeTask.client.clientRating.toFixed(1)}</Text>}
              {safeTask.client?.idVerificationStatus === 'VERIFIED' && <Text style={styles.verifiedBadge}>✓ ID Verified</Text>}
            </View>
          </View>
        </View>
        <View style={styles.trustRow}>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>🔒</Text><Text style={styles.trustText}>{t('task.paymentProtected')}</Text></View>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>✓</Text><Text style={styles.trustText}>{t('task.securePlatform')}</Text></View>
          <View style={styles.trustItem}><Text style={styles.trustIcon}>⭐</Text><Text style={styles.trustText}>{t('task.ratedService')}</Text></View>
        </View>
        {(safeTask.requiresCar || task.requiresTools) && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('task.requirements')}</Text>
            <View style={styles.requirementsBox}>
              {safeTask.requiresCar && (
                <View style={styles.requirementItem}>
                  <Text style={styles.requirementIcon}>🚗</Text>
                  <Text style={styles.requirementText}>{t('task.carRequired')}</Text>
                </View>
              )}
              {safeTask.requiresTools && (
                <View style={styles.requirementItem}>
                  <Text style={styles.requirementIcon}>🔧</Text>
                  <Text style={styles.requirementText}>Tools required{safeTask.toolsList ? ': ' + task.toolsList : ''}</Text>
                </View>
              )}
            </View>
          </View>
        )}
        {safeTask.slotsRequired > 1 && (
          <View style={styles.section}>
            <View style={styles.slotsBox}>
              <Text style={styles.slotsText}>👥 {safeTask.slotsRequired} taskers needed ({safeTask.slotsFilled || 0} filled)</Text>
            </View>
          </View>
        )}
        <Modal visible={showNegotiate} transparent animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <Text style={styles.modalTitle}>{t('task.proposePrice')}</Text>
              <Text style={styles.modalSub}>Client's budget: €{safeTask.budget}</Text>
              <TextInput
                style={styles.modalInput}
                value={negotiatePrice}
                onChangeText={setNegotiatePrice}
                placeholder={t('task.yourPrice')}
                placeholderTextColor="#9CA3AF"
                keyboardType="numeric"
              />
              <TextInput
                style={[styles.modalInput, { height: 80 }]}
                value={negotiateNote}
                onChangeText={setNegotiateNote}
                placeholder={t('task.whyThisPrice')}
                placeholderTextColor="#9CA3AF"
                multiline
              />
              <TouchableOpacity style={styles.modalBtn} onPress={handleNegotiate} disabled={negotiating}>
                {negotiating ? <ActivityIndicator color="#fff" /> : <Text style={styles.modalBtnText}>{t('task.sendOffer')}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowNegotiate(false)} style={styles.modalCancel}>
                <Text style={styles.modalCancelText}>{t('common.cancel')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ height: 120 }} />
      </ScrollView>
      <View style={styles.actionBar}>
        <TouchableOpacity style={styles.messageBtn} onPress={handleMessage}>
          <Text style={styles.messageBtnText}>{t('task.message')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.applyBtn} onPress={handleApply} disabled={applying}>
          {applying ? <ActivityIndicator color="#fff" /> : <Text style={styles.applyBtnText}>{t('task.interested')}</Text>}
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
  actionBar: { position: 'absolute', bottom: 0, left: 0, right: 0, flexDirection: 'row', gap: 8, padding: 12, paddingBottom: 28, backgroundColor: '#fff', borderTopWidth: 1, borderTopColor: '#E5E7EB' },
  messageBtn: { flex: 1, borderWidth: 2, borderColor: '#1FB6AE', borderRadius: 12, padding: 14, alignItems: 'center' },
  messageBtnText: { color: '#1FB6AE', fontWeight: '700', fontSize: 15 },
  applyBtn: { flex: 2, backgroundColor: '#1FB6AE', borderRadius: 12, padding: 14, alignItems: 'center' },
  applyBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  negotiateBtn: { flex: 1, borderWidth: 2, borderColor: '#F59E0B', borderRadius: 12, padding: 14, alignItems: 'center' },
  negotiateBtnText: { color: '#F59E0B', fontWeight: '700', fontSize: 14 },
  requirementsBox: { backgroundColor: '#fff', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#E5E7EB', gap: 10 },
  requirementItem: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  requirementIcon: { fontSize: 20 },
  requirementText: { fontSize: 14, color: '#374151', flex: 1 },
  slotsBox: { backgroundColor: '#EFF6FF', borderRadius: 12, padding: 14, borderWidth: 1, borderColor: '#BFDBFE' },
  slotsText: { fontSize: 14, color: '#1D4ED8', fontWeight: '600' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalCard: { backgroundColor: '#fff', borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 24, paddingBottom: 40 },
  modalTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 4 },
  modalSub: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  modalInput: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', marginBottom: 12, backgroundColor: '#F9FAFB' },
  modalBtn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  modalBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  modalCancel: { alignItems: 'center', marginTop: 12 },
  modalCancelText: { color: '#6B7280', fontSize: 14 },
});
