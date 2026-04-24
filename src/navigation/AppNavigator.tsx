import MyTasksScreen from '../screens/MyTasks/MyTasksScreen';
import PaymentScreen from '../screens/Payment/PaymentScreen';
import RecurringPostScreen from '../screens/Post/RecurringPostScreen';
import ApplicationsScreen from '../screens/Applications/ApplicationsScreen';
import TrackingScreen from '../screens/Tracking/TrackingScreen';
import BrowseScreen from '../screens/Browse/BrowseScreen';
import ForgotPasswordScreen from '../screens/Auth/ForgotPasswordScreen';
import NegotiationsScreen from '../screens/Negotiations/NegotiationsScreen';
import NotificationsScreen from '../screens/Notifications/NotificationsScreen';
import SubscriptionScreen from '../screens/Subscription/SubscriptionScreen';
import { useTranslation } from '../i18n';
import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { NavigationContainer } from '@react-navigation/native';
import { Text, View } from 'react-native';
import { useAuthStore } from '../store/authStore';
import HomeScreen from '../screens/Home/HomeScreen';
import SwipeScreen from '../screens/Swipe/SwipeScreen';
import PostScreen from '../screens/Post/PostScreen';
import MessagesScreen from '../screens/Messages/MessagesScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';
import LoginScreen from '../screens/Auth/LoginScreen';
import RegisterScreen from '../screens/Auth/RegisterScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const TabIcon = ({ icon, focused }: { icon: string; focused: boolean }) => (
  <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icon}</Text>
);

function TabNavigator() {
  const { t } = useTranslation();
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopColor: '#E5E7EB',
          borderTopWidth: 1,
          paddingBottom: 8,
          paddingTop: 8,
          height: 64,
        },
        tabBarActiveTintColor: '#1FB6AE',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
      }}
    >
      <Tab.Screen name="Home" component={HomeScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="🏠" focused={focused} />, tabBarLabel: t('nav.home') }} />
      <Tab.Screen name="Swipe" component={SwipeScreen}
        options={{
          tabBarIcon: ({ focused }) => (
            <View style={{
              backgroundColor: '#1FB6AE', width: 52, height: 52, borderRadius: 26,
              justifyContent: 'center', alignItems: 'center', marginBottom: 8,
              shadowColor: '#1FB6AE', shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3, shadowRadius: 8, elevation: 5,
            }}>
              <Text style={{ fontSize: 24 }}>⚡</Text>
            </View>
          ),
          tabBarLabel: t('nav.findTasks'),
        }} />
      <Tab.Screen name="Post" component={PostScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="➕" focused={focused} />, tabBarLabel: t('nav.post') }} />
      <Tab.Screen name="Messages" component={MessagesScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="💬" focused={focused} />, tabBarLabel: t('nav.messages') }} />
      <Tab.Screen name="Profile" component={ProfileScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon icon="👤" focused={focused} />, tabBarLabel: t('nav.profile') }} />
    </Tab.Navigator>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Payment" component={PaymentScreen} options={{ headerShown: false }} />
        <Stack.Screen name="Subscription" component={SubscriptionScreen} options={{ headerShown: false }} />
      <Stack.Screen name="RecurringPost" component={RecurringPostScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Applications" component={ApplicationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Tracking" component={TrackingScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Browse" component={BrowseScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: false }} />
      <Stack.Screen name="Negotiations" component={NegotiationsScreen} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
}

function MainStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={TabNavigator} />
      <Stack.Screen name="MyTasks" component={MyTasksScreen} options={{ headerShown: false }} />

      <Stack.Screen name="TaskDetail" component={require('../screens/TaskDetail/TaskDetailScreen').default} />
      <Stack.Screen name="ChatScreen" component={require('../screens/Chat/ChatScreen').default} />

    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const { token } = useAuthStore();
  return (
    <NavigationContainer>
      {token ? <MainStack /> : <AuthStack />}
    </NavigationContainer>
  );
}
