import { Room, Booking, User } from '../types';

export const MOCK_USER: User = {
  id: 'u001',
  mssv: '21IT001',
  name: 'Nguyễn Văn An',
  email: '21it001@vku.udn.vn',
  avatar: null,
  faculty: 'Công nghệ thông tin',
  class: 'CNTT21A',
};

export const MOCK_ROOMS: Room[] = [
  {
    id: 'A101', name: 'Phòng A101', building: 'Tòa A', floor: 1,
    capacity: 40, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng', 'WiFi'],
    status: 'available',
    image: null, description: 'Phòng học đa năng tầng 1 tòa A, sức chứa 40 sinh viên.',
  },
  {
    id: 'A102', name: 'Phòng A102', building: 'Tòa A', floor: 1,
    capacity: 40, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng'],
    status: 'occupied',
    image: null, description: 'Phòng học tầng 1 tòa A.',
  },
  {
    id: 'A103', name: 'Phòng A103', building: 'Tòa A', floor: 1,
    capacity: 30, type: 'classroom',
    amenities: ['Máy chiếu', 'Bảng trắng'],
    status: 'available',
    image: null, description: 'Phòng học nhỏ tầng 1 tòa A, sức chứa 30 sinh viên.',
  },
  {
    id: 'A201', name: 'Phòng A201', building: 'Tòa A', floor: 2,
    capacity: 50, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng', 'WiFi', 'Micro'],
    status: 'available',
    image: null, description: 'Phòng học lớn tầng 2 tòa A, sức chứa 50 sinh viên.',
  },
  {
    id: 'A202', name: 'Phòng A202', building: 'Tòa A', floor: 2,
    capacity: 40, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng'],
    status: 'maintenance',
    image: null, description: 'Đang bảo trì thiết bị.',
  },
  {
    id: 'A301', name: 'Phòng A301', building: 'Tòa A', floor: 3,
    capacity: 35, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'WiFi'],
    status: 'available',
    image: null, description: 'Phòng học tầng 3 tòa A.',
  },
  {
    id: 'B101', name: 'Phòng B101', building: 'Tòa B', floor: 1,
    capacity: 45, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'Bảng trắng', 'WiFi'],
    status: 'occupied',
    image: null, description: 'Phòng học tầng 1 tòa B.',
  },
  {
    id: 'B102', name: 'Phòng B102', building: 'Tòa B', floor: 1,
    capacity: 40, type: 'classroom',
    amenities: ['Máy chiếu', 'Bảng trắng'],
    status: 'available',
    image: null, description: 'Phòng học tầng 1 tòa B.',
  },
  {
    id: 'B201', name: 'Hội trường B201', building: 'Tòa B', floor: 2,
    capacity: 100, type: 'classroom',
    amenities: ['Máy chiếu', 'Điều hòa', 'WiFi', 'Loa', 'Micro', 'Sân khấu'],
    status: 'available',
    image: null, description: 'Hội trường lớn tầng 2 tòa B, sức chứa 100 người.',
  },
  {
    id: 'LAB01', name: 'Lab CNTT 1', building: 'Tòa C', floor: 1,
    capacity: 30, type: 'lab',
    amenities: ['30 Máy tính', 'Điều hòa', 'Máy chiếu', 'WiFi', 'Máy in'],
    status: 'available',
    image: null, description: 'Phòng thực hành lập trình, 30 máy tính cấu hình cao.',
  },
  {
    id: 'LAB02', name: 'Lab CNTT 2', building: 'Tòa C', floor: 1,
    capacity: 30, type: 'lab',
    amenities: ['30 Máy tính', 'Điều hòa', 'Máy chiếu', 'WiFi'],
    status: 'occupied',
    image: null, description: 'Phòng thực hành mạng máy tính.',
  },
  {
    id: 'LAB03', name: 'Lab CNTT 3', building: 'Tòa C', floor: 2,
    capacity: 25, type: 'lab',
    amenities: ['25 Máy tính', 'Điều hòa', 'Máy chiếu', 'WiFi'],
    status: 'available',
    image: null, description: 'Phòng thực hành đồ họa và thiết kế.',
  },
  {
    id: 'LAB04', name: 'Lab AI/IoT', building: 'Tòa C', floor: 2,
    capacity: 20, type: 'lab',
    amenities: ['20 Máy tính', 'GPU Server', 'Điều hòa', 'WiFi', 'Thiết bị IoT'],
    status: 'available',
    image: null, description: 'Phòng thực hành AI và IoT chuyên dụng.',
  },
  {
    id: 'SEM01', name: 'Phòng Seminar 1', building: 'Tòa A', floor: 4,
    capacity: 20, type: 'seminar',
    amenities: ['TV 65"', 'Điều hòa', 'WiFi', 'Bảng trắng', 'Webcam'],
    status: 'available',
    image: null, description: 'Phòng họp nhóm / seminar nhỏ, tối đa 20 người.',
  },
  {
    id: 'SEM02', name: 'Phòng Seminar 2', building: 'Tòa B', floor: 3,
    capacity: 15, type: 'seminar',
    amenities: ['TV 55"', 'Điều hòa', 'WiFi', 'Bảng trắng'],
    status: 'available',
    image: null, description: 'Phòng thảo luận nhóm nhỏ, tối đa 15 người.',
  },
];

