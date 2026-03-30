import { useEffect } from 'react';
import * as Location from 'expo-location';
import { useLocationStore } from '../store/locationStore';

export default function useLocation() {
  const { setLocation } = useLocationStore();

  useEffect(() => {
    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        // Default to Vilnius, Lithuania
        setLocation(54.6872, 25.2797);
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
      setLocation(loc.coords.latitude, loc.coords.longitude);
    })();
  }, []);
}
