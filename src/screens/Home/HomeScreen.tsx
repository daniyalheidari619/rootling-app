import ScreenHeader from '../../components/ScreenHeader';
import { useTranslation } from '../../i18n';
import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useAuthStore } from '../../store/authStore';

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { t, lang } = useTranslation();
  const isLt = lang === 'lt';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <ScreenHeader title={t('home.greeting') + ' ' + (user?.name?.split(' ')[0] || '') + ' 👋'} navigation={navigation} />
      <Text style={styles.subtitle}>{t('home.subtitle')}</Text>

      <TouchableOpacity style={styles.swipeCTA} onPress={() => navigation.navigate('Swipe')}>
        <Text style={styles.swipeCTATitle}>{t('home.findTasks')}</Text>
        <Text style={styles.swipeCTADesc}>{t('home.findTasksDesc')}</Text>
        <Text style={styles.swipeCTAArrow}>→</Text>
      </TouchableOpacity>

      <View style={styles.statsRow}>
        {[
          { label: t('home.protected'), icon: '🔒' },
          { label: t('home.verified'), icon: '✓' },
          { label: t('home.fastPay'), icon: '⚡' },
        ].map((s, i) => (
          <View key={i} style={styles.statCard}>
            <Text style={styles.statIcon}>{s.icon}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      <TouchableOpacity style={[styles.postBtn, { marginBottom: 12, borderColor: '#6366F1' }]} onPress={() => navigation.navigate('Browse')}>
        <Text style={[styles.postBtnText, { color: '#6366F1' }]}>🔍 {lang === 'lt' ? 'Naršyti užduotis' : 'Browse All Tasks'}</Text>
      </TouchableOpacity>

      <View style={{ flexDirection: 'row', gap: 12 }}>
        <TouchableOpacity style={[styles.postBtn, { flex: 1 }]} onPress={() => navigation.navigate('Post')}>
          <Text style={styles.postBtnText}>{t('home.postTask')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.postBtn, { flex: 1, borderColor: '#6366F1' }]} onPress={() => navigation.navigate('MyTasks')}>
          <Text style={styles.postBtnText}>📋 {isLt ? 'Mano užduotys' : 'My Tasks'}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.postBtn, { flex: 1, borderColor: '#F59E0B' }]} onPress={() => navigation.navigate('Negotiations')}>
          <Text style={[styles.postBtnText, { color: '#F59E0B' }]}>💬 {lang === 'lt' ? 'Pasiūlymai' : 'My Offers'}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  content: { padding: 24, paddingTop: 60 },
  header: { marginBottom: 24 },
  greeting: { fontSize: 28, fontWeight: '800', color: '#111827' },
  subtitle: { fontSize: 15, color: '#6B7280', marginTop: 4 },
  swipeCTA: {
    backgroundColor: '#1FB6AE', borderRadius: 16,
    padding: 24, marginBottom: 16, position: 'relative',
  },
  swipeCTACard: {},
  swipeCTATitle: { fontSize: 20, fontWeight: '700', color: '#fff', marginBottom: 6 },
  swipeCTADesc: { fontSize: 14, color: 'rgba(255,255,255,0.85)' },
  swipeCTAArrow: { position: 'absolute', right: 24, top: '50%', fontSize: 24, color: '#fff' },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 16 },
  statCard: {
    flex: 1, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  statIcon: { fontSize: 22, marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#6B7280', fontWeight: '600' },
  postBtn: {
    backgroundColor: '#fff', borderRadius: 12, padding: 18,
    alignItems: 'center', borderWidth: 2, borderColor: '#1FB6AE',
  },
  postBtnText: { color: '#1FB6AE', fontSize: 16, fontWeight: '700' },
});
