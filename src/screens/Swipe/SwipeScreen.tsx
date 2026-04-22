import ScreenHeader from '../../components/ScreenHeader';
import { useTranslation } from '../../i18n';
import React, { useCallback, useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Dimensions, Alert } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import SwipeCard from '../../components/swipe/SwipeCard';
import { fetchSwipeTasks, expressInterest } from '../../api/tasks';
import { useLocationStore } from '../../store/locationStore';
import { useSwipeStore } from '../../store/swipeStore';
import { Task } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function SwipeScreen({ navigation }: any) {
  const { latitude, longitude } = useLocationStore();
  const { t } = useTranslation();
  const { skip, hasSkipped } = useSwipeStore();
  const [cards, setCards] = useState<Task[]>([]);

  const { data: tasks, isLoading } = useQuery({
    queryKey: ['swipe-tasks', latitude, longitude],
    queryFn: () => fetchSwipeTasks(latitude ?? undefined, longitude ?? undefined),
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (tasks) {
      setCards(tasks.filter(t => !hasSkipped(t.id)));
    }
  }, [tasks]);

  const handleSwipeLeft = useCallback((id: string) => {
    skip(id);
    setCards(prev => prev.filter(t => t.id !== id));
  }, []);

  const handleSwipeRight = useCallback(async (id: string) => {
    try {
      await expressInterest(id);
      Alert.alert(t('task.applySuccess'), '');
    } catch (e: any) {
      const msg = e?.response?.data?.message || '';
      if (msg.includes('active task') || msg.includes('aktyvią')) {
        Alert.alert(t('common.error'), t('task.alreadyActive'));
        return;
      }
      Alert.alert(t('common.error'), msg || 'Failed to apply');
      return;
    }
    setCards(prev => prev.filter(task => task.id !== id));
  }, [t]);

  const handlePress = useCallback((task: Task) => {
    navigation.navigate('TaskDetail', { task });
  }, [navigation]);

  if (isLoading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#1FB6AE" />
        <Text style={styles.loadingText}>{t('swipe.loading')}</Text>
      </View>
    );
  }

  if (cards.length === 0) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyEmoji}>🎉</Text>
      <Text style={styles.emptyTitle}>{t('swipe.allCaughtUp')}</Text>
        <Text style={styles.emptyDesc}>{t('swipe.noMoreTasks')}</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={() => setCards(tasks?.filter(t => !hasSkipped(t.id)) || [])}>
          <Text style={styles.refreshText}>{t('swipe.refresh')}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScreenHeader title={t('swipe.title')} navigation={navigation} />
      <Text style={styles.headerSub}>{cards.length} {t('swipe.nearYou')}</Text>
      <View style={styles.cardStack}>
        {cards.slice(0, 3).reverse().map((task, index) => (
          <SwipeCard
            key={task.id}
            task={task}
            onSwipeLeft={handleSwipeLeft}
            onSwipeRight={handleSwipeRight}
            onPress={handlePress}
            isTop={index === cards.slice(0, 3).length - 1}
            index={cards.slice(0, 3).length - 1 - index}
          />
        ))}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity style={styles.skipBtn} onPress={() => cards[0] && handleSwipeLeft(cards[0].id)}>
          <Text style={styles.skipIcon}>✕</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.interestBtn} onPress={() => cards[0] && handleSwipeRight(cards[0].id)}>
          <Text style={styles.interestIcon}>✓</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: 12 },
  loadingText: { color: '#6B7280', marginTop: 8 },
  emptyEmoji: { fontSize: 48, marginBottom: 8 },
  emptyTitle: { fontSize: 22, fontWeight: '700', color: '#111827' },
  emptyDesc: { fontSize: 14, color: '#6B7280', textAlign: 'center', paddingHorizontal: 32 },
  refreshBtn: { marginTop: 16, backgroundColor: '#1FB6AE', paddingHorizontal: 24, paddingVertical: 12, borderRadius: 12 },
  refreshText: { color: '#fff', fontWeight: '600' },
  header: { paddingTop: 60, paddingHorizontal: 24, paddingBottom: 16 },
  headerTitle: { fontSize: 28, fontWeight: '800', color: '#111827' },
  headerSub: { fontSize: 14, color: '#6B7280', marginTop: 2 },
  cardStack: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 16,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    paddingBottom: 32,
    paddingTop: 16,
  },
  skipBtn: {
    width: 60, height: 60, borderRadius: 30,
    backgroundColor: '#fff', borderWidth: 2, borderColor: '#E5E7EB',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#000', shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08, shadowRadius: 8, elevation: 3,
  },
  skipIcon: { fontSize: 24, color: '#6B7280' },
  interestBtn: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: '#1FB6AE',
    justifyContent: 'center', alignItems: 'center',
    shadowColor: '#1FB6AE', shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3, shadowRadius: 12, elevation: 5,
  },
  interestIcon: { fontSize: 28, color: '#fff' },
});
