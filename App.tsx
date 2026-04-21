import React, { useEffect } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import useLocation from './src/hooks/useLocation';

const queryClient = new QueryClient();

function AppContent() {
  const { loadFromStorage } = useAuthStore();
  useLocation();

  useEffect(() => {
    loadFromStorage();
  }, []);

  return <AppNavigator />;
}

export default function App() {
  return (
    <StripeProvider publishableKey="pk_live_51RPGTSRwz0XZJX0a9Xh5BNJRP9FsJK2JRSmAHnFEw5tqnFBLTwqdNrP3VFOM5TIXIk4OC8DdWW6VBLZE58iBkBZ00VRaFPqpb">
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </StripeProvider>
  );
}
