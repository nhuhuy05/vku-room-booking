import { create } from 'zustand';
import { Booking } from '../types';
import { MOCK_BOOKINGS } from '../constants/mockData';

interface BookingState {
  bookings: Booking[];
  pendingSync: Booking[];
  isLoading: boolean;
  createBooking: (booking: Omit<Booking, 'id' | 'createdAt' | 'synced' | 'status'>) => Promise<Booking>;
  cancelBooking: (id: string) => void;
  getUserBookings: (userId: string) => Booking[];
  getRoomBookingsForDate: (roomId: string, date: string) => Booking[];
  loadFromStorage: () => Promise<void>;
  syncPending: () => Promise<void>;
}

const generateId = () => `bk_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;

export const useBookingStore = create<BookingState>((set, get) => ({
  bookings: MOCK_BOOKINGS,
  pendingSync: [],
  isLoading: false,

  // Không load từ storage để tránh stale data override cancel state
  loadFromStorage: async () => {
    // Intentionally a no-op for demo stability.
    // In production, this would merge server data, not local cache.
    return;
  },

  createBooking: async (data) => {
    const booking: Booking = {
      ...data,
      id: generateId(),
      status: 'confirmed',
      createdAt: new Date().toISOString(),
      synced: false,
    };
    // Cập nhật state ngay lập tức
    set((state) => ({
      bookings: [...state.bookings, booking],
      pendingSync: [...state.pendingSync, booking],
    }));
    // Simulate server sync sau 2s
    setTimeout(() => {
      set((state) => ({
        bookings:    state.bookings.map((b) => b.id === booking.id ? { ...b, synced: true } : b),
        pendingSync: state.pendingSync.filter((b) => b.id !== booking.id),
      }));
    }, 2000);
    return booking;
  },

  // SYNC — hủy ngay, không await, không cần async
  cancelBooking: (id: string) => {
    set((state) => ({
      bookings: state.bookings.map((b) =>
        b.id === id ? { ...b, status: 'cancelled' as const, synced: true } : b
      ),
    }));
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
    set((state) => ({
      bookings:    state.bookings.map((b) => ids.has(b.id) ? { ...b, synced: true } : b),
      pendingSync: [],
    }));
  },
}));
