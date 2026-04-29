import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, FlatList, Platform } from 'react-native';
import { useTranslation } from '../../i18n';

const { width } = Dimensions.get('window');

const SLIDES_EN = [
  { emoji: '📋', title: 'Post a Task', desc: 'Describe what you need, set your budget, and let taskers apply. You control the price.', color: '#1FB6AE' },
  { emoji: '👥', title: 'Choose Your Tasker', desc: 'Review profiles, ratings and experience. Accept the best fit for your task.', color: '#6366F1' },
  { emoji: '🔒', title: 'Pay Securely', desc: 'Payment is held by Stripe and only released when you confirm the task is done.', color: '#F59E0B' },
  { emoji: '⭐', title: 'Rate & Review', desc: 'Afletion, leave a review. Build trust in the community.', color: '#10B981' },
];

const SLIDES_LT = [
  { emoji: '📋', title: 'Skelbkite užduotį', desc: 'Aprašykite, ko reikia, nustatykite biudžetą ir leiskite vykdytojams kreiptis. Jūs kontroliuojate kainą.', color: '#1FB6AE' },
  { emoji: '👥', title: 'Pasirinkite vykdytoją', desc: 'Peržiūrėkite profilius, įvertinimus ir patirtį. Priimkite geriausiai tinkantį.', color: '#6366F1' },
  { emoji: '🔒', title: 'Mokėkite saugiai', desc: 'Mokėjimą laiko Stripe ir išleidžia tik patvirtinus užduoties atlikimą.', color: '#F59E0B' },
  { emoji: '⭐', title: 'Įvertinkite', desc: 'Po atlikimo palikite atsiliepimą. Kurkite pasitikėjimą bendruomenėje.', color: '#10B981' },
];

export default function OnboardingScreen({ onDone }: { onDone: () => void }) {
  const { lang } = useTranslation();
  const slides = lang === 'lt' ? SLIDES_LT : SLIDES_EN;
  const [current, setCurrent] = useState(0);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent(prev => {
        if (prev < slides.length - 1) {
          const next = prev + 1;
          listRef.current?.scrollToIndex({ index: next, animated: true });
          return next;
        } else {
          clearInterval(timer);
          setTimeout(() => onDone(), 800);
          return prev;
        }
      });
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  const handleNext = async () => {
    if (current < slides.length - 1) {
      listRef.current?.scrollToIndex({ index: current + 1, animated: true });
      setCurrent(current + 1);
    } else {
      await AsyncStorage.setItem('onboardingDone', 'true');
      onDone();
    }
  };

  const handleSkip = async () => {
    onDone();
  };

  const slide = slides[current];

  return (
    <View style={s.container}>
      <TouchableOpacity style={s.skip} onPress={handleSkip}>
        <Text style={s.skipText}>{lang === 'lt' ? 'Praleisti' : 'Skip'}</Text>
      </TouchableOpacity>

      <FlatList
        ref={listRef}
        data={slides}
        horizontal
        pagingEnabled
        scrollEnabled={false}
        showsHorizontalScrollIndicator={false}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item }) => (
          <View style={[s.slide, { width }]}>
            <View style={[s.emojiContainer, { backgroundColor: item.color + '20' }]}>
              <Text style={s.emoji}>{item.emoji}</Text>
            </View>
            <Text style={[s.title, { color: item.color }]}>{item.title}</Text>
            <Text style={s.desc}>{item.desc}</Text>
          </View>
        )}
      />

      <View style={s.dots}>
        {slides.map((_, i) => (
          <View key={i} style={[s.dot, { backgroundColor: i === current ? slide.color : '#E5E7EB' }]} />
        ))}
      </View>

      <TouchableOpacity style={[s.btn, { backgroundColor: slide.color }]} onPress={handleNext}>
        <Text style={s.btnText}>
          {current === slides.length - 1 ? (lang === 'lt' ? 'Pradėti' : 'Get Started') : (lang === 'lt' ? 'Toliau' : 'Next')}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', paddingBottom: 40 },
  skip: { position: 'absolute', top: 56, right: 20, zIndex: 10 },
  skipText: { color: '#9CA3AF', fontSize: 15, fontWeight: '600' },
  slide: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: 32, paddingTop: 80 },
  emojiContainer: { width: 140, height: 140, borderRadius: 70, justifyContent: 'center', alignItems: 'center', marginBottom: 32 },
  emoji: { fontSize: 64 },
  title: { fontSize: 28, fontWeight: '900', textAlign: 'center', marginBottom: 16 },
  desc: { fontSize: 16, color: '#6B7280', textAlign: 'center', lineHeight: 24 },
  dots: { flexDirection: 'row', justifyContent: 'center', gap: 8, marginBottom: 24 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  btn: { marginHorizontal: 24, borderRadius: 14, padding: 18, alignItems: 'center' },
  btnText: { color: '#fff', fontSize: 17, fontWeight: '800' },
});
