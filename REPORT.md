# MINI-PROJECT SHORT TECHNICAL REPORT

**Course:** Cross-Platform Mobile App Development (VKU)
**Mini-Project Title:** Mini-Project 2 — VKU Room Booking App
**Team / Student Name:** Nguyễn Như Huy
**Submission Date:** 27/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS

* **Team Members:**
  1. Nguyễn Như Huy — Student ID: 23IT.B077 — Role: Fullstack Developer — Contribution: 100%

* **🔗 Live Demo URL:** [https://vku-room-booking-alpha.vercel.app](https://vku-room-booking-alpha.vercel.app)
* **💻 GitHub Repository:** [https://github.com/nhuhuy05/vku-room-booking](https://github.com/nhuhuy05/vku-room-booking)
---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Responsive Mobile Viewport** | ✅ Complete | 100% responsive đa nền tảng. Giao diện tự động switch: **Light Theme** (trắng) cho Web Browser, **Dark Theme** (tối) cho iOS/Android native. Hệ màu được quản lý qua `constants/Colors.ts` với điều kiện `Platform.OS === 'web'`. |
| 2 | **Local Offline Persistence** | ✅ Complete | Sử dụng **Zustand** (`useBookingStore`) kết hợp **AsyncStorage** (`@vku_bookings_data` & `@vku_booking_user_session`) để lưu trữ phiên đăng nhập, danh sách và thao tác hủy phòng bền vững. Dữ liệu được bảo toàn nguyên vẹn sau khi reload ứng dụng. |
| 3 | **Automatic Background Sync** | ✅ Complete | Hook `useNetworkMonitor` theo dõi kết nối real-time. Khi mất mạng, các booking được giữ trong hàng chờ `pendingSync[]`. Khi có mạng trở lại, `syncPending()` tự động kích hoạt đồng bộ. |
| 4 | **Bộ lọc đa tham số & Instant Search** | ✅ Complete | Tìm kiếm tức thì và bộ lọc chip 3 chiều: **Tòa nhà** (A, B, C, V), **Sức chứa** (2–5, 6–10, 11–20, >20 sinh viên) và **Trang thiết bị** (Máy chiếu, Bảng trắng, PC cấu hình cao, Điều hòa). |
| 5 | **Trình chọn 7 ngày & Khung giờ 2h** | ✅ Complete | Trình chọn ngày 7 ngày và ca học 2 tiếng rời rạc (07:30–09:30, 09:30–11:30, 13:00–15:00, 15:00–17:00). Ngăn chặn xung đột trực quan theo thời gian thực (vô hiệu hóa các slot đã đặt). |
| 6 | **Vé đặt phòng (Booking Pass) & QR Check-in** | ✅ Complete | Thẻ vé phong cách Boarding Pass với mã vé duy nhất (`passCode`). Modal mã QR check-in tương tác có tính năng mô phỏng quét check-in tại phòng. |
| 7 | **Thông báo cục bộ trước 15 phút** | ✅ Complete | Tích hợp `expo-notifications` kích hoạt cảnh báo check-in trước đúng 15 phút kèm lời nhắc chuẩn bị vé mã QR. |
| 8 | **Tối ưu danh sách FlatList 60fps** | ✅ Complete | Tách các component thẻ ghi nhớ độc lập (`RoomCard.tsx`, `BookingPassCard.tsx` có `React.memo`), cấu hình đầy đủ các props hiệu năng cuộn `initialNumToRender`, `maxToRenderPerBatch`, `windowSize`, `removeClippedSubviews`. |

---

## 3. TECHNICAL ARCHITECTURE & PROJECT STRUCTURE

### 3.1 Công nghệ sử dụng

| Layer | Technology | Mục đích |
|---|---|---|
| Framework | React Native + Expo SDK 57 | Cross-platform rendering |
| Routing | Expo Router (file-based) | Navigation & Deep linking |
| State | Zustand v5 | Global state management |
| Persistence | AsyncStorage | Offline local storage |
| Network | expo-network + Browser Events | Network status detection |
| Notification | expo-notifications | Local reminder 15 mins before booking |
| Deployment | Vercel | PWA hosting |

### 3.2 Cấu trúc thư mục

```
vku-room-booking/
├── app/
│   ├── _layout.tsx          # Root layout: Network monitor, StatusBar, Safe Area
│   ├── (auth)/              # Authentication flow (Login screen)
│   ├── (tabs)/              # Bottom Tab Navigation
│   │   ├── index.tsx        # Trang chủ — Danh sách phòng + Bộ lọc nhanh (FlatList 60fps)
│   │   ├── search.tsx       # Tìm kiếm phòng nâng cao (Bộ lọc A, B, C, V, 2-20 chỗ, Thiết bị)
│   │   ├── bookings.tsx     # Quản lý vé đặt phòng (Booking Pass)
│   │   └── profile.tsx      # Hồ sơ sinh viên + PWA Install Guide
│   └── room/[id].tsx        # Chi tiết phòng + Chọn ngày (7 ngày) + Khung 2h chống xung đột
│
├── components/
│   ├── RoomCard.tsx         # Memoized Room Card (ảnh, tòa/tầng, sức chứa, trạng thái)
│   ├── BookingPassCard.tsx  # Memoized Booking Pass (mã vé duy nhất, QR trigger)
│   ├── CheckInQRModal.tsx   # Modal mã QR check-in tương tác (mô phỏng quét check-in)
│   ├── NetworkBanner.tsx    # Banner Offline/Syncing/Synced
│   └── SafariInstallBanner.tsx  # PWA install guide cho iOS Safari
│
├── hooks/
│   ├── useNetworkMonitor.ts # Hook theo dõi mạng đa nền tảng
│   └── useNotifications.ts  # Cấu hình expo-notifications nhắc trước 15 phút
│
├── store/
│   ├── authStore.ts         # Auth state (login/logout/persist)
│   ├── bookingStore.ts      # useBookingStore: Booking CRUD + User Session + AsyncStorage
│   └── roomStore.ts         # Room data state
│
├── constants/
│   ├── Colors.ts            # Design tokens (Light/Dark theme)
│   ├── mockData.ts          # Mock data phòng (Tòa A,B,C,V, sức chứa 2-20), ca 2 tiếng
│   └── roomImages.ts        # Map hình ảnh phòng học
│
└── types/index.ts           # TypeScript interfaces (Room, Booking có passCode, TimeSlot)
```

### 3.3 Luồng Background Sync

```
Người dùng đặt phòng
        │
        ▼
[Booking tạo cục bộ] → AsyncStorage.save() → pendingSync.push()
        │
        ▼ (mất mạng?)
   ┌── YES ──────────────────────────────────────────────────────┐
   │  NetworkBanner: "🔴 Mất kết nối · N đặt phòng chờ đồng bộ"  │
   │  (booking được giữ trong pendingSync[])                     │
   └───────────────────────────────────────────────────────────┘
        │
        ▼ (kết nối lại)
   useNetworkMonitor phát hiện → onReconnect() →
        │
        ▼
   syncPending() chạy → NetworkBanner: "🟡 Đang đồng bộ..."
        │
        ▼
   Mark synced: true → NetworkBanner: "🟢 Đồng bộ thành công!"
```

### 3.4 Xử lý ngoại lệ

* **Lỗi AsyncStorage:** Try/catch ở mọi thao tác persist, lỗi bị bỏ qua gracefully để không crash app.
* **Lỗi Network:** `getNetworkStateAsync()` được bọc trong try/catch, không throw khi native API không khả dụng.
* **Platform differences:** Mọi `Platform.OS` check được thực hiện runtime, đảm bảo code bundle được cho mọi nền tảng. 
## 5. TECHNICAL CHALLENGES & RESOLUTIONS

### Thách thức 1: Tab Bar bị lỗi render trên Web

**Vấn đề:** Khi chạy Expo trên Web (react-native-web), thuộc tính `boxShadow` dạng CSS string không được chấp nhận bởi React Navigation's `tabBarStyle` prop, sinh ra các visual artifacts (viền thừa, shadow sai). Chiều cao chuẩn của Mobile Tab Bar (64px) cũng quá lớn so với Web.

**Giải pháp:** Tách riêng style bằng kiểm tra `Platform.OS === 'web'` tại runtime. Xóa bỏ `boxShadow` prop, thay bằng `elevation: 0` (React Native elevation system) để tương thích với cả hai nền tảng. Điều chỉnh `height`, `paddingTop/Bottom` riêng biệt cho Web và Native.

```typescript
// app/(tabs)/_layout.tsx
tabBarStyle: {
  height: isWeb ? 56 : 64,
  paddingBottom: isWeb ? 4 : 8,
  elevation: isWeb ? 0 : 8,   // Thay vì boxShadow string
}
```

---

### Thách thức 2: iOS Safari không hỗ trợ PWA Install Prompt

**Vấn đề:** Khác với Chrome trên Android (có `beforeinstallprompt` event), Safari trên iOS/iPadOS không cung cấp bất kỳ API hay event nào để kích hoạt "Add to Home Screen". Người dùng thường không biết cách cài đặt PWA trên iPhone.

**Giải pháp:** Tự xây dựng hai lớp hỗ trợ:
1. **`SafariInstallBanner`** (tự động): Kiểm tra `navigator.userAgent` để phát hiện iOS Safari, kiểm tra `window.matchMedia('(display-mode: standalone)')` để biết đã cài chưa. Nếu chưa → hiện banner hướng dẫn có animation slide-up.
2. **`InstallGuideModal`** (thủ công): Trong tab Hồ sơ, mục "Cài đặt ứng dụng (PWA)" mở modal với hướng dẫn từng bước cho cả 3 nền tảng (iOS, Android, Desktop).

---

*VKU Room Booking · Khoa Công nghệ Thông tin · Trường ĐH Công nghệ Việt - Hàn*
