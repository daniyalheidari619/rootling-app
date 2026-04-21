import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Image,
  TouchableOpacity, TextInput, ActivityIndicator, Alert,
  KeyboardAvoidingView, Platform, Switch,
} from 'react-native';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import client from '../../api/client';

const CATEGORIES_DATA = [
  { value: 'home-services', labelKey: 'cat.homeServices', icon: '🏠', subcategories: ['General Cleaning','Deep Cleaning','Window Cleaning','Laundry & Ironing','Carpet Cleaning','Oven Cleaning','Fridge Cleaning','Bathroom Deep Clean','Kitchen Deep Clean','Post-Construction Cleaning','Move-In/Out Cleaning'] },
  { value: 'moving-delivery', labelKey: 'cat.movingDelivery', icon: '🚚', subcategories: ['Furniture Moving','Full House Move','Single Item Delivery','Multiple Item Delivery','Grocery Delivery','Package Pickup','Store Pickup','Junk Removal'] },
  { value: 'handyman', labelKey: 'cat.handyman', icon: '🔧', subcategories: ['Furniture Assembly','Shelf Mounting','TV Mounting','Picture Hanging','Minor Repairs','Door Repairs','Light Fixture Install','Painting','Plumbing Help','Electrical Help'] },
  { value: 'gardening-outdoor', labelKey: 'cat.gardeningOutdoor', icon: '🌿', subcategories: ['Lawn Mowing','Garden Maintenance','Planting','Leaf Removal','Snow Removal','Gutter Cleaning','Pressure Washing','Fence Repair'] },
  { value: 'pet-care', labelKey: 'cat.petCare', icon: '🐾', subcategories: ['Dog Walking','Pet Sitting Home','Pet Sitting Tasker','Pet Drop-In','Pet Feeding','Pet Transportation','Pet Grooming Basic','Litter Box Cleaning','Fish Tank Maintenance'] },
  { value: 'personal-assistance', labelKey: 'cat.personalAssistance', icon: '🤝', subcategories: ['Grocery Shopping','General Errands','Waiting in Line','Gift Shopping','Returns & Exchanges','Prescription Pickup','Dry Cleaning Pickup','Bill Payment','Document Delivery','Car Wash'] },
  { value: 'elderly-special-care', labelKey: 'cat.elderlySpecialCare', icon: '❤️', subcategories: ['Companionship','Grocery Help Elderly','Meal Preparation','Light Housekeeping','Appointment Transport','Technology Help','Walking Assistance','Social Outing'] },
  { value: 'events-hospitality', labelKey: 'cat.eventsHospitality', icon: '🎉', subcategories: ['Party Setup','Party Cleanup','Serving Help','Event Decoration','BBQ Help','Holiday Decoration','Holiday Decoration Removal'] },
  { value: 'administrative-digital', labelKey: 'cat.administrativeDigital', icon: '💻', subcategories: ['Filing','Scanning','Photo Organization','Translation Help','Data Entry','Research','Social Media Help'] },
  { value: 'seasonal-special', labelKey: 'cat.seasonalSpecial', icon: '❄️', subcategories: ['Christmas Tree Setup','Spring Cleaning','Back to School Prep','Holiday Shopping','Garage Sale Help','Donation Dropoff','Storage Organization','Vacation Prep','Return from Vacation','New Baby Prep'] },
  { value: 'other', labelKey: 'cat.other', icon: '📋', subcategories: ['Custom Task','Quick Favor','Creative Help','Learning Help'] },
];

