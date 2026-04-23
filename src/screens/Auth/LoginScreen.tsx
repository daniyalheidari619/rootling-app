import { Eye, EyeOff } from 'lucide-react-native';
import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as Google from 'expo-auth-session/providers/google';
WebBrowser.maybeCompleteAuthSession();
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';


export default function LoginScreen({ navigation }: any) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { lang } = useTranslation();
  const { t } = useTranslation();

  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: '588978066613-6njigohb22ke0tt3fmormd4n2vgr6d1k.apps.googleusercontent.com',
    redirectUri: 'https://auth.expo.io/@daniyalheidari619/rootling-app',
  });

  React.useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.params?.access_token || response.authentication?.accessToken;
      if (accessToken) {
        const authentication = { accessToken };
        handleGoogleToken(authentication.accessToken, 'CLIENT');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Google sign in failed');
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string, role: string) => {
    setGoogleLoading(true);
    try {
      const { data } = await client.post('/api/auth/google/mobile', {
        accessToken,
        role,
      });
      if (data.success) {
        await setAuth(data.data.user, data.data.token);
      } else {
        Alert.alert('Error', data.message || 'Google sign in failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Google sign in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/login', { email, password });
      if (data.success) {
        await setAuth(data.data.user, data.data.token);
      } else {
        Alert.alert('Error', data.message || 'Login failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>{"root-ling"}</Text>
        <Text style={styles.tagline}>{t('auth.tagline')}</Text>
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.welcomeBack')}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder="you@example.com" autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF" />
          <View style={{ position: 'relative' }}>
            <TextInput style={[styles.input, { paddingRight: 48 }]} value={password} onChangeText={setPassword} placeholder={lang === 'lt' ? 'slaptažodis' : 'password'} secureTextEntry={!showPassword} placeholderTextColor="#9CA3AF" />
            <TouchableOpacity onPress={() => setShowPassword(p => !p)} style={{ position: 'absolute', right: 14, top: 14 }}>
              <Text style={{ fontSize: 18 }}>{showPassword ? <EyeOff size={20} color='#9CA3AF' /> : <Eye size={20} color='#9CA3AF' />}</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{t('auth.login')}</Text>}
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>or</Text>
            <View style={styles.dividerLine} />
          </View>
          <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request || googleLoading}>
            {googleLoading ? <ActivityIndicator color="#374151" /> : (
              <><Text style={styles.googleIcon}>G</Text><Text style={styles.googleBtnText}>{t('auth.continueGoogle')}</Text></>
            )}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')} style={styles.link}>
            <Text style={[styles.linkText, { marginBottom: 8 }]}>{lang === 'lt' ? 'Pamiršote slaptažodį?' : 'Forgot password?'}</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Register')} style={styles.link}>
            <Text style={styles.linkText}>{t('auth.noAccount')} <Text style={styles.linkBold}>{t('auth.register')}</Text></Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F7F9FB', alignItems: 'center', justifyContent: 'center', padding: 24 },
  logo: { fontSize: 36, fontWeight: '800', color: '#1FB6AE', marginBottom: 4 },
  tagline: { fontSize: 14, color: '#6B7280', marginBottom: 32 },
  card: { width: '100%', backgroundColor: '#fff', borderRadius: 20, padding: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.08, shadowRadius: 12, elevation: 4 },
  title: { fontSize: 22, fontWeight: '700', color: '#111827', marginBottom: 24 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', marginBottom: 16 },
  btn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, gap: 10, backgroundColor: '#fff' },
  googleIcon: { fontSize: 16, fontWeight: '800', color: '#1FB6AE' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#1FB6AE', fontWeight: '700' },
});
