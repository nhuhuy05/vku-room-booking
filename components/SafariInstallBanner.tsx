import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

/**
 * Banner chỉ hiển thị trên iOS Safari khi chưa cài PWA.
 * Hướng dẫn người dùng thêm app vào màn hình chính.
 */
export function SafariInstallBanner() {
  const [visible, setVisible] = useState(false);
  const slideAnim = React.useRef(new Animated.Value(200)).current;

  useEffect(() => {
    if (Platform.OS !== 'web') return;

    try {
      // Chỉ hiển thị trên iOS Safari
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari =
        /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
      const isStandalone =
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true;
      const dismissed = localStorage.getItem('vku-pwa-banner-dismissed');

      if (isIOS && isSafari && !isStandalone && !dismissed) {
        setVisible(true);
        Animated.spring(slideAnim, {
          toValue: 0,
          useNativeDriver: true,
          tension: 80,
          friction: 10,
        }).start();
      }
    } catch (_) {}
  }, []);

  const dismiss = () => {
    Animated.timing(slideAnim, {
      toValue: 200,
      duration: 250,
      useNativeDriver: true,
    }).start(() => setVisible(false));
    try {
      localStorage.setItem('vku-pwa-banner-dismissed', '1');
    } catch (_) {}
  };

  if (!visible) return null;

  return (
    <Animated.View style={[styles.container, { transform: [{ translateY: slideAnim }] }]}>
      {/* Mũi tên chỉ xuống Share button */}
      <View style={styles.arrowRow}>
        <View style={styles.arrow} />
      </View>

      <View style={styles.header}>
        <Text style={styles.title}>📲 Thêm VKU Room vào màn hình chính</Text>
        <TouchableOpacity onPress={dismiss} hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}>
          <Ionicons name="close-circle" size={22} color={Colors.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.steps}>
        <Step num="1" text='Nhấn nút' icon="share-outline" suffix="ở thanh dưới Safari" />
        <Step num="2" text='Chọn "Thêm vào MH chính"' />
        <Step num="3" text='Nhấn "Thêm" → Mở như app thật!' />
      </View>
    </Animated.View>
  );
}

function Step({ num, text, icon, suffix }: { num: string; text: string; icon?: string; suffix?: string }) {
  return (
    <View style={styles.stepRow}>
      <View style={styles.numBadge}>
        <Text style={styles.numText}>{num}</Text>
      </View>
      <Text style={styles.stepText}>
        {text}{' '}
        {icon && <Ionicons name={icon as any} size={14} color={Colors.primary} />}
        {suffix ? ` ${suffix}` : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute' as any,
    bottom: 70,       // cách tab bar
    left: 12,
    right: 12,
    backgroundColor: Colors.bgModal,
    borderRadius: 16,
    padding: 16,
    zIndex: 9999,
    // Shadow
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  arrowRow: {
    alignItems: 'center',
    marginBottom: 8,
  },
  arrow: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderRightWidth: 8,
    borderTopWidth: 10,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    borderTopColor: Colors.primary,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.textPrimary,
    flex: 1,
    marginRight: 8,
  },
  steps: {
    gap: 8,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  numBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  numText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#fff',
  },
  stepText: {
    fontSize: 13,
    color: Colors.textSecondary,
    flex: 1,
    lineHeight: 18,
  },
});
