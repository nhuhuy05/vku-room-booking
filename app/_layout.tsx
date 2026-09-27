import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useAuthStore } from '../store/authStore';
import { useBookingStore } from '../store/bookingStore';
import { Colors } from '../constants/Colors';
import { SafariInstallBanner } from '../components/SafariInstallBanner';
import { NetworkBanner } from '../components/NetworkBanner';
import { useNetworkMonitor } from '../hooks/useNetworkMonitor';
import { useNotificationSetup } from '../hooks/useNotifications';

function AppWithNetwork() {
  const { syncPending, pendingSync } = useBookingStore();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleReconnect = async () => {
    if (pendingSync.length === 0) return;
    setIsSyncing(true);
    await syncPending();
    setIsSyncing(false);
  };

  const { isOnline } = useNetworkMonitor(handleReconnect);
  useNotificationSetup(); // Xin quyền & đăng ký tap handler

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(auth)" />
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="room/[id]"
          options={{ headerShown: false }}
        />
      </Stack>

      {/* Banner đồng bộ mạng — tự động hiện/ẩn theo trạng thái */}
      <NetworkBanner
        isOnline={isOnline}
        isSyncing={isSyncing}
        pendingCount={pendingSync.length}
      />

      {/* Hướng dẫn cài PWA trên iOS Safari */}
      <SafariInstallBanner />
    </>
  );
}

export default function RootLayout() {
  const { loadFromStorage } = useAuthStore();
  const { loadFromStorage: loadBookings } = useBookingStore();

  useEffect(() => {
    loadFromStorage();
    loadBookings();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1, backgroundColor: Colors.bg }}>
      <StatusBar style={Platform.OS === 'web' ? 'dark' : 'light'} />
      <AppWithNetwork />
    </GestureHandlerRootView>
  );
}
