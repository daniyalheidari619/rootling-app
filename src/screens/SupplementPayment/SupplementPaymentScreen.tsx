import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const API_URL = 'https://rootling-platform-production.up.railway.app';

export default function SupplementPaymentScreen({ route, navigation }: any) {
  const { taskId, clientSecret: initialSecret } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [info, setInfo] = useState<any>(null);

  useEffect(() => {
    initializePayment();
  }, []);

  const initializePayment = async () => {
    try {
      const headers = { Authorization: 'Bearer ' + token };
      let clientSecret = initialSecret;

      if (!clientSecret) {
        const res = await axios.get(API_URL + '/api/payments/supplement/' + taskId, { headers });
        clientSecret = res.data.clientSecret;
        setInfo(res.data);
      }

      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Root-ling',
        paymentIntentClientSecret: clientSecret,
        returnURL: 'com.rootling.app://payment-complete',
        appearance: { colors: { primary: '#1FB6AE' } },
      });

      if (error) { Alert.alert('Error', error.message); navigation.goBack(); }
      else setReady(true);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to initialize payment');
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const handlePay = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      if (error.code !== 'Canceled') Alert.alert('Payment failed', error.message);
    } else {
      try {
        const headers = { Authorization: 'Bearer ' + token };
        await axios.post(API_URL + '/api/payments/confirm-supplementary', {}, { headers });
        Alert.alert('Success', 'Price difference paid successfully!',
          [{ text: 'OK', onPress: () => navigation.goBack() }]
        );
      } catch (e: any) {
        Alert.alert('Error', e?.response?.data?.message || 'Failed to confirm');
      }
    }
  };

  if (loading) return (
    <View style={s.center}>
      <ActivityIndicator size="large" color="#1FB6AE" />
    </View>
  );

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}><Text style={s.back}>Back</Text></TouchableOpacity>
        <Text style={s.title}>Pay Price Difference</Text>
      </View>
      <View style={s.content}>
        <View style={s.infoCard}>
          <Text style={s.infoTitle}>Price Revision</Text>
          <Text style={s.infoDesc}>The tasker proposed a higher price. Pay the difference to confirm the new price.</Text>
          {info?.amount && (
            <Text style={s.amount}>Amount due: EUR {(info.amount / 100).toFixed(2)}</Text>
          )}
        </View>
        <View style={s.securityNote}>
          <Text style={s.securityText}>Payment held securely until task completion</Text>
        </View>
        <TouchableOpacity style={[s.payBtn, !ready && s.payBtnDisabled]} onPress={handlePay} disabled={!ready}>
          <Text style={s.payBtnText}>Pay Now</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  header: { paddingTop: 56, paddingHorizontal: 16, paddingBottom: 12, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6', flexDirection: 'row', alignItems: 'center', gap: 12 },
  back: { color: '#1FB6AE', fontSize: 16, fontWeight: '600', marginRight: 8 },
  title: { fontSize: 18, fontWeight: '800', color: '#111827' },
  content: { flex: 1, padding: 16 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  infoTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 8 },
  infoDesc: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginBottom: 12 },
  amount: { fontSize: 20, fontWeight: '900', color: '#1FB6AE' },
  securityNote: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center' },
  securityText: { fontSize: 13, color: '#166534' },
  payBtn: { backgroundColor: '#1FB6AE', borderRadius: 14, padding: 18, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