export default function PostScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { t } = useTranslation();
  const [step, setStep] = useState<'category' | 'form'>('category');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [itemBudget, setItemBudget] = useState('');
  const [taskImages, setTaskImages] = useState<string[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showTimePicker, setShowTimePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [location, setLocation] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState(false);
  const [showSubDropdown, setShowSubDropdown] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState<any[]>([]);
  const [searchingLocation, setSearchingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [requiresCar, setRequiresCar] = useState(false);
  const [requiresTools, setRequiresTools] = useState(false);
  const [toolsList, setToolsList] = useState('');
  const [slotsRequired, setSlotsRequired] = useState(1);

  if (!user) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyIcon}>📋</Text>
        <Text style={styles.emptyTitle}>{t('auth.signInPost')}</Text>
        <Text style={styles.emptySub}>{t('auth.signInProfile')}</Text>
      </View>
    );
  }

  if (step === 'category') {
    return (
      <ScrollView nestedScrollEnabled={true} style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{t('post.title')}</Text>
          <Text style={styles.headerSub}>{t('post.subtitle')}</Text>
        </View>
        <View style={styles.grid}>
          {CATEGORIES_DATA.map((cat) => (
            <TouchableOpacity
              key={cat.value}
              style={styles.categoryCard}
              onPress={() => { setSelectedCategory(cat.value); setSubcategory(''); setStep('form'); }}
            >
              <Text style={styles.categoryIcon}>{cat.icon}</Text>
              <Text style={styles.categoryLabel}>{t(cat.labelKey)}</Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ height: 40 }} />
      </ScrollView>
    );
  }

  const selectedCat = CATEGORIES_DATA.find(c => c.value === selectedCategory);

  const searchLocation = async (text: string) => {
    setLocation(text);
    if (text.length < 3) { setLocationSuggestions([]); return; }
    setSearchingLocation(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(text)}&format=json&limit=8&countrycodes=lt,lv,ee,pl,de&addressdetails=1&accept-language=en`,
        { headers: { 'User-Agent': 'RootlingApp/1.0' } }
      );
      const data = await res.json();
      setLocationSuggestions(data);
    } catch (e) {
      setLocationSuggestions([]);
    } finally {
      setSearchingLocation(false);
    }
  };


  const handleAddImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission needed', 'Please allow access to your photo library.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaType.Images,
      allowsMultipleSelection: true,
      quality: 0.7,
      base64: true,
      selectionLimit: 5,
    });
    if (!result.canceled) {
      const newImages = result.assets
        .filter(a => a.base64)
        .map(a => 'data:image/jpeg;base64,' + a.base64);
      setTaskImages(prev => [...prev, ...newImages].slice(0, 5));
    }
  };

  const handleSubmit = async () => {
    if (!subcategory) return Alert.alert('Error', 'Please select a subcategory');
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
        itemBudget: itemBudget ? Number(itemBudget) : 0,
        images: taskImages,
        category: selectedCategory,
        subcategory,
        location,
        dueDate: dueDate || undefined,
        priority: priority ? 'HIGH' : 'NORMAL',
        requiresCar,
        requiresTools,
        toolsList: requiresTools ? toolsList : '',
        slotsRequired,
      });
      Alert.alert(t('post.success'), t('post.successDesc'), [
        { text: 'OK', onPress: () => {
          setStep('category');
          setTitle(''); setDescription(''); setBudget(''); setItemBudget(''); setTaskImages([]);
          setLocation(''); setDueDate(''); setPriority(false); setSubcategory('');
        }},
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
            <Text style={styles.backText}>{t('post.back')}</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{selectedCat?.icon} {t(selectedCat?.labelKey || '')}</Text>
          <Text style={styles.headerSub}>{t('post.formSubtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Text style={styles.label}>{t('post.subcategory')} *</Text>
          <TouchableOpacity style={styles.dropdownBtn} onPress={() => setShowSubDropdown(prev => !prev)}>
            <Text style={subcategory ? styles.dropdownSelected : styles.dropdownPlaceholder}>{subcategory || t('post.selectSubcategory')}</Text>
            <Text style={styles.dropdownArrow}>{showSubDropdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>
          {showSubDropdown && (
            <ScrollView style={styles.dropdownList} nestedScrollEnabled={true} keyboardShouldPersistTaps="handled">
              {selectedCat?.subcategories.map((sub) => (
                <TouchableOpacity key={sub} style={[styles.dropdownItem, subcategory === sub && styles.dropdownItemActive]} onPress={() => { setSubcategory(sub); setShowSubDropdown(false); }}>
                  <Text style={[styles.dropdownItemText, subcategory === sub && styles.dropdownItemTextActive]}>{sub}</Text>
                  {subcategory === sub && <Text style={styles.dropdownCheck}>✓</Text>}
                </TouchableOpacity>
              ))}
            </ScrollView>
          )}

          <Text style={styles.label}>{t('post.taskTitle')} *</Text>
          <TextInput
            style={styles.input}
            value={title}
            onChangeText={setTitle}
            placeholder={t('post.taskTitlePlaceholder')}
            placeholderTextColor="#9CA3AF"
            maxLength={100}
          />
          <Text style={styles.charCount}>{title.length}/100</Text>

          <Text style={styles.label}>{t('post.description')} *</Text>
          <TextInput
            style={[styles.input, styles.textarea]}
            value={description}
            onChangeText={setDescription}
            placeholder={t('post.descriptionPlaceholder')}
            placeholderTextColor="#9CA3AF"
            multiline
            numberOfLines={5}
            maxLength={1000}
          />
          <Text style={styles.charCount}>{description.length}/1000</Text>

          <Text style={styles.label}>{t('post.budget')} *</Text>
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
          <Text style={styles.hint}>{t('post.budgetHint')}</Text>


          <Text style={styles.label}>{t('post.itemBudget')}</Text>
          <View style={styles.budgetRow}>
            <Text style={styles.euroSign}>€</Text>
            <TextInput
              style={[styles.input, styles.budgetInput]}
              value={itemBudget}
              onChangeText={setItemBudget}
              placeholder="0"
              placeholderTextColor="#9CA3AF"
              keyboardType="numeric"
            />
          </View>
          <Text style={styles.hint}>{t('post.itemBudgetHint')}</Text>
          {itemBudget && Number(itemBudget) > 0 && Number(budget) > 0 && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>{t('post.totalUpfront')}</Text>
              <Text style={styles.totalValue}>€{(Number(budget) + Number(itemBudget)).toFixed(2)}</Text>
            </View>
          )}
          <Text style={styles.label}>{t('post.location')} *</Text>
          <TextInput
            style={styles.input}
            value={location}
            onChangeText={searchLocation}
            placeholder={t('post.locationPlaceholder')}
            placeholderTextColor="#9CA3AF"
          />
          {(locationSuggestions || []).length > 0 && (
            <View style={styles.suggestionList}>
              {(locationSuggestions || []).map((item, idx) => (
                <TouchableOpacity
                  key={idx}
                  style={styles.suggestionItem}
                  onPress={() => { setLocation(item.display_name.split(',').slice(0,3).join(',')); setLocationSuggestions([]); }}
                >
                  <Text style={styles.suggestionText} numberOfLines={2}>{item.display_name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.label}>{t('post.dueDate')}</Text>
          <Text style={styles.hint}>{t('post.dueDateHint')}</Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={dueDate.split('T')[0] || ''}
              onChangeText={(val) => {
                const time = dueDate.includes('T') ? dueDate.split('T')[1] : '12:00';
                const combined = val + 'T' + time;
                const chosen = new Date(combined);
                if (chosen < new Date()) { Alert.alert('Invalid date', 'Please choose a future date and time.'); return; }
                setDueDate(combined);
              }}
              placeholder="YYYY-MM-DD"
              placeholderTextCor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              maxLength={10}
            />
            <TextInput
              style={[styles.input, { flex: 1 }]}
              value={dueDate.includes('T') ? dueDate.split('T')[1] : ''}
              onChangeText={(val) => {
                const date = dueDate.split('T')[0] || '';
                if (!date) { Alert.alert('Set date first', 'Please enter the date first.'); return; }
                const combined = date + 'T' + val;
                const chosen = new Date(combined);
                if (chosen < new Date()) { Alert.alert('Invalid time', 'Please choose a future time.'); return; }
                setDueDate(combined);
              }}
              placeholder="HH:MM"
              placeholderTextColor="#9CA3AF"
              keyboardType="numbers-and-punctuation"
              maxLength={5}
            />
          </View>

          <View style={styles.priorityRow}>
            <View style={styles.priorityInfo}>
              <Text style={styles.label}>{t('post.priority')}</Text>
              <Text style={styles.hint}>{t('post.priorityHint')}</Text>
            </View>
            <Switch
              value={priority}
              onValueChange={setPriority}
              trackColor={{ false: '#E5E7EB', true: '#1FB6AE' }}
              thumbColor="#fff"
            />
          </View>

          <Text style={styles.label}>{t('post.photos')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginBottom: 12 }}>
            {(taskImages || []).map((img, idx) => (
              <View key={idx} style={{ marginRight: 8, position: 'relative' }}>
                <Image source={{ uri: img }} style={{ width: 80, height: 80, borderRadius: 8 }} />
                <TouchableOpacity
                  onPress={() => setTaskImages(prev => prev.filter((_, i) => i !== idx))}
                  style={{ position: 'absolute', top: -6, right: -6, backgroundColor: '#EF4444', borderRadius: 10, width: 20, height: 20, justifyContent: 'center', alignItems: 'center' }}>
                  <Text style={{ color: 'white', fontSize: 12, fontWeight: '700' }}>x</Text>
                </TouchableOpacity>
              </View>
            ))}
            {(taskImages || []).length < 5 && (
              <TouchableOpacity onPress={handleAddImage}
                style={{ width: 80, height: 80, borderRadius: 8, borderWidth: 2, borderColor: '#E5E7EB', borderStyle: 'dashed', justifyContent: 'center', alignItems: 'center', backgroundColor: '#F9FAFB' }}>
                <Text style={{ fontSize: 24, color: '#9CA3AF' }}>+</Text>
                <Text style={{ fontSize: 10, color: '#9CA3AF' }}>{t('post.addPhoto')}</Text>
              </TouchableOpacity>
            )}
          </ScrollView>
          <View style={styles.priorityRow}>
            <View style={styles.priorityInfo}>
              <Text style={styles.label}>{t('post.requiresCar')}</Text>
              <Text style={styles.hint}>{t('post.requiresCarHint')}</Text>
            </View>
            <Switch value={requiresCar} onValueChange={setRequiresCar} trackColor={{ false: '#E5E7EB', true: '#1FB6AE' }} thumbColor="#fff" />
          </View>

          <View style={styles.priorityRow}>
            <View style={styles.priorityInfo}>
              <Text style={styles.label}>{t('post.requiresTools')}</Text>
              <Text style={styles.hint}>{t('post.requiresToolsHint')}</Text>
            </View>
            <Switch value={requiresTools} onValueChange={setRequiresTools} trackColor={{ false: '#E5E7EB', true: '#1FB6AE' }} thumbColor="#fff" />
          </View>
          {requiresTools && (
            <>
              <Text style={styles.label}>{t('post.toolsList')}</Text>
              <TextInput
                style={[styles.input, { height: 80 }]}
                value={toolsList}
                onChangeText={setToolsList}
                placeholder={t('post.toolsPlaceholder')}
                placeholderTextColor="#9CA3AF"
                multiline
              />
            </>
          )}

          <Text style={styles.label}>{t('post.slotsRequired')}</Text>
          <Text style={styles.hint}>{t('post.slotint')}</Text>
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 4 }}>
            {[1, 2, 3, 4, 5].map(n => (
              <TouchableOpacity
                key={n}
                onPress={() => setSlotsRequired(n)}
                style={{
                  width: 44, height: 44, borderRadius: 22,
                  backgroundColor: slotsRequired === n ? '#1FB6AE' : '#fff',
                  borderWidth: 2, borderColor: slotsRequired === n ? '#1FB6AE' : '#E5E7EB',
                  justifyContent: 'center', alignItems: 'center',
                }}
              >
                <Text style={{ color: slotsRequired === n ? '#fff' : '#374151', fontWeight: '700' }}>{n}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              onPress={() => setSlotsRequired(slotsRequired < 10 ? slotsRequired + 1 : slotsRequired)}
              style={{ width: 44, height: 44, borderRadius: 22, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center', borderWidth: 2, borderColor: '#E5E7EB' }}
            >
              <Text style={{ color: '#374151', fontWeight: '700' }}>{slotsRequired > 5 ? slotsRequired : '+'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.trustBox}>}>
            <Text style={styles.trustText}>{t('post.paymentNotice')}</Text>
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
            {submitting ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>{t('post.submit')}</Text>}
          </TouchableOpacity>
        </View>
    <View style={{ height: 60 }} />
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24, backgroundColor: '#F7F9FB' },
  emptyIcon: { fontSize: 56, marginBottom: 12 },
  emptyTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  emptySub: { fontSize: 14, color: '#6B7280', textAlign: 'center' },
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
  dropdownBtn: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, backgroundColor: '#fff' },
  dropdownPlaceholder: { color: '#9CA3AF', fontSize: 15 },
  dropdownSelected: { color: '#111827', fontSize: 15, fontWeight: '600' },
  dropdownArrow: { color: '#6B7280', fontSize: 12 },
  dropdownList: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#fff', marginTop: 4, maxHeight: 200 },
  dropdownItem: { padding: 14, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  dropdownItemActive: { backgroundColor: '#F0FAFA' },
  dropdownItemText: { color: '#374151', fontSize: 14 },
  dropdownItemTextActive: { color: '#1FB6AE', fontWeight: '600' },
  dropdownCheck: { color: '#1FB6AE', fontWeight: '700' },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', backgroundColor: '#fff' },
  textarea: { height: 120, textAlignVertical: 'top' },
  charCount: { fontSize: 11, color: '#9CA3AF', textAlign: 'right', marginTop: 4 },
  budgetRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  totalRow: { flexDirection: 'row', justifyContent: 'space-between', backgroundColor: '#F0FDF4', padding: 12, borderRadius: 10, marginTop: 4 },
  totalLabel: { color: '#166534', fontWeight: '600' },
  totalValue: { color: '#16A34A', fontWeight: '800', fontSize: 16 },
  euroSign: { fontSize: 24, fontWeight: '700', color: '#1FB6AE' },
  budgetInput: { flex: 1 },
  hint: { fontSize: 12, color: '#6B7280', marginTop: 4 },
  priorityRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16, backgroundColor: '#fff', borderRadius: 12, padding: 16, borderWidth: 1, borderColor: '#E5E7EB' },
  priorityInfo: { flex: 1 },
  trustBox: { backgroundColor: '#F0FAFA', borderRadius: 12, padding: 14, marginTop: 20, borderWidth: 1, borderColor: '#B2E8E5' },
  trustText: { color: '#0D9488', fontSize: 13, lineHeight: 18 },
  suggestionList: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, backgroundColor: '#fff', marginTop: 4 },
  suggestionItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  suggestionText: { fontSize: 13, color: '#374151' },
  submitBtn: { backgroundColor: '#1FB6AE', borderRadius: 14, padding: 18, alignItems: 'center', marginTop: 20 },
  submitBtnText: { color: '#fff', fontWeight: '800', fontSize: 17 },
});
