# VKU Đặt Phòng Học & Lab 📱

[![Demo](https://img.shields.io/badge/🌐_Demo_Live-vku--room--booking.vercel.app-blue?style=for-the-badge)](https://vku-room-booking.vercel.app)


Ứng dụng đặt phòng học và phòng lab của Đại học Công nghệ Việt - Hàn (VKU).

## Tính năng

- 🔐 **Đăng nhập** bằng tài khoản sinh viên VKU (MSSV)
- 🏫 **Xem danh sách** phòng học, lab, seminar theo thời gian thực
- 🔍 **Tìm kiếm** phòng theo tên, tòa nhà, loại phòng, trạng thái
- 📅 **Đặt phòng** theo khung giờ (7:00 – 21:00)
- ❌ **Hủy đặt phòng** dễ dàng
- 📋 **Lịch sử** đặt phòng (Sắp tới / Đã qua / Đã hủy)
- 📴 **Offline support** — lưu local, tự đồng bộ khi có mạng
- 🔔 **Thông báo** nhắc nhở trước giờ sử dụng

## Cài đặt & Chạy

```bash
# Cài dependencies
npm install

# Chạy development server
npm start

# Hoặc chạy trực tiếp trên thiết bị
npm run android
npm run ios
```

## Tài khoản Demo

| MSSV | Mật khẩu |
|------|----------|
| 21IT001 | 123456 |
| 21IT002 | 123456 |

## Cấu trúc dự án

```
vku-room-booking/
├── app/
│   ├── (auth)/login.tsx        # Màn hình đăng nhập
│   ├── (tabs)/
│   │   ├── index.tsx           # Trang chủ - danh sách phòng
│   │   ├── search.tsx          # Tìm kiếm phòng
│   │   ├── bookings.tsx        # Lịch sử đặt phòng
│   │   └── profile.tsx         # Hồ sơ người dùng
│   └── room/[id].tsx           # Chi tiết phòng + đặt slot
├── constants/
│   ├── Colors.ts               # Design tokens
│   └── mockData.ts             # Dữ liệu mẫu
├── store/
│   ├── authStore.ts            # Quản lý auth
│   ├── roomStore.ts            # Quản lý phòng
│   └── bookingStore.ts         # Quản lý đặt phòng
└── types/index.ts              # TypeScript interfaces
```

## Stack công nghệ

- **Framework**: Expo (React Native) + Expo Router
- **State Management**: Zustand
- **Local Storage**: AsyncStorage (offline support)
- **UI**: React Native + @expo/vector-icons
- **Ngôn ngữ**: TypeScript

## Thông tin môn học

- **Môn**: Cross-Platform Mobile App Development
- **Tuần**: 3 – Progressive Web Apps (PWA)
- **Giảng viên**: Nguyễn Thành Tuấn, PhD
- **Trường**: VKU – Khoa Công nghệ thông tin

## 🌍 PWA & Triển khai web (Vercel)

Dự án này đã được cấu hình Progressive Web App (PWA) để có thể chạy mượt mà trên trình duyệt và cài đặt trực tiếp vào điện thoại.

### 📱 Hướng dẫn cài đặt lên màn hình chính (Safari - iOS)

Để mang lại trải nghiệm giống như app native trên iPhone/iPad:
1. Mở ứng dụng web bằng **Safari**.
2. Nhấn vào biểu tượng **Chia sẻ (Share)** ở thanh điều hướng dưới cùng (hình vuông có mũi tên hướng lên).
3. Cuộn xuống và chọn **Thêm vào MH chính (Add to Home Screen)**.
4. Nhấn **Thêm (Add)** ở góc trên bên phải.
5. Ứng dụng sẽ xuất hiện trên màn hình chính của bạn. Nhấn vào để mở app toàn màn hình (không có thanh URL).

### 🚀 Hướng dẫn Deploy lên Vercel

Dự án đã có sẵn file `vercel.json` để dễ dàng deploy:
1. Đăng nhập vào [Vercel](https://vercel.com).
2. Tạo dự án mới (Add New Project) và chọn repository chứa code này.
3. Vercel sẽ tự động nhận diện cấu hình. Nhấn **Deploy**.
4. Chờ 1-2 phút, bạn sẽ có một đường link `*.vercel.app` để truy cập và chia sẻ!
