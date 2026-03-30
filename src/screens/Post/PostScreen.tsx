import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, TextInput, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

const CATEGORIES = [
  { value: 'home-services', label: 'Home Services', icon: '🏠' },
  { value: 'moving-delivery', label: 'Moving & Delivery', icon: '🚚' },
  { value: 'handyman', label: 'Handyman', icon: '🔧' },
  { value: 'gardening-outdoor', label: 'Gardening & Outdoor', icon: '🌿' },
  { value: 'pet-care', label: 'Pet Care', icon: '🐾' },
  { value: 'personal-assistance', label: 'Personal Assistance', icon: '🤝' },
  { value: 'elderly-special-care', label: 'Elderly & Special Care', icon: '❤️' },
  { value: 'events-hospitality', label: 'Events & Hospitality', icon: '🎉' },
  { value: 'administrative-digital', label: 'Administrative & Digital', icon: '💻' },
  { value: 'seasonal-special', label: 'Seasonal & Special', icon: '❄️' },
  { value: 'other', label: 'Other', icon: '📋' },
];

export default function PostScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const [step, setStep] = useState<'category' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [location, setLocation] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>Sign in to post tasks</Text>
        <TouchableOpacity style={styles.btn} onPress={() => navigation.navigate('Profile')}>
          <Text style={styles.btnText}>Sign In</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (step === 'category') {
    return (
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Post a Task</Text>
          <Text style={styles.headerSub}>What do you need help with?</Text>
        </View>
        <View style={styles.grid}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={styles.categoryCard}
              onPress={() => { setSelectedCategory(cat.value); setStep('form'); }}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{cat.label}</Text>
          </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  const selectedCat = CATEGORIES.find(c => c.value === selectedCategory);

  const handleSubmit = async () => {
    if (!title || title.length < 5) return Alert.alert('Error', 'Title must be at least 5 characters');
    if (!description || description.length < 20) return Alert.alert('Error', 'Description must be at least 20 characters');
    if (!budget || isNaN(Number(budget)) || Number(budget) < 5) return Alert.alert('Error', 'Budget must be at least €5');
    if (!location) return Alert.alert('Error', 'Please enter a location');

    setSubmitting(true);
    try {
      await client.post('/api/tasks', {
        title,
        description,
        budget: Number(budget),
        category: selectedCategory,
        location,
        dueDate: dueDate || undefined,
        priority: priority ? 'HIGH' : 'NORMAL',
      });
      Alert.alert('Task Posted!', 'Your task is now live d taskers can find it.', [
        { text: 'OK', onPress: () => { setStep('category'); setTitle(''); setDescription(''); setBudget(''); setLocation(''); setDueDate(''); setPriority(false); } },
      ]);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to post task');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setStep('category')} style={styles.backBtn}>
            <Text style={styles.backText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCat?.icon} {selectedCat?.label}</Text>
          <Text style={styles.headerSub}>Fill in the task details</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.lab}>Task Title *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder="e.g. Help move furniture to new apartment"
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>

          <Text style={styles.label}>Description *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Describe what you need in detail. Include any special requirements, tools needed, or other relevant info."
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>

          <Text style={styles.label}>Budget (€) *</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.euroSign}>€</Text>
            <TextInput
              style={[styles.input, styles.budgetInput]}
              value={budget}
              onChangeText={setBudget}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.hint}>Minimum €5. Set a fair price to attract good taskers.</Text>

          <Text style={styles.label}>Location *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={setLocation}
            placeholder="e.g. Vilnius, Old Town"
            placeholderTextColor="#9CA3AF"
          />

          <Text style={styles.label}>Due Date (optional)</Text>
          <TextInput
            style={styles.input}
            value={dueDate}
            onChangeText={setDueDate}
            placeholder="e.g. 2026-04-15"
            placeholderTextColor="#9CA3AF"
          />

          <View style={stypriorityRow}>
            <View style={styles.priorityInfo}>
              <Text style={styles.label}>Priority Task</Text>
              <Text style={styles.hint}>Mark as urgent to get faster responses</Text>
            </View>
            <Switch
              value={priority}
              onValueChange={setPriority}
              trackColor={{ false: '#E5E7EB', true: '#1FB6AE' }}
              thumbColor="#fff"
            />
          </View>

          <View style={styles.trustBox}>
            <Text style={styles.trustText}>🔒 Payment is only released when you confirm the task is complete</Text>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Post Task →</Text>}
          </TouchableOpacity>
        </View>
        <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 20 },
  btn: { backgroundColor: '#1FB6AE', paddingHorizontal: 32, paddingVertical: 14, borderRadius: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  header: { paddingTop: 60, paddingHorizontal: 20, paddingBottom: 20 },
  backBtn: { marginBottom: 12 },
  backText: { color: '#1FB6AE', fontWeight: '600', fontSize: 15 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#111827', marginBottom: 4 },
  headerSub: { fontSize: 14, color: '#6B7280' },
  grid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 16, gap: 12 },
  categoryCard: { width: '47%', backgroundColor: '#fff', borderRadius: 16, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 4, elevation: 2 },
  categoryIcon: { fontSize: 32, marginBottom: 8 },
  categoryLabel: { fontSize: 13, fontWeight: '600', color: '#111827', textAlign: 'center' },
  form: { paddingHorizontal: 20 },
  label: { fontSize: 13, fontWeight: '700', color: '#374151', marginBottom: 6, marginTop: 16 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', backgroundColor: '#fff' },
  textarea: { height: 120, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  euroSign: { fontSize: 24, fontWeight: '700', color: '#1FB6AE' },
  budgetInput: { flex: 1 },
  hint: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  priorityInfo: { flex: 1 },
  trustBox: { backgroundColor: '#F0FAFA', borderRadius: 12, padding: 14, marginTop: 20, borderWidth: 1, borderColor: '#B2E8E5' },
  trustText: { color: '#0D9488', fontSize: 13, lineHeight: 18 },
  submitBtn: { backgroundColor: '#1FB6AE', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
