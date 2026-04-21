import TranslateButton from '../TranslateButton';
import { useTranslation } from '../../i18n';
import { anonName, anonAvatar } from '../../utils/anonName';
import React, { useRef } from 'react';
import {
  View, Text, StyleSheet, Dimensions,
  Animated, PanResponder,
} from 'react-native';
import { Task } from '../../types';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');
const SWIPE_THRESHOLD = SCREEN_WIDTH * 0.35;

interface SwipeCardProps {
  task: Task;
  onSwipeLeft: (id: string) => void;
  onSwipeRight: (id: string) => void;
  onPress: (task: Task) => void;
  isTop: boolean;
  index: number;
}

export default function SwipeCard({ task, onSwipeLeft, onSwipeRight, onPress, isTop, index }: SwipeCardProps) {
  const { t } = useTranslation();
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;

  const rotate = translateX.interpolate({
    inputRange: [-SCREEN_WIDTH, 0, SCREEN_WIDTH],
    outputRange: ['-15deg', '0deg', '15deg'],
    extrapolate: 'clamp',
  });

  const rightOpacity = translateX.interpolate({
    inputRange: [0, SWIPE_THRESHOLD],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const leftOpacity = translateX.interpolate({
    inputRange: [-SWIPE_THRESHOLD, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => isTop,
      onMoveShouldSetPanResponder: () => isTop,
      onPanResponderMove: (_, gesture) => {
        translateX.setValue(gesture.dx);
        translateY.setValue(gesture.dy * 0.15);
      },
      onPanResponderRelease: (_, gesture) => {
        if (Math.abs(gesture.dx) > SWIPE_THRESHOLD) {
          const dir = gesture.dx > 0 ? 1 : -1;
          Animated.spring(translateX, {
            toValue: dir * SCREEN_WIDTH * 1.5,
            useNativeDriver: true,
            damping: 20,
          }).start(() => {
            if (dir > 0) onSwipeRight(task.id);
            else onSwipeLeft(task.id);
          });
        } else {
          Animated.parallel([
            Animated.spring(translateX, { toValue: 0, useNativeDriver: true }),
            Animated.spring(translateY, { toValue: 0, useNativeDriver: true }),
          ]).start();
        }
      },
    })
  ).current;

  const yOffset = index * 12;
  const scale = 1 - index * 0.04;

  return (
    <Animated.View
      style={[
        styles.card,
        {
          top: yOffset,
          transform: [
            { translateX },
            { translateY },
            { rotate },
            { scale },
          ],
        },
      ]}
      {...(isTop ? panResponder.panHandlers : {})}
    >
      <Animated.View style={[styles.overlay, styles.rightOverlay, { opacity: rightOpacity }]}>
        <Text style={styles.overlayText}>{t('task.interested')}</Text>
      </Animated.View>
      <Animated.View style={[styles.overlay, styles.leftOverlay, { opacity: leftOpacity }]}>
        <Text style={styles.overlayText}>{t('swikip') || '✕ Skip'}</Text>
      </Animated.View>
      <View style={styles.priceBadge}>
        <Text style={styles.priceText}>€{task.budget}</Text>
      </View>
      {task.priority === 'HIGH' && (
        <View style={styles.priorityBadge}>
          <Text style={styles.priorityText}>{t('swipe.priority') || '⭐ Priority'}</Text>
        </View>
      )}
      <View style={styles.content}>
        <Text style={styles.category}>{task.category?.replace(/-/g, ' ')}</Text>
        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
        <TranslateButton text={task.description} textStyle={styles.description} />
        <View style={styles.meta}>
          {task.distance && (
            <View style={styles.metaItem}>
              <Text style={styles.metaText}>📍 {task.distance.toFixed(1)} km</Text>
            </View>
          )}
          <View style={styles.metaItem}>
            <Text style={styles.metaText}>📅 {new Date(task.createdAt).toLocaleDateString()}</Text>
          </View>
        </View>
        <View style={styles.trustRow}>
          {task.client.idVerificationStatus === 'VERIFIED' && (
            <View style={styles.trustBadge}>
              <Text style={styles.trustText}>{t('swipe.verifiedClient') || '✓ Verified client'}</Text>
            </View>
          )}
          {task.client.clientRating > 0 && (
            <View style={styles.trustBadge}>
              <Text style={styles.trustText}>★ {task.client.clientRating.toFixed(1)}</Text>
            </View>
          )}
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>{t('task.paymentProtected')}</Text>
          </View>
        </View>
      </View>
      {isTop && (
        <View style={styles.hints}>
          <Text style={styles.hintLeft}>{t('swipe.hintSkip') || '← Skip'}</Text>
          <Text style={styles.hintRight}>{t('swipe.hintInterested') || 'Interested →'}</Text>
        </View>
      )}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  card: {
    position: 'absolute',
    width: SCREEN_WIDTH - 32,
    height: SCREEN_HEIGHT * 0.62,
    backgroundColor: '#fff',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
elevation: 5,
    overflow: 'hidden',
  },
  overlay: {
    position: 'absolute',
    top: 0, left: 0, right: 0, bottom: 0,
    zIndex: 10,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  rightOverlay: { backgroundColor: 'rgba(31,182,174,0.85)' },
  leftOverlay: { backgroundColor: 'rgba(100,100,100,0.75)' },
  overlayText: { fontSize: 32, fontWeight: '800', color: '#fff' },
  priceBadge: {
    position: 'absolute',
    top: 16, right: 16, zIndex: 5,
    backgroundColor: '#1FB6AE',
    paddingHorizontal: 14, paddingVertical: 6,
    borderRadius: 20,
  },
  priceText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  priorityBadge: {
    position: 'absolute',
    top: 16, left: 16, zIndex: 5,
    backgroundColor: '#F59E0B',
    paddingHorizontal: 10, paddingVertical: 4,
    borderRadius: 12,
  },
  priorityText: { color: '#fff', fontSize: 12, fontWeight: '700' },
  content: {
    flex: 1, padding: 20, paddingTop: 60, justifyContent: 'flex-end',
  },
  category: {
    fontSize: 12, color: '#1FB6AE', fontWeight: '600',
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 6,
  },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 8 },
  description: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 },
  meta: { flexDirection: 'row', gap: 12, marginBottom: 12 },
  metaItem: { flexDirection: 'row', alignItems: 'center' },
  metaText: { fontSize: 13, color: '#6B7280' },
  trustRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 6 },
  trustBadge: {
    backgroundColor: '#F0FAFA', borderRadius: 8,
    paddingHorizontal: 8, paddingVertical: 3,
  },
  trustText: { fontSize: 11, color: '#1FB6AE', fontWeight: '600' },
  hints: {
    flexDirection: 'row', justifyContent: 'space-between',
    paddingHorizontal: 20, paddingBottom: 16,
  },
  hintLeft: { fontSize: 12, color: '#9CA3AF' },
  hintRight: { fontSize: 12, color: '#9CA3AF' },
});
