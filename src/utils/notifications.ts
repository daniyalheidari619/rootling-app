import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform } from 'react-native';
import client from '../api/client';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

export async function registerForPushNotifications(): Promise<string | null> {
  if (!Device.isDevice) {
    console.log('Push notifications only work on physical devices');
    return null;
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;

  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }

  if (finalStatus !== 'granted') {
    console.log('Push notification permission denied');
    return null;
  }

  const token = (await Notifications.getExpoPushTokenAsync({
    projectId: 'a2972e1d-37e1-42a6-b275-d55237a5ef32',
  })).data;

  if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1FB6AE',
    });
  }

  console.log('EXPO PUSH TOKEN:', token);
  return token;
}

export async function savePushToken(token: string): Promise<void> {
  try {
    await client.post('/api/notifications/push-token', { token, platform: Platform.OS });
  } catch (e) {
    console.error('Failed to save push token:', e);
  }
}

export function setupNotificationListeners(navigation: any) {
  // Handle notification tap when app is in background/closed
  const subscription = Notifications.addNotificationResponseReceivedListener(response => {
    const data = response.notification.request.content.data as any;
    if (data?.type === 'message' && data?.taskId) {
      navigation.navigate('ChatScreen', { taskId: data.taskId });
    } else if (data?.taskId) {
      navigation.navigate('TaskDetail', { task: { id: data.taskId } });
    } else if (data?.type === 'application') {
      navigation.navigate('MyTasks');
    } else if (data?.type === 'message') {
      navigation.navigate('Messages');
    }
  });

  return subscription;
}