const today = new Date();
const fmt = (d: Date) => d.toISOString().split('T')[0];
const addDays = (d: Date, n: number) => {
  const nd = new Date(d);
  nd.setDate(nd.getDate() + n);
  return nd;
};

export const MOCK_BOOKINGS: Booking[] = [
  {
    id: 'bk001', userId: 'u001', roomId: 'A101', roomName: 'Phòng A101',
    date: fmt(addDays(today, 1)), startTime: '08:00', endTime: '10:00',
    purpose: 'Học nhóm môn Trí tuệ nhân tạo', status: 'confirmed',
    createdAt: new Date().toISOString(), synced: true,
  },
  {
    id: 'bk002', userId: 'u001', roomId: 'LAB01', roomName: 'Lab CNTT 1',
    date: fmt(addDays(today, 2)), startTime: '14:00', endTime: '16:00',
    purpose: 'Thực hành lập trình Web', status: 'confirmed',
    createdAt: new Date().toISOString(), synced: true,
  },
  {
    id: 'bk003', userId: 'u001', roomId: 'SEM01', roomName: 'Phòng Seminar 1',
    date: fmt(addDays(today, -2)), startTime: '10:00', endTime: '11:00',
    purpose: 'Họp nhóm đồ án tốt nghiệp', status: 'completed',
    createdAt: new Date().toISOString(), synced: true,
  },
  {
    id: 'bk004', userId: 'u001', roomId: 'B201', roomName: 'Hội trường B201',
    date: fmt(addDays(today, -5)), startTime: '13:00', endTime: '15:00',
    purpose: 'Thuyết trình môn PTTKHT', status: 'completed',
    createdAt: new Date().toISOString(), synced: true,
  },
  {
    id: 'bk005', userId: 'u001', roomId: 'LAB02', roomName: 'Lab CNTT 2',
    date: fmt(addDays(today, -1)), startTime: '08:00', endTime: '10:00',
    purpose: 'Thực hành mạng máy tính', status: 'cancelled',
    createdAt: new Date().toISOString(), synced: true,
  },
];

export const TIME_SLOTS = [
  { id: '7', label: '07:00 – 08:00', start: '07:00', end: '08:00' },
  { id: '8', label: '08:00 – 09:00', start: '08:00', end: '09:00' },
  { id: '9', label: '09:00 – 10:00', start: '09:00', end: '10:00' },
  { id: '10', label: '10:00 – 11:00', start: '10:00', end: '11:00' },
  { id: '11', label: '11:00 – 12:00', start: '11:00', end: '12:00' },
  { id: '13', label: '13:00 – 14:00', start: '13:00', end: '14:00' },
  { id: '14', label: '14:00 – 15:00', start: '14:00', end: '15:00' },
  { id: '15', label: '15:00 – 16:00', start: '15:00', end: '16:00' },
  { id: '16', label: '16:00 – 17:00', start: '16:00', end: '17:00' },
  { id: '17', label: '17:00 – 18:00', start: '17:00', end: '18:00' },
  { id: '19', label: '19:00 – 20:00', start: '19:00', end: '20:00' },
  { id: '20', label: '20:00 – 21:00', start: '20:00', end: '21:00' },
];
