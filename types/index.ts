export interface User {
  id: string;
  mssv: string;
  name: string;
  email: string;
  avatar: string | null;
  faculty: string;
  class: string;
}

export interface Room {
  id: string;
  name: string;
  building: string;
  floor: number;
  capacity: number;
  type: 'classroom' | 'lab' | 'seminar';
  amenities: string[];
  status: 'available' | 'occupied' | 'maintenance';
  image: string | null;
  description: string;
}

export interface Booking {
  id: string;
  userId: string;
  roomId: string;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed';
  createdAt: string;
  synced: boolean;
}

export interface TimeSlot {
  id: string;
  label: string;
  start: string;
  end: string;
}
