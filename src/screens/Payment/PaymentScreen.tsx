import React, { useRef, useState } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../../store/authStore';

export default function PaymentScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { token } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const uri = `https://root-ling.com/pay/${taskId}?mobileToken=${token}`;

  // Inject token into localStorage so the web app can use it
  const injectedJS = `
    (function() {
      try {
        var authData = {state: {token: '${token}', isAuthenticated: true}, version: 0};
        localStorage.setItem('auth-storage', JSON.stringify(authData));
        localStorage.setItem('token', '${token}');
      } catch(e) {}
    })();
    true;
  `;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>
      {loading && (
        <View style={styles.loading}>
          <ActivityIndicator size="large" color="#1FB6AE" />
        </View>
      )}
      <WebView
        ref={useRef(null)}
        source={{ uri }}
        style={styles.webview}
        injectedJavaScriptBeforeContentLoaded={injectedJS}
        javaScriptEnabled
        domStorageEnabled
        onLoadEnd={() => setLoading(false)}
        onNavigationStateChange={(navState) => {
          if (navState.url.includes('/my-tasks') || navState.url.includes('success')) {
            navigation.reset({ index: 0, routes: [{ name: 'Tabs' }] });
          }
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', paddingTop: 56, paddingBottom: 12, paddingHorizontal: 16, backgroundColor: '#fff', borderBottomWidth: 1, borderBottomColor: '#F3F4F6' },
  backBtn: { marginRight: 16 },
  backText: { color: '#1FB6AE', fontSize: 16, fontWeight: '600' },
  title: { fontSize: 18, fontWeight: '700', color: '#111827' },
  webview: { flex: 1 },
  loading: { position: 'absolute', top: 80, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', zIndex: 10 },
});
