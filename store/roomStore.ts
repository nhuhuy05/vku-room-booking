import { create } from 'zustand';
import { Room } from '../types';
import { MOCK_ROOMS } from '../constants/mockData';

interface RoomState {
  rooms: Room[];
  isRefreshing: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
  getRoomById: (id: string) => Room | undefined;
  updateRoomStatus: (id: string, status: Room['status']) => void;
}

export const useRoomStore = create<RoomState>((set, get) => ({
  rooms: MOCK_ROOMS,
  isRefreshing: false,
  lastUpdated: null,

  refresh: async () => {
    set({ isRefreshing: true });
    // Simulate network delay
    await new Promise((r) => setTimeout(r, 1000));
    // In real app: fetch from API
    // Randomly update some room statuses for demo
    const statuses: Room['status'][] = ['available', 'occupied', 'available', 'available'];
    const updated = MOCK_ROOMS.map((room) => ({
      ...room,
      status: room.status === 'maintenance'
        ? 'maintenance'
        : statuses[Math.floor(Math.random() * statuses.length)],
    }));
    set({ rooms: updated as Room[], isRefreshing: false, lastUpdated: new Date() });
  },

  getRoomById: (id: string) => get().rooms.find((r) => r.id === id),

  updateRoomStatus: (id: string, status: Room['status']) => {
    set((state) => ({
      rooms: state.rooms.map((r) => r.id === id ? { ...r, status } : r),
    }));
  },
}));
