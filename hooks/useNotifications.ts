/**
 * useNotifications — Local notification helper cho VKU Room
 *
 * Chức năng:
 * 1. Xin quyền notification khi app khởi động
 * 2. scheduleBookingReminder() — nhắc 30 phút trước khi phòng bắt đầu
 * 3. cancelBookingReminder()   — hủy notification khi cancel booking
 * 4. sendBookingConfirmation() — thông báo tức thì khi đặt thành công
 */

import { useEffect } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';

// ── Cấu hình handler hiển thị notification khi app foreground ──────
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList:   true,
    shouldPlaySound:  true,
    shouldSetBadge:   false,
  }),
});

/* ─── Xin quyền ─────────────────────────────────────────────────── */
export async function requestNotificationPermission(): Promise<boolean> {
  if (Platform.OS === 'web') return false; // Web không hỗ trợ local notification

  if (!Device.isDevice) {
    // Simulator/emulator vẫn chạy được trên iOS simulator với SDK mới
    console.log('[Notifications] Running on simulator — permissions may be limited');
  }

  const { status: existing } = await Notifications.getPermissionsAsync();
  if (existing === 'granted') return true;

  const { status } = await Notifications.requestPermissionsAsync();
  return status === 'granted';
}

/* ─── Schedule nhắc 30 phút trước ───────────────────────────────── */
export async function scheduleBookingReminder(params: {
  bookingId: string;
  roomName:  string;
  date:      string;   // 'YYYY-MM-DD'
  startTime: string;   // 'HH:mm'
  purpose:   string;
}): Promise<string | null> {
  if (Platform.OS === 'web') return null;

  try {
    const [year, month, day]   = params.date.split('-').map(Number);
    const [hour, minute]       = params.startTime.split(':').map(Number);

    // Thời điểm bắt đầu phòng
    const roomStart = new Date(year, month - 1, day, hour, minute, 0);
    // Nhắc trước 30 phút
    const reminderTime = new Date(roomStart.getTime() - 30 * 60 * 1000);

    // Nếu thời gian nhắc đã qua → không schedule
    if (reminderTime <= new Date()) return null;

    const notifId = await Notifications.scheduleNotificationAsync({
      identifier: `reminder_${params.bookingId}`,
      content: {
        title: '⏰ Nhắc nhở đặt phòng',
        body:  `${params.roomName} bắt đầu sau 30 phút (${params.startTime})\n📋 ${params.purpose}`,
        data:  { bookingId: params.bookingId, type: 'reminder' },
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: reminderTime,
      },
    });

    console.log(`[Notifications] Scheduled reminder ${notifId} at ${reminderTime.toISOString()}`);
    return notifId;
  } catch (err) {
    console.warn('[Notifications] scheduleBookingReminder failed:', err);
    return null;
  }
}

/* ─── Hủy notification khi cancel booking ───────────────────────── */
export async function cancelBookingReminder(bookingId: string): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.cancelScheduledNotificationAsync(`reminder_${bookingId}`);
    console.log(`[Notifications] Cancelled reminder for booking ${bookingId}`);
  } catch { /* ignore */ }
}

/* ─── Thông báo tức thì khi đặt phòng thành công ────────────────── */
export async function sendBookingConfirmation(params: {
  roomName:  string;
  date:      string;
  startTime: string;
  endTime:   string;
}): Promise<void> {
  if (Platform.OS === 'web') return;
  try {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '✅ Đặt phòng thành công!',
        body:  `${params.roomName}\n📅 ${params.date} · ${params.startTime}–${params.endTime}\nChúng tôi sẽ nhắc bạn trước 30 phút.`,
        data:  { type: 'confirmation' },
        sound: true,
      },
      trigger: null, // Hiển thị ngay lập tức
    });
  } catch (err) {
    console.warn('[Notifications] sendBookingConfirmation failed:', err);
  }
}

/* ─── Hook khởi tạo — dùng ở root layout ────────────────────────── */
export function useNotificationSetup() {
  useEffect(() => {
    requestNotificationPermission();

    // Xử lý khi user tap vào notification
    const sub = Notifications.addNotificationResponseReceivedListener((response) => {
      const data = response.notification.request.content.data;
      console.log('[Notifications] User tapped notification:', data);
      // Có thể navigate đến bookings screen ở đây nếu cần
    });

    return () => sub.remove();
  }, []);
}
