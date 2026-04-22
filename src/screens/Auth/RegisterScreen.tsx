import { useTranslation } from '../../i18n';
import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, ActivityIndicator, KeyboardAvoidingView,
  Platform, ScrollView, Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import * as AuthSession from 'expo-auth-session';
import { useAuthStore } from '../../store/authStore';
import client from '../../api/client';

WebBrowser.maybeCompleteAuthSession();

export default function RegisterScreen({ navigation }: any) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { setAuth } = useAuthStore();
  const { lang } = useTranslation();
  const { t } = useTranslation();

  const redirectUri = AuthSession.makeRedirectUri({ useProxy: true });
  const [request, response, promptAsync] = AuthSession.useAuthRequest(
    {
      clientId: '588978066613-6njigohb22ke0tt3fmormd4n2vgr6d1k.apps.googleusercontent.com',
      redirectUri,
      scopes: ['openid', 'profile', 'email'],
      responseType: AuthSession.ResponseType.Token,
    },
    { authorizationEndpoint: 'https://accounts.google.com/o/oauth2/v2/auth' }
  );

  React.useEffect(() => {
    if (response?.type === 'success') {
      const accessToken = response.params?.access_token || response.authentication?.accessToken;
      if (accessToken) {
        const authentication = { accessToken };
        handleGoogleToken(authentication.accessToken, 'BOTH');
      }
    } else if (response?.type === 'error') {
      Alert.alert('Error', 'Google sign up failed');
    }
  }, [response]);

  const handleGoogleToken = async (accessToken: string, selectedRole: string) => {
    setGoogleLoading(true);
    try {
      const { data } = await client.post('/api/auth/google/mobile', {
        accessToken,
        role: 'BOTH',
      });
      if (data.success) {
        await setAuth(data.data.user, data.data.token);
      } else {
        Alert.alert('Error', data.message || 'Google sign up failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Google sign up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!name || !email || !password) return Alert.alert('Error', 'Please fill in all fields');
    setLoading(true);
    try {
      const { data } = await client.post('/api/auth/register', { name, email, password, role: 'BOTH' });
      if (data.success) {
        Alert.alert('Check your email', 'We sent a verification link to your email.', [
          { text: 'OK', onPress: () => navigation.navigate('Login') },
        ]);
      } else {
        Alert.alert('Error', data.message || 'Registration failed');
      }
    } catch (e: any) {
      Alert.alert('Error', e?.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.logo}>root-ling</Text>
        <Text style={styles.tagline}>{t('auth.joinTagline')}</Text>
        <View style={styles.card}>
          <Text style={styles.title}>{t('auth.createAccount')}</Text>
          <Text style={styles.label}>{t('auth.iWantTo')}</Text>
          <TouchableOpacity style={styles.googleBtn} onPress={() => promptAsync()} disabled={!request || googleLoading}>
            {googleLoading ? <ActivityIndicator color="#374151" /> : (
              <><Text style={styles.googleIcon}>G</Text><Text style={styles.googleBtnText}>{t('auth.continueGoogle')}</Text></>
            )}
          </TouchableOpacity>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>{lang === 'lt' ? 'arba registruokitės el. paštu' : 'or sign up with email'}</Text>
            <View style={styles.dividerLine} />
          </View>
          <Text style={styles.label}>{lang === 'lt' ? 'Vardas Pavardė' : 'Full Name'}</Text>
          <TextInput style={styles.input} value={name} onChangeText={setName} placeholder={lang === "lt" ? "Vardas Pavardė" : "John Smith"} placeholderTextColor="#9CA3AF" />
          <Text style={styles.label}>{lang === 'lt' ? 'El. paštas' : 'Email'}</Text>
          <TextInput style={styles.input} value={email} onChangeText={setEmail} placeholder={lang === "lt" ? "jusu@pastas.lt" : "you@example.com"} autoCapitalize="none" keyboardType="email-address" placeholderTextColor="#9CA3AF" />
          <Text style={styles.label}>{lang === 'lt' ? 'Slaptažodis' : 'Password'}</Text>
          <TextInput style={styles.input} value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry placeholderTextColor="#9CA3AF" />
          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>{lang === 'lt' ? 'Sukurti paskyrą' : 'Create Account'}</Text>}
          </TouchableOpacity>
          <TouchableOpacity onPress={() => navigation.navigate('Login')} style={styles.link}>
            <Text style={styles.linkText}>{t('auth.hasAccount')} <Text style={styles.linkBold}>{t('auth.login')}</Text></Text>
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
  label: { fontSize: 13, fontWeight: '600', color: '#374151', marginBottom: 6 },
  roleRow: { flexDirection: 'row', gap: 12, marginBottom: 20 },
  roleBtn: { flex: 1, borderWidth: 2, borderColor: '#E5E7EB', borderRadius: 12, padding: 12, alignItems: 'center' },
  roleBtnActive: { borderColor: '#1FB6AE', backgroundColor: '#F0FAFA' },
  roleText: { color: '#6B7280', fontWeight: '600', fontSize: 14 },
  roleTextActive: { color: '#1FB6AE' },
  googleBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, gap: 10, backgroundColor: '#fff', marginBottom: 8 },
  googleIcon: { fontSize: 16, fontWeight: '800', color: '#1FB6AE' },
  googleBtnText: { fontSize: 15, fontWeight: '600', color: '#374151' },
  dividerRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 16 },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E5E7EB' },
  dividerText: { marginHorizontal: 12, color: '#9CA3AF', fontSize: 13 },
  input: { borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 14, fontSize: 15, color: '#111827', marginBottom: 16, backgroundColor: '#F9FAFB' },
  btn: { backgroundColor: '#1FB6AE', borderRadius: 12, padding: 16, alignItems: 'center', marginTop: 8 },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  link: { marginTop: 16, alignItems: 'center' },
  linkText: { color: '#6B7280', fontSize: 14 },
  linkBold: { color: '#1FB6AE', fontWeight: '700' },
});
