import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, TouchableOpacity, Alert } from 'react-native';
import { useStripe } from '@stripe/stripe-react-native';
import { useAuthStore } from '../../store/authStore';
import axios from 'axios';

const API_URL = 'https://rootling-platform-production.up.railway.app';

export default function PaymentScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [ready, setReady] = useState(false);
  const [taskInfo, setTaskInfo] = useState<any>(null);

  useEffect(() => { initializePayment(); }, []);

  const initializePayment = async () => {
    try {
      const headers = { Authorization: `Bearer ${token}` };
      const [paymentRes, taskRes] = await Promise.all([
        axios.post(`${API_URL}/api/payments/create-payment-intent`, { taskId }, { headers }),
        axios.get(`${API_URL}/api/tasks/${taskId}`, { headers }),
      ]);
      const { clientSecret } = paymentRes.data;
      setTaskInfo(taskRes.data.task || taskRes.data.data);
      const { error } = await initPaymentSheet({
        merchantDisplayName: 'Root-ling',
        paymentIntentClientSecret: clientSecret,
        allowsDelayedPaymentMethods: false,
        returnURL: 'rootling://payment-complete',
        appearance: { colors: { primary: '#1FB6AE' } },
      });
      if (error) { Alert.alert('Error', error.message); navigation.goBack(); }
      else setReady(true);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || e?.message || 'Failed to initialize payment');
      navigation.goBack();
    } finally { setLoading(false); }
  };

  const handlePay = async () => {
    const { error } = await presentPaymentSheet();
    if (error) {
      if (error.code !== 'Canceled') Alert.alert('Payment failed', error.message);
    } else {
      Alert.alert('Payment successful!', 'Your task is now live.',
        [{ text: 'View My Tasks', onPress: () => navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] }) }]
      );
    }
  };

  if (loading) return (
    <View style={styles.center}>
      <ActivityIndicator size="large" color="#1FB6AE" />
      <Text style={styles.loadingText}>Preparing payment...</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Complete Payment</Text>
      </View>
      <View style={styles.content}>
        {taskInfo && (
          <View style={styles.taskCard}>
            <Text style={styles.taskTitle}>{taskInfo.title}</Text>
            <View style={styles.row}>
              <Text style={styles.label}>Task budget:</Text>
              <Text style={styles.amount}>EUR {(taskInfo.budget || 0).toFixed(2)}</Text>
            </View>
            <View style={[styles.row, styles.totalRow]}>
              <Text style={styles.totalLabel}>Total:</Text>
              <Text style={styles.totalAmount}>EUR {((taskInfo.budget || 0) + (taskInfo.itemBudget || 0)).toFixed(2)}</Text>
            </View>
          </View>
        )}
        <View style={styles.securityNote}>
          <Text style={styles.securityText}>Payment held securely until task completion</Text>
          <Text style={styles.securitySub}>Powered by Stripe</Text>
        </View>
        <TouchableOpacity style={[styles.payBtn, !ready && styles.payBtnDisabled]} onPress={handlePay} disabled={!ready}>
          <Text style={styles.payBtnText}>Pay and Post Task</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F9FAFB' },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, color: '#6B7280', fontSize: 14 },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { marginRight: 16 },
  backText: { color: '#1FB6AE', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  content: { flex: 1, padding: 16 },
  taskCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 16 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  label: { fontSize: 14, color: '#6B7280' },
  amount: { fontSize: 14, fontWeight: '600', color: '#111827' },
  totalRow: { borderTopWidth: 1, borderTopColor: '#F3F4F6', paddingTop: 12, marginTop: 4 },
  totalLabel: { fontSize: 16, fontWeight: '700', color: '#111827' },
  totalAmount: { fontSize: 18, fontWeight: '800', color: '#1FB6AE' },
  securityNote: { backgroundColor: '#F0FDF4', borderRadius: 12, padding: 16, marginBottom: 24, alignItems: 'center' },
  securityText: { fontSize: 13, fontWeight: '600', color: '#166534', marginBottom: 4 },
  securitySub: { fontSize: 11, color: '#16A34A' },
  payBtn: { backgroundColor: '#1FB6AE', borderRadius: 14, padding: 18, alignItems: 'center' },
  payBtnDisabled: { opacity: 0.5 },
  payBtnText: { color: '#fff', fontSize: 16, fontWeight: '800' },
});
