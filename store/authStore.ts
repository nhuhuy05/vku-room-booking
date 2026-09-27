import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User } from '../types';
import { MOCK_USER } from '../constants/mockData';

interface AuthState {
  user: User | null;
  isLoggedIn: boolean;
  isLoading: boolean;
  login: (mssv: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  loadFromStorage: () => Promise<void>;
}

const AUTH_KEY = '@vku_auth_user';

// Mock VKU accounts
const MOCK_ACCOUNTS: { mssv: string; password: string; user: User }[] = [
  { mssv: '21IT001', password: '123456', user: MOCK_USER },
  {
    mssv: '21IT002', password: '123456', user: {
      id: 'u002', mssv: '21IT002', name: 'Trần Thị B',
      email: '21it002@vku.udn.vn', avatar: null,
      faculty: 'Công nghệ thông tin', class: 'CNTT21B',
    }
  },
];

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoggedIn: false,
  isLoading: true,

  login: async (mssv: string, password: string) => {
    const account = MOCK_ACCOUNTS.find(
      (a) => a.mssv.toLowerCase() === mssv.toLowerCase() && a.password === password
    );
    if (account) {
      await AsyncStorage.setItem(AUTH_KEY, JSON.stringify(account.user));
      set({ user: account.user, isLoggedIn: true });
      return true;
    }
    return false;
  },

  logout: async () => {
    await AsyncStorage.removeItem(AUTH_KEY);
    set({ user: null, isLoggedIn: false });
  },

  loadFromStorage: async () => {
    try {
      const raw = await AsyncStorage.getItem(AUTH_KEY);
      if (raw) {
        const user: User = JSON.parse(raw);
        set({ user, isLoggedIn: true, isLoading: false });
      } else {
        set({ isLoading: false });
      }
    } catch {
      set({ isLoading: false });
    }
  },
}));
