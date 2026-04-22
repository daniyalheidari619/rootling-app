import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput } from 'react-native';
import { useQuery } from '@tanstack/react-query';
import { useTranslation } from '../../i18n';
import { anonName } from '../../utils/anonName';
import ScreenHeader from '../../components/ScreenHeader';
import client from '../../api/client';

const CATS = [
  { value: '', icon: '🌐' },
  { value: 'home-services', icon: '🏠' },
  { value: 'moving-delivery', icon: '🚚' },
  { value: 'handyman', icon: '🔧' },
  { value: 'gardening-outdoor', icon: '🌿' },
  { value: 'pet-care', icon: '🐾' },
  { value: 'personal-assistance', icon: '🤝' },
  { value: 'elderly-special-care', icon: '❤️' },
  { value: 'events-hospitality', icon: '🎉' },
  { value: 'administrative-digital', icon: '💻' },
  { value: 'seasonal-special', icon: '❄️' },
  { value: 'other', icon: '📋' },
];

export default function BrowseScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['browse-tasks', category],
    queryFn: async () => {
      const params: any = { status: 'OPEN' };
      if (category) params.category = category;
      const { data } = await client.get('/api/tasks', { params });
      return data.data || [];
    },
    staleTime: 2 * 60 * 1000,
  });

  const filtered = tasks.filter((t: any) =>
    !search || t.title?.toLowerCase().includes(search.toLowerCase()) ||
    t.description?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <View style={s.container}>
      <ScreenHeader title={lang === 'lt' ? 'Naršyti užduotis' : 'Browse Tasks'} navigation={navigation} />
      <TextInput style={s.search} value={search} onChangeText={setSearch} placeholder={lang === 'lt' ? '🔍 Ieškoti...' : '🔍 Search tasks...'} placeholderTextColor="#9CA3AF" />
      <FlatList
        horizontal data={CATS} keyExtractor={i => i.value}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.catList}
        renderItem={({ item }) => (
          <TouchableOpacity style={[s.catBtn, category === item.value && s.catBtnActive]} onPress={() => setCategory(item.value)}>
            <Text style={s.catIcon}>{item.icon}</Text>
          </TouchableOpacity>
        )}
      />
      {isLoading ? (
        <View style={s.center}><ActivityIndicator size="large" color="#1FB6AE" /></View>
      ) : filtered.length === 0 ? (
        <View style={s.center}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🔍</Text>
          <Text style={s.emptyTitle}>{lang === 'lt' ? 'Užduočių nerasta' : 'No tasks found'}</Text>
        </View>
      ) : (
        <FlatList
          data={filtered} keyExtractor={(item: any) => item.id}
          contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
          renderItem={({ item }: any) => (
            <TouchableOpacity style={s.card} onPress={() => navigation.navigate('TaskDetail', { task: item })}>
              <View style={s.cardTop}>
                <View style={s.catBadge}><Text style={s.catBadgeText}>{item.category?.replace(/-/g, ' ').toUpperCase()}</Text></View>
                <Text style={s.price}>€{item.budget}</Text>
              </View>
              <Text style={s.title} numberOfLines={2}>{item.title}</Text>
              <Text style={s.desc} numberOfLines={2}>{item.description}</Text>
              <View style={s.cardBottom}>
                <Text style={s.meta}>📍 {item.location?.split(',')[0]}</Text>
                <Text style={s.meta}> · {anonName(item.client?.name, 'client')}</Text>
                {item.priority === 'HIGH' && <Text style={s.priority}> · ⭐ {lang === 'lt' ? 'Prioritetas' : 'Priority'}</Text>}
              </View>
            </TouchableOpacity>
          )}
        />
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  search: { marginHorizontal: 16, marginBottom: 12, backgroundColor: '#fff', borderRadius: 12, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, borderWidth: 1, borderColor: '#E5E7EB', color: '#111827' },
  catList: { paddingHorizontal: 16, paddingBottom: 12, gap: 8 },
  catBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: '#fff', borderWidth: 1.5, borderColor: '#E5E7EB', justifyContent: 'center', alignItems: 'center' },
  catBtnActive: { backgroundColor: '#1FB6AE', borderColor: '#1FB6AE' },
  catIcon: { fontSize: 20 },
  emptyTitle: { fontSize: 18, fontWeight: '700', color: '#111827' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  catBadge: { backgroundColor: '#F0FAFA', borderRadius: 8, paddingHorizontal: 8, paddingVertical: 3 },
  catBadgeText: { color: '#1FB6AE', fontSize: 10, fontWeight: '700' },
  price: { fontSize: 22, fontWeight: '800', color: '#1FB6AE' },
  title: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  desc: { fontSize: 13, color: '#6B7280', lineHeight: 18, marginBottom: 10 },
  cardBottom: { flexDirection: 'row', flexWrap: 'wrap' },
  meta: { fontSize: 12, color: '#9CA3AF' },
  priority: { fontSize: 12, color: '#D97706', fontWeight: '600' },
});
