import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Booking, User } from '../types';
import { MOCK_BOOKINGS, MOCK_USER } from '../constants/mockData';

const BOOKINGS_STORAGE_KEY = '@vku_bookings_data';
const USER_STORAGE_KEY = '@vku_booking_user_session';

interface BookingState {
  bookings: Booking[];
  pendingSync: Booking[];
  currentUser: User | null;
  isLoading: boolean;
  
  // User Session management
  setCurrentUser: (user: User | null) => Promise<void>;
  
  // Booking actions
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'synced' | 'status' | 'passCode'>) => Promise<Booking>;
  cancelBooking: (id: string) => Promise<void>;
  checkInBooking: (id: string) => Promise<void>;
  getUserBookings: (userId: string) => Booking[];
  getRoomBookingsForDate: (roomId: string, date: string) => Booking[];
  loadFromStorage: () => Promise<void>;
  syncPending: () => Promise<void>;
}

const generateId = () => `bk_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
const generatePassCode = (roomId: string) =>
  `VKU-PASS-${roomId.replace(/\s+/g, '')}-${Math.floor(1000 + Math.random() * 9000)}`;

// Helper to safely persist bookings
const persistToStorage = async (bookings: Booking[]) => {
  try {
    await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
  } catch (err) {
    console.warn('[BookingStore] Failed to save bookings to AsyncStorage:', err);
  }
};

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: MOCK_BOOKINGS,
  pendingSync: [],
  currentUser: MOCK_USER,
  isLoading: false,

  setCurrentUser: async (user: User | null) => {
    try {
      if (user) {
        await AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
      } else {
        await AsyncStorage.removeItem(USER_STORAGE_KEY);
      }
      set({ currentUser: user });
    } catch (err) {
      console.warn('[BookingStore] Failed to persist user session:', err);
      set({ currentUser: user });
    }
  },

  loadFromStorage: async () => {
    set({ isLoading: true });
    try {
      // 1. Load User Session
      const rawUser = await AsyncStorage.getItem(USER_STORAGE_KEY);
      if (rawUser) {
        set({ currentUser: JSON.parse(rawUser) });
      }

      // 2. Load Bookings
      const rawBookings = await AsyncStorage.getItem(BOOKINGS_STORAGE_KEY);
      if (rawBookings) {
        const parsed: Booking[] = JSON.parse(rawBookings);
        if (Array.isArray(parsed) && parsed.length > 0) {
          set({ bookings: parsed, isLoading: false });
          return;
        }
      }
      // If no stored bookings yet, initialize with MOCK_BOOKINGS and save
      await AsyncStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(MOCK_BOOKINGS));
      set({ bookings: MOCK_BOOKINGS, isLoading: false });
    } catch (err) {
      console.warn('[BookingStore] loadFromStorage error:', err);
      set({ bookings: MOCK_BOOKINGS, isLoading: false });
    }
  },

  createBooking: async (data) => {
    const newBooking: Booking = {
      ...data,
      id: generateId(),
      passCode: generatePassCode(data.roomId),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      synced: false,
    };

    const updated = [newBooking, ...get().bookings];
    set((state) => ({
      bookings: updated,
      pendingSync: [...state.pendingSync, newBooking],
    }));

    // Persist immediately to AsyncStorage
    await persistToStorage(updated);

    // Simulate server sync after 2s
    setTimeout(async () => {
      const currentBookings = get().bookings;
      const syncedBookings = currentBookings.map((b) =>
        b.id === newBooking.id ? { ...b, synced: true } : b
      );
      set((state) => ({
        bookings: syncedBookings,
        pendingSync: state.pendingSync.filter((b) => b.id !== newBooking.id),
      }));
      await persistToStorage(syncedBookings);
    }, 2000);

    return newBooking;
  },

  cancelBooking: async (id: string) => {
    const updated = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'cancelled' as const, synced: true } : b
    );
    set({ bookings: updated });
    await persistToStorage(updated);
  },

  checkInBooking: async (id: string) => {
    const updated = get().bookings.map((b) =>
      b.id === id ? { ...b, status: 'completed' as const, synced: true } : b
    );
    set({ bookings: updated });
    await persistToStorage(updated);
  },

  getUserBookings: (userId: string) => {
    return get().bookings.filter((b) => b.userId === userId);
  },

  getRoomBookingsForDate: (roomId: string, date: string) => {
    return get().bookings.filter(
      (b) => b.roomId === roomId && b.date === date && b.status !== 'cancelled'
    );
  },

  syncPending: async () => {
    const pending = get().pendingSync;
    if (pending.length === 0) return;
    await new Promise((r) => setTimeout(r, 800));
    const ids = new Set(pending.map((b) => b.id));
    const updated = get().bookings.map((b) =>
      ids.has(b.id) ? { ...b, synced: true } : b
    );
    set({
      bookings: updated,
      pendingSync: [],
    });
    await persistToStorage(updated);
  },
}));
