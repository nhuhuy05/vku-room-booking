import { useEffect, useRef, useState } from 'react';
import { Platform, AppState } from 'react-native';
import * as Network from 'expo-network';

/**
 * Hook theo dõi kết nối mạng đa nền tảng.
 * - Web: dùng window 'online'/'offline' events.
 * - Native: dùng expo-network + AppState.
 * Gọi onReconnect() khi kết nối lại từ trạng thái offline.
 */
export function useNetworkMonitor(onReconnect: () => void) {
  const [isOnline, setIsOnline] = useState(true);
  const wasOfflineRef = useRef(false);

  useEffect(() => {
    if (Platform.OS === 'web') {
      // ── Web: dùng native browser events ──────────────────────────
      const handleOnline = () => {
        setIsOnline(true);
        if (wasOfflineRef.current) {
          wasOfflineRef.current = false;
          onReconnect();
        }
      };
      const handleOffline = () => {
        setIsOnline(false);
        wasOfflineRef.current = true;
      };

      // Trạng thái ban đầu
      setIsOnline(navigator.onLine);
      if (!navigator.onLine) wasOfflineRef.current = true;

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // ── Native: expo-network + AppState ──────────────────────────
      const checkNetwork = async () => {
        try {
          const state = await Network.getNetworkStateAsync();
          const connected = state.isConnected === true && state.isInternetReachable !== false;
          setIsOnline(connected);
          if (connected && wasOfflineRef.current) {
            wasOfflineRef.current = false;
            onReconnect();
          } else if (!connected) {
            wasOfflineRef.current = true;
          }
        } catch { /* ignore */ }
      };

      // Poll mỗi 8 giây (phát hiện offline/online khi không có event)
      const interval = setInterval(checkNetwork, 8000);

      // Cũng kiểm tra khi app quay lại foreground
      const appStateSub = AppState.addEventListener('change', (state) => {
        if (state === 'active') checkNetwork();
      });

      checkNetwork(); // kiểm tra ngay lúc mount

      return () => {
        clearInterval(interval);
        appStateSub.remove();
      };
    }
  }, []);

  return { isOnline };
}
