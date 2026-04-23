import React, { useRef } from 'react';
import { View, StyleSheet, ActivityIndicator, TouchableOpacity, Text } from 'react-native';
import { WebView } from 'react-native-webview';
import { useAuthStore } from '../../store/authStore';

export default function PaymentScreen({ route, navigation }: any) {
  const { taskId } = route.params;
  const { token } = useAuthStore();
  const uri = `https://root-ling.com/pay/${taskId}?mobileToken=${token}`;

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Payment</Text>
      </View>
      <WebView
        ref={useRef(null)}
        source={{ uri }}
        style={styles.webview}
        startInLoadingState
        renderLoading={() => (
          <View style={styles.loading}>
            <ActivityIndicator size="large" color="#1FB6AE" />
          </View>
        )}
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
  webview: { flex: 1 
  loading: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
});
