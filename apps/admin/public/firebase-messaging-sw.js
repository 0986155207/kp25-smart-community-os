// =============================================================
// KP25 — Firebase Cloud Messaging Service Worker
// Xử lý push notification khi tab đang đóng hoặc nền
// =============================================================
// QUAN TRỌNG: Thay thế các giá trị PLACEHOLDER bằng config
// Firebase thực từ Firebase Console → Project Settings → Your apps
// =============================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

// ── Firebase config (thay bằng config thực của bạn) ──────────
// Các giá trị này PUBLIC, an toàn để đặt trong service worker
let firebaseConfig = null;

// Nhận config từ main thread (inject lúc register)
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'FIREBASE_CONFIG') {
    if (!firebaseConfig) {
      firebaseConfig = event.data.config;
      try {
        if (!firebase.apps.length) {
          firebase.initializeApp(firebaseConfig);
        }
        const messaging = firebase.messaging();
        // Background message handler
        messaging.onBackgroundMessage((payload) => {
          console.log('[SW] Background message:', payload);
          const { title, body, icon, badge, data } = payload.notification ?? {};
          self.registration.showNotification(title ?? 'KP25', {
            body:    body   ?? '',
            icon:    icon   ?? '/icon-192.png',
            badge:   badge  ?? '/badge-72.png',
            data:    data   ?? {},
            tag:     'kp25-notification',
            renotify: true,
            vibrate: [200, 100, 200],
            actions: [{ action: 'open', title: 'Xem ngay' }],
          });
        });
      } catch (e) {
        console.error('[SW] Firebase init error:', e);
      }
    }
  }
});

// ── Xử lý click vào notification ─────────────────────────────
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlDich = event.notification.data?.url ?? '/dashboard';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // Nếu tab đã mở → focus vào đó
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(urlDich);
          return;
        }
      }
      // Mở tab mới nếu chưa có
      if (clients.openWindow) {
        return clients.openWindow(urlDich);
      }
    })
  );
});

// ── Push event fallback (nếu SDK chưa init kịp) ──────────────
self.addEventListener('push', (event) => {
  if (!firebase.apps.length) {
    // Hiển thị thông báo từ raw push data
    try {
      const data = event.data?.json() ?? {};
      const title = data.notification?.title ?? 'KP25 Smart Community';
      const body  = data.notification?.body  ?? '';
      event.waitUntil(
        self.registration.showNotification(title, {
          body,
          icon:  '/icon-192.png',
          badge: '/badge-72.png',
          tag:   'kp25-push',
        })
      );
    } catch {}
  }
});
