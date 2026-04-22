import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ActivityIndicator, Linking } from 'react-native';
import * as Location from 'expo-location';
import { io, Socket } from 'socket.io-client';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n';

const BACKEND_URL = 'https://rootling-platform-production.up.railway.app';

interface Props {
  route: { params: { task: any; isTasker: boolean } };
  navigation: any;
}

export default function TrackingScreen({ route, navigation }: Props) {
  const { task, isTasker } = route.params;
  const { user } = useAuthStore();
  const { lang } = useTranslation();
  const socketRef = useRef<Socket | null>(null);
  const locationWatchRef = useRef<any>(null);
  const [connected, setConnected] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [taskerLocation, setTaskerLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [myLocation, setMyLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

  useEffect(() => {
    const socket = io(BACKEND_URL, { transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      setConnected(true);
      socket.emit('join-task', { taskId: task.id, userId: user?.id, role: isTasker ? 'tasker' : 'client' });
    });

    socket.on('disconnect', () => setConnected(false));

    socket.on('tasker-location', (data: any) => {
      setTaskerLocation({ lat: data.latitude, lng: data.longitude });
      setLastUpdate(new Date());
    });

    socket.on('tasker-location-stopped', () => setTaskerLocation(null));

    return () => {
      socket.disconnect();
      if (locationWatchRef.current) locationWatchRef.current.remove();
    };
  }, []);

  const startSharing = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      return Alert.alert('Error', lang === 'lt' ? 'Reikalingas leidimas naudoti vietą' : 'Location permission required');
    }

    setSharing(true);
    locationWatchRef.current = await Location.watchPositionAsync(
      { accuracy: Location.Accuracy.High, timeInterval: 5000, distanceInterval: 10 },
      (loc) => {
        const { latitude, longitude, accuracy, heading, speed } = loc.coords;
        setMyLocation({ lat: latitude, lng: longitude });
        socketRef.current?.emit('update-location', {
          taskId: task.id,
          taskerId: user?.id,
          latitude, longitude, accuracy, heading, speed,
        });
      }
    );
  };

  const stopSharing = () => {
    if (locationWatchRef.current) {
      locationWatchRef.current.remove();
      locationWatchRef.current = null;
    }
    socketRef.current?.emit('stop-location-sharing', { taskId: task.id, taskerId: user?.id });
    setSharing(fale);
    setMyLocation(null);
  };

  const openInMaps = (lat: number, lng: number) => {
    const url = `https://maps.google.com/?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  const openTaskLocation = () => {
    if (task.locationLat && task.locationLng) {
      openInMaps(task.locationLat, task.locationLng);
    } else if (task.location) {
      Linking.openURL(`https://maps.google.com/?q=${encodeURIComponent(task.location)}`);
    }
  };

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={s.back}>← {lang === 'lt' ? 'Atgal' : 'Back'}</Text>
        </TouchableOpacity>
        <View style={[s.statusDot, { backgroundColor: connected ? '#10B981' : '#EF4444' }]} />
      </View>

      <View style={s.taskCard}>
        <Text style={s.taskTitle} numberOfLines={2}>{task.title}</Text>
        <Text style={s.taskLocation}>📍 {task.location}</Text>
      </View>

      {isTasker ? (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'lt' ? 'Dalinkitės savo vieta' : 'Share Your Location'}</Text>
          <Text style={s.sectionDesc}>
            {lang === 'lt'
              ? 'Klientas galės matyti jūsų buvimo vietą realiuoju laiku.'
              : 'The client will be able to see your location in real time.'}
          </Text>

          {myLocation && (
            <View style={s.locationCard}>
              <Text style={s.locationLabel}>{lang === 'lt' ? 'Jūsų vieta' : 'Your location'}</Text>
              <Text style={s.locationCoords}>{myLocation.lat.toFixed(4)}, {myLocation.lng.toFixed(4)}</Text>
              <TouchableOpacity onPress={() => openInMaps(myLocation.lat, myLocation.lng)} style={s.mapsBtn}>
                <Text style={s.mapsBtnText}>🗺 {lang === 'lt' ? 'Atidaryti žemėlapyje' : 'Open in Maps'}</Text>
              </TouchableOpacity>
            </View>
          )}

          <TouchableOpacity
            style={[s.btn, sharing ? s.btnRed : s.btnGreen]}
            onPress={sharing ? stopSharing : startSharing}
          >
 <Text style={s.btnText}>
              {sharing
                ? (lang === 'lt' ? '⏹ Sustabdyti dalinimąsi' : '⏹ Stop Sharing')
                : (lang === 'lt' ? '▶ Pradėti dalintis vieta' : '▶ Start Sharing Location')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity style={s.mapsBtn} onPress={openTaskLocation}>
            <Text style={s.mapsBtnText}>🗺 {lang === 'lt' ? 'Užduoties vieta žemėlapyje' : 'Task location in Maps'}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={s.section}>
          <Text style={s.sectionTitle}>{lang === 'lt' ? 'Vykdytojo vieta' : 'Tasker Location'}</Text>

          {!taskerLocation ? (
            <View style={s.waitCard}>
              <ActivityIndicator color="#1FB6AE" style={{ marginBottom: 12 }} />
              <Text style={s.waitText}>
                {lang === 'lt' ? 'Laukiama vykdytojo vietos...' : 'Waiting for tasker location...'}
              </Text>
              <Text style={s.waitSubText}>
                {lang === 'lt' ? 'Vykdytojas turi pradėti dalintis savo vieta.' : 'The tasker needs to start sharin.'}
              </Text>
            </View>
          ) : (
            <View style={s.locationCard}>
              <Text style={s.locationLabel}>{lang === 'lt' ? 'Vykdytojo vieta' : 'Tasker is here'}</Text>
              <Text style={s.locationCoords}>{taskerLocation.lat.toFixed(4)}, {taskerLocation.lng.toFixed(4)}</Text>
              {lastUpdate && (
                <Text style={s.lastUpdate}>
                  {lang === 'lt' ? 'Atnaujinta' : 'Updated'}: {lastUpdate.toLocaleTimeString()}
                </Text>
              )}
              <TouchableOpacity onPress={() => openInMaps(taskerLocation.lat, taskerLocation.lng)} style={s.mapsBtn}>
                <Text style={s.mapsBtnText}>🗺 {lang === 'lt' ? 'Sekti žemėlapyje' : 'Track in Maps'}</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F7F9FB' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 60, paddingHorizontal: 20, paddingBottom: 16 },
  back: { color: '#1FB6AE', fontWeight: '600', fontSize: 16 },
  statusDot: { width: 10, height: 10, borderRadius: 5 },
  taskCard: { backgroundColor: '#fff', marginHorizontal: 16, borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#E5E7EB', marginBottom: 16 },
  taskTitle: { fontSize: 16, fontWeight: '700', color: '#111827', marginBottom: 6 },
  taskLocation: { fontSize: 13, color: '#6B7280' },
  section: { margin: 16 },
  sectionTitle: { fontSize: 20, fontWeight: '700', color: '#111827', marginBottom: 8 },
  sectionDesc: { fontSize: 14, color: '#6B7280', marginBottom: 16, lineHeight: 20 },
  locationCard: { backgroundColor: '#F0FAFA', borderRadius: 14, padding: 16, borderWidth: 1, borderColor: '#1FB6AE', marginBottom: 16 },
  locationLabel: { fontSize: 12, color: '#1FB6AE', fontWeight: '700', marginBottom: 4 },
  locationCoords: { fontSize: 16, fontWeight: '600', color: '#111827', marginBottom: 8 },
  lastUpdate: { fontSize: 12, color: '#9CA3AF', marginBottom: 8 },
  waitCard: { backgroundColor: '#fff', borderRadius: 14, padding: 24, borderWidth: 1, borderColor: '#E5E7EB', alignItems: 'center', marginBottom: 16 },
  waitText: { fontSize: 16, fontWeight: '600', color: '#111827', textAlign: 'center', marginBottom: 8 },
  waitSubText: { fontSize: 13, color: '#6B7280', textAlign: 'center' },
  btn: { borderRadius: 14, padding: 16, alignItems: 'center', marginBottom: 12 },
  btnGreen: { backgroundColor: '#10B981' },
  btnRed: { backgroundColor: '#EF4444' },
  btnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  mapsBtn: { backgroundColor: '#fff', borderRadius: 12, padding: 14, alignItems: 'center', borderWidth: 1.5, borderColor: '#1FB6AE' },
  mapsBtnText: { color: '#1FB6AE', fontWeight: '600', fontSize: 14 },
});
