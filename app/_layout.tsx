import { useEffect, useState } from 'react';
import { View, StyleSheet, Platform } from 'react-native';
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

  const isWeb = Platform.OS === 'web';

  return (
    <GestureHandlerRootView style={[styles.root, isWeb && styles.webRoot]}>
      <StatusBar style={isWeb ? 'dark' : 'light'} />
      <View style={[styles.mobileViewport, isWeb && styles.webViewport]}>
        <AppWithNetwork />
      </View>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.bg,
  },
  webRoot: {
    backgroundColor: '#050B14', // Nền desktop tối hiện đại bao quanh khung điện thoại
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%',
    ...(Platform.OS === 'web' ? ({ height: '100dvh', maxHeight: '100dvh', overflow: 'hidden' } as any) : {}),
  },
  mobileViewport: {
    flex: 1,
    width: '100%',
  },
  webViewport: {
    maxWidth: 460, // Chiều rộng chuẩn điện thoại di động (iPhone / Android)
    width: '100%',
    height: '100%',
    backgroundColor: Colors.bg,
    borderLeftWidth: 1,
    borderRightWidth: 1,
    borderColor: '#1E293B',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.55,
    shadowRadius: 32,
    overflow: 'hidden',
    position: 'relative',
  },
});
