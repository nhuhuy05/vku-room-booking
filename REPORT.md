# MINI-PROJECT SHORT TECHNICAL REPORT

**Course:** Cross-Platform Mobile App Development (VKU)
**Mini-Project Title:** Mini-Project 2 — VKU Room Booking App
**Team / Student Name:** Nguyễn Như Huy
**Submission Date:** 27/09/2026

---

## 1. GENERAL INFORMATION & DELIVERABLE LINKS

* **Team Members:**
  1. Nguyễn Như Huy — Student ID: 23IT.B077 — Role: Fullstack Developer — Contribution: 100%

* **🔗 Live Demo URL:** 
* **💻 GitHub Repository:** 
---

## 2. FEATURE IMPLEMENTATION CHECKLIST

| # | Required Feature | Status | Implementation Details & Acceptance Level |
|:---:|---|:---:|---|
| 1 | **Responsive Mobile Viewport** | ✅ Complete | 100% responsive đa nền tảng. Giao diện tự động switch: **Light Theme** (trắng) cho Web Browser, **Dark Theme** (tối) cho iOS/Android native. Hệ màu được quản lý qua `constants/Colors.ts` với điều kiện `Platform.OS === 'web'`. |
| 2 | **Local Offline Persistence** | ✅ Complete | Sử dụng **Zustand** kết hợp **AsyncStorage** để lưu trữ Authentication Token, Booking History cục bộ trên thiết bị. Mọi thao tác đặt phòng được ghi vào `@vku_bookings` key ngay lập tức, đảm bảo data không mất khi tắt app. Trường `synced: boolean` đánh dấu trạng thái đồng bộ từng booking. |
| 3 | **Automatic Background Sync** | ✅ Complete | Hook `useNetworkMonitor` theo dõi kết nối real-time (Web: `window online/offline events`; Native: `expo-network` + `AppState`). Khi mất mạng, các booking được giữ trong hàng chờ `pendingSync[]`. Khi kết nối được khôi phục, `syncPending()` tự động được gọi — **NetworkBanner** hiển thị trạng thái đồng bộ (Offline → Đang đồng bộ → Thành công). |

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
| Deployment | Vercel | PWA hosting |

### 3.2 Cấu trúc thư mục

```
vku-room-booking/
├── app/
│   ├── _layout.tsx          # Root layout: Network monitor, StatusBar, Safe Area
│   ├── (auth)/              # Authentication flow (Login screen)
│   ├── (tabs)/              # Bottom Tab Navigation
│   │   ├── index.tsx        # Trang chủ — Danh sách phòng + Bộ lọc
│   │   ├── search.tsx       # Tìm kiếm phòng nâng cao
│   │   ├── bookings.tsx     # Lịch sử đặt phòng
│   │   └── profile.tsx      # Hồ sơ + PWA Install Guide
│   └── room/[id].tsx        # Chi tiết phòng + Form đặt phòng
│
├── components/
│   ├── NetworkBanner.tsx    # Banner Offline/Syncing/Synced
│   └── SafariInstallBanner.tsx  # PWA install guide cho iOS Safari
│
├── hooks/
│   └── useNetworkMonitor.ts # Hook theo dõi mạng đa nền tảng
│
├── store/
│   ├── authStore.ts         # Auth state (login/logout/persist)
│   ├── bookingStore.ts      # Booking CRUD + pendingSync queue
│   └── roomStore.ts         # Room data state
│
├── constants/
│   ├── Colors.ts            # Design tokens (Light/Dark theme)
│   └── mockData.ts          # Mock data phòng và lịch đặt
│
└── types/index.ts           # TypeScript interfaces
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
