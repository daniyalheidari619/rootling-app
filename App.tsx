import AsyncStorage from '@react-native-async-storage/async-storage';
import OnboardingScreen from './src/screens/Onboarding/OnboardingScreen';
import { registerForPushNotifications, savePushToken, setupNotificationListeners } from './src/utils/notifications';
import { loadLanguage } from './src/i18n';
import React, { useEffect, useState } from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppNavigator from './src/navigation/AppNavigator';
import { useAuthStore } from './src/store/authStore';
import useLocation from './src/hooks/useLocation';

const queryClient = new QueryClient();

function AppContent() {
  const { loadFromStorage } = useAuthStore();
  const [showOnboarding, setShowOnboarding] = useState<boolean | null>(null);

  useEffect(() => {
    AsyncStorage.getItem('onboardingDone').then(val => {
      setShowOnboarding(val !== 'true');
    });
  }, []);
  useLocation();

  useEffect(() => { loadLanguage();
    loadFromStorage();
    // Register for push notifications
    registerForPushNotifications().then(token => {
      if (token) savePushToken(token);
    });
  }, []);

  return <AppNavigator />;
}

export default function App() {
  if (showOnboarding === null) return null;
  if (showOnboarding) return <OnboardingScreen onDone={() => setShowOnboarding(false)} />;

  return (
    <StripeProvider publishableKey="pk_live_51T87tVE3WAA2JLQ2yiIfbgnem2HP1pWuGKfhXSwk4He4wSlzWvgV6Blg2roh8GUmlVbNvYolUhr5DwbbxlaWMge300pxOMrztM">
      <QueryClientProvider client={queryClient}>
        <AppContent />
      </QueryClientProvider>
    </StripeProvider>
  );
}
