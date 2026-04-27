import Reacport { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useTranslation } from '../../i18n';

export default function NgoScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const isLt = lang === 'lt';

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>←</Text></TouchableOpacity>
        <Text style={s.title}>{isLt ? 'NVO palaikymas' : 'NGO Support'}</Text>
      </View>
      <ScrollView contentContainerStyle={{ padding: 16 }}>
        <View style={s.banner}>
          <Text style={s.bannerEmoji}>🤝</Text>
          <Text style={s.bannerTitle}>{isLt ? 'Savanorių užduotys' : 'Volunteer Tasks'}</Text>
          <Text style={s.bannerDesc}>{isLt ? 'Root-ling palaiko NVO ir labdaros organizacijas, leisdama skelbti nemokamas savanorių užduotis.' : 'Root-ling supports NGOs and charities by allowing them to post free volunteer tasks.'}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Kaip tai veikia' : 'How it works'}</Text>
          <Text style={s.cardDesc}>{isLt ? '1. Registruokite savo organizaciją
2. Skelbkite savanorių užduotis
3. Savanoriai gali kreiptis be mokesčių
4. Koordinuokite per platformos žinutes' : '1. Register your organization
2. Post volunteer tasks
3. Volunteers can apply for free
4. Coordinate via platform messages'}</Text>
        </View>
        <View style={s.card}>
          <Text style={s.cardTitle}>{isLt ? 'Tinkami subjektai' : 'Eligible entities'}</Text>
          <Text style={s.cardDesc}>{isLt ? 'Registruotos NVO, labdaros fondai, bendruomeninės organizacijos ir kiti ne pelno siekiantys subjektai.' : 'Registered NGOs, charitable foundations, community organizations, and other non-profit entities.'}</Text>
        </View>
        <View style={s.contactCard}>
          <Text style={s.contactTitle}>{isLt ? 'Susisiekite su mumis' : 'Contact us'}</Text>
          <Text style={s.contactDesc}>{isLt ? 'Daugiau informacijos apie NVO programą:' : 'For more information about our NGO program:'}</Text>
          <Text style={s.contactEmail}>support@root-ling.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 20, fontWeight: '600' },
  title: { fontSize: 20, fontWeight: '800', color: '#111827' },
  banner: { backgroundColor: '#F0FDF4', borderRadius: 16, padding: 24, marginBottom: 16, alignItems: 'center' },
  bannerEmoji: { fontSize: 48, marginBottom: 12 },
  bannerTitle: { fontSize: 20, fontWeight: '800', color: '#111827', marginBottom: 8, textAlign: 'center' },
  bannerDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, textAlign: 'center' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 12 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: '#111827', marginBottom: 10 },
  cardDesc: { fontSize: 13, color: '#6B7280', lineHeight: 22 },
  contactCard: { backgroundColor: '#1FB6AE', borderRadius: 16, padding: 20, alignItems: 'center', marginBottom: 32 },
  contactTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 8 },
  contactDesc: { fontSize: 13, color: '#fff', opacity: 0.9, marginBottom: 4 },
  contactEmail: { fontSize: 14, fontWeight: '700', color: '#fff' },
});
