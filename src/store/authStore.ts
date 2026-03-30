import { create } from 'zustand';
import { User } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  loadFromStorage: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: null,
  isLoading: true,

  setAuth: async (user, token) => {
    await AsyncStorage.setItem('auth', JSON.stringify({ user, token }));
    set({ user, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('auth');
    set({ user: null, token: null });
  },

  loadFromStorage: async () => {
    try {
      const stored = await AsyncStorage.getItem('auth');
      if (stored) {
        const { user, token } = JSON.parse(stored);
        set({ user, token });
      }
    } catch (e) {
      console.error(e);
    } finally {
      set({ isLoading: false });
    }
  },
}));
