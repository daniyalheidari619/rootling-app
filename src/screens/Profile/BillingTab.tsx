import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TouchableOpacity,
  Alert, ActivityIndicator, Linking,
} from 'react-native';
import { useStripe, CardField } from '@stripe/stripe-react-native';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import client from '../../api/client';

export default function BillingTab({ profile, navigation }: { profile: any; navigation?: any }) {
  const { t } = useTranslation();
  const { confirmSetupIntent } = useStripe();
  const queryClient = useQueryClient();
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardComplete, setCardComplete] = useState(false);
  const [saving, setSaving] = useState(false);
  const [connectLoading, setConnectLoading] = useState(false);

  const { data: paymentMethods = [], refetch: refetchPM } = useQuery({
    queryKey: ['paymentMethods'],
    queryFn: async () => {
      const { data } = await client.get('/api/payments/payment-methods');
      return data.paymentMethods || [];
    },
  });

  const { data: connectStatus, refetch: refetchConnect } = useQuery({
    queryKey: ['connectStatus'],
    queryFn: async () => {
      const { data } = await client.get('/api/payments/connect/status');
      return data;
    },
  });

  const { data: earnings } = useQuery({
    queryKey: ['earnings'],
    queryFn: async () => {
      const { data } = await client.get('/api/payments/balance');
      return data;
    },
  });

  const handleAddCard = async () => {
    if (!cardComplete) return Alert.alert(t('common.error'), 'Please enter complete card details');
    setSaving(true);
    try {
      const { data } = await client.post('/api/payments/setup-intent');
      const { setupIntent, error } = await confirmSetupIntent(data.clientSecret, {
        paymentMethodType: 'Card',
      });
      if (error) {
        Alert.alert(t('common.error'), error.message);
      } else if (setupIntent) {
        await refetchPM();
        setShowCardForm(false);
        Alert.alert(t('common.success') || 'Success', t('billing.cardSaved') || 'Card saved successfully!');
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.response?.data?.error || 'Failed to save card');
    } finally {
      setSaving(false);
    }
  };

  const handleConnectStripe = async () => {
    setConnectLoading(true);
    try {
      const { data } = await client.post('/api/payments/connect/onboard', {
        returnUrl: 'rootling://profile',
      });
      if (data.url) {
        await Linking.openURL(data.url);
      }
    } catch (e: any) {
      Alert.alert(t('common.error'), e.response?.data?.error || 'Failed to start Stripe onboarding');
    } finally {
      setConnectLoading(false);
    }
  };

  const getConnectColor = () => {
    if (connectStatus?.chargesEnabled) return '#10B981';
    if (connectStatus?.accountId) return '#F59E0B';
    return '#EF4444';
  };

  const getConnectLabel = () => {
    if (connectStatus?.chargesEnabled) return t('billing.payoutsActive');
    if (connectStatus?.accountId) return t('billing.setupIncomplete');
    return t('billing.notConnected');
  };

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16 }}>
      {/* Balance */}
      {earnings && (
        <View style={[s.card, { borderColor: '#86EFAC', borderWidth: 2 }]}>
          <Text style={s.lbl}>{t('billing.balance')}</Text>
          <Text style={[s.bigVal, { color: '#10B981', fontSize: 28 }]}>
            €{((earnings?.available || 0) / 100).toFixed(2)}
          </Text>
          <Text style={[s.lbl, { marginTop: 8 }]}>{t('billing.pending')}</Text>
          <Text style={s.bigVal}>€{((earnings?.pending || 0) / 100).toFixed(2)}</Text>
        </View>
      )}

      {/* Subscription */}
      <View style={s.card}>
        <Text style={s.lbl}>{t('billing.subscription')}</Text>
        <Text style={s.bigVal}>{profile?.isSubscriber ? t('billing.premium') : t('billing.free')}</Text>
        {!profile?.isSubscriber && navigation && (
        <TouchableOpacity
          style={[s.primaryBtn, { marginTop: 12, marginBottom: 0 }]}
          onPress={() => navigation.navigate('Subscription')}
        >
          <Text style={s.primaryBtnTxt}>⭐ Upgrade to Premium</Text>
        </TouchableOpacity>
      )}
      </View>

      {/* Payment Methods */}
      <Text style={s.sectionTitle}>{t('billing.paymentMethods')}</Text>
      {paymentMethods.map((pm: any) => (
        <View key={pm.id} style={s.card}>
          <View style={s.row}>
            <Text style={s.bigVal}>{pm.card?.brand?.toUpperCase()} ••••{pm.card?.last4}</Text>
            <Text style={s.mutedTxt}>{t('billing.exp')}: {pm.card?.exp_month}/{pm.card?.exp_year}</Text>
          </View>
        </View>
      ))}

      {!showCardForm ? (
        <TouchableOpacity style={s.secondaryBtn} onPress={() => setShowCardForm(true)}>
          <Text style={s.secondaryBtnTxt}>+ Add New Card</Text>
        </TouchableOpacity>
      ) : (
        <View style={s.card}>
          <Text style={s.lbl}>{t('billing.cardDetails')}</Text>
          <CardField
            postalCodeEnabled={false}
            style={{ height: 50, marginVertical: 8 }}
            cardStyle={{ backgroundColor: '#F9FAFB', textColor: '#111827', borderRadius: 8 }}
            onCardChange={(cardDetails) => setCardComplete(cardDetails.complete)}
          />
          <TouchableOpacity style={s.primaryBtn} onPress={handleAddCard} disabled={saving || !cardComplete}>
            {saving ? <ActivityIndicator color="white" /> : <Text style={s.primaryBtnTxt}>Save Card</Text>}
          </TouchableOpacity>
          <TouchableOpacity style={s.secondaryBtn} onPress={() => setShowCardForm(false)}>
            <Text style={s.secondaryBtnTxt}>Cancel</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Stripe Connect */}
      <Text style={s.sectionTitle}>{t('billing.payoutAccount')}</Text>
      <View style={[s.card, { borderColor: getConnectColor(), borderWidth: 2 }]}>
        <Text style={[s.bigVal, { color: getConnectColor() }]}>{getConnectLabel()}</Text>
        {connectStatus?.chargesEnabled && (
          <Text style={s.mutedTxt}>{t('billing.payoutsDesc') || 'Payments go directly to your bank account after task completion.'}</Text>
        )}
        {connectStatus?.accountId && !connectStatus?.chargesEnabled && (
          <Text style={s.mutedTxt}>{t('billing.setupDesc') || 'Your Stripe account needs additional information.'}</Text>
        )}
        {!connectStatus?.accountId && (
          <Text style={s.mutedTxt}>{t('billing.connectDesc') || 'Connect your bank account to receive payouts.'}</Text>
        )}
      </View>

      <TouchableOpacity
        style={connectStatus?.chargesEnabled ? s.secondaryBtn : s.primaryBtn}
        onPress={handleConnectStripe}
        disabled={connectLoading}
      >
        {connectLoading
          ? <ActivityIndicator color="#1FB6AE" />
          : <Text style={connectStatus?.chargesEnabled ? s.secondaryBtnTxt : s.primaryBtnTxt}>
              {connectStatus?.chargesEnabled
                ? t('billing.manageAccount')
                : connectStatus?.accountId
                  ? t('billing.completeSetup')
                  : t('billing.connectBank')}
            </Text>}
      </TouchableOpacity>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const s = StyleSheet.create({
  card: { backgroundColor: 'white', borderRadius: 12, padding: 16, marginBottom: 12, borderWidth: 1, borderColor: '#E5E7EB' },
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#111827', marginBottom: 12, marginTop: 4 },
  lbl: { fontSize: 13, color: '#6B7280', marginBottom: 4 },
  bigVal: { fontSize: 18, fontWeight: '700', color: '#111827' },
  mutedTxt: { fontSize: 14, color: '#6B7280', lineHeight: 20, marginTop: 4 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  primaryBtn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  primaryBtnTxt: { color: 'white', fontWeight: '700', fontSize: 16 },
  secondaryBtn: { backgroundColor: 'white', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12, borderWidth: 2, borderColor: '#1FB6AE' },
  secondaryBtnTxt: { color: '#1FB6AE', fontWeight: '700', fontSize: 16 },
});
