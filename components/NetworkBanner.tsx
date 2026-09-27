import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

type BannerMode = 'offline' | 'syncing' | 'synced' | 'hidden';

interface Props {
  isOnline: boolean;
  isSyncing: boolean;
  pendingCount: number;
}

/**
 * Banner trạng thái mạng — Offline / Đang đồng bộ / Thành công.
 * Slide xuất hiện từ trên cùng màn hình.
 */
export function NetworkBanner({ isOnline, isSyncing, pendingCount }: Props) {
  const [mode, setMode] = useState<BannerMode>('hidden');
  const slideAnim = useRef(new Animated.Value(-50)).current;
  const prevModeRef = useRef<BannerMode>('hidden');

  // Hiển thị banner slide xuống
  const show = () =>
    Animated.spring(slideAnim, { toValue: 0, useNativeDriver: true, tension: 100, friction: 10 }).start();

  // Ẩn banner slide lên
  const hide = (delay = 0) =>
    setTimeout(
      () => Animated.timing(slideAnim, { toValue: -50, duration: 300, useNativeDriver: true }).start(),
      delay
    );

  useEffect(() => {
    if (!isOnline) {
      setMode('offline');
      show();
    } else if (isSyncing) {
      setMode('syncing');
      show();
    } else if (prevModeRef.current === 'syncing') {
      // Vừa xong sync → hiện "Thành công" 2.5s rồi ẩn
      setMode('synced');
      const t = hide(2500);
      const t2 = setTimeout(() => setMode('hidden'), 3000);
      return () => { clearTimeout(t as any); clearTimeout(t2); };
    } else {
      setMode('hidden');
      hide();
    }
    prevModeRef.current = isSyncing ? 'syncing' : isOnline ? 'hidden' : 'offline';
  }, [isOnline, isSyncing]);

  if (mode === 'hidden') return null;

  const config: Record<Exclude<BannerMode, 'hidden'>, { bg: string; icon: string; text: string }> = {
    offline: {
      bg: Colors.error,
      icon: 'cloud-offline-outline',
      text: pendingCount > 0
        ? `Mất kết nối · ${pendingCount} đặt phòng chờ đồng bộ`
        : 'Không có kết nối internet',
    },
    syncing: {
      bg: Colors.warning,
      icon: 'sync-outline',
      text: `Đang đồng bộ ${pendingCount} đặt phòng...`,
    },
    synced: {
      bg: Colors.success,
      icon: 'checkmark-circle-outline',
      text: 'Đã đồng bộ thành công!',
    },
  };

  const { bg, icon, text } = config[mode];

  return (
    <Animated.View
      style={[styles.banner, { backgroundColor: bg, transform: [{ translateY: slideAnim }] }]}
    >
      <View style={styles.row}>
        <Ionicons name={icon as any} size={15} color="#fff" />
        <Text style={styles.text}>{text}</Text>
      </View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  banner: {
    position: 'absolute' as any,
    top: 0,
    left: 0,
    right: 0,
    height: 40,
    justifyContent: 'flex-end',
    paddingBottom: 6,
    paddingHorizontal: 16,
    zIndex: 9998,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    justifyContent: 'center',
  },
  text: {
    color: '#fff',
    fontSize: 13,
    fontWeight: '600',
  },
});
