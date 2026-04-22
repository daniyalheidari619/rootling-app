import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import client from '../../api/client';
import { useTranslation } from '../../i18n';

export default function ForgotPasswordScreen({ navigation }: any) {
  const { lang } = useTranslation();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async () => {
    if (!email) return Alert.alert('Error', 'Please enter your email');
    setLoading(true);
    try {
      await client.post('/api/auth/forgot-password', { email });
      setSent(true);
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={s.container}>
        <Text style={s.logo}>root-ling</Text>
        <View style={s.card}>
          {sent ? (
            <>
              <Text style={s.title}>{lang === 'lt' ? 'Patikrinkite el. paštą' : 'Check your email'}</Text>
              <Text style={s.desc}>{lang === 'lt' ? 'Išsiuntėme slaptažodžio atstatymo nuorodą.' : 'We sent a password reset link to your email.'}</Text>
              <TouchableOpacity style={s.btn} onPress={() => navigation.navigate('Login')}>
                <Text style={s.btnText}>{lang === 'lt' ? 'Grįžti į prisijungimą' : 'Back to Sign In'}</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={s.title}>{lang === 'lt' ? 'Atstatyti slaptažodį' : 'Reset Password'}</Text>
              <Text style={s.desc}>{lang === 'lt' ? 'Įveskite savo el. paštą ir mes išsiųsime atstatymo nuorodą.' : 'Enter your email and we will send you a reset link.'}</Text>
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF" />
              <TouchableOpacity style={s.btn} onPress={handleSubmit} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={s.btnText}>{lang === 'lt' ? 'Siųsti nuorodą' : 'Send Reset Link'}</Text>}
              </TouchableOpacity>
              <TouchableOpacity onPress={() => navigation.goBack()} style={s.link}>
                <Text style={s.linkText}>{lang === 'lt' ? '← Atgal' : '← Back'}</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F7F9FB', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '800', color: '#1FB6AE', marginBottom: 32 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 12 },
  desc: { fontSize: 14, color: '#6B7280', marginBottom: 20, lineHeight: 20 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', marginBottom: 16, backgroundColor: '#F9FAFB' },
  btn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { alignItems: 'center' },
  linkText: { color: '#1FB6AE', fontWeight: '600' },
});
