// =============================================================
// KP25 — Firebase Cloud Messaging Service Worker (Portal dân cư)
// Xử lý push notification khi tab đang đóng hoặc nền
// =============================================================

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

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
        messaging.onBackgroundMessage((payload) => {
          const { title, body, icon, badge } = payload.notification ?? {};
          const url = payload.data?.url ?? '/';
          self.registration.showNotification(title ?? 'KP25 Khu phố 25', {
            body:     body   ?? '',
            icon:     icon   ?? '/icon-192.png',
            badge:    badge  ?? '/badge-72.png',
            data:     { url },
            tag:      'kp25-portal-notification',
            renotify: true,
            vibrate:  [200, 100, 200],
            actions:  [{ action: 'open', title: 'Xem ngay' }],
          });
        });
      } catch (e) {
        console.error('[SW Portal] Firebase init error:', e);
      }
    }
  }
});

// Xử lý click vào notification → mở trang tương ứng
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const urlDich = event.notification.data?.url ?? '/';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url.includes(self.location.origin) && 'focus' in client) {
          client.focus();
          if ('navigate' in client) client.navigate(urlDich);
          return;
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(urlDich);
      }
    })
  );
});

// Fallback nếu Firebase chưa init kịp
self.addEventListener('push', (event) => {
  if (!firebase.apps.length) {
    try {
      const data  = event.data?.json() ?? {};
      const title = data.notification?.title ?? 'KP25 Khu phố 25';
      const body  = data.notification?.body  ?? '';
      event.waitUntil(
        self.registration.showNotification(title, {
          body,
          icon:  '/icon-192.png',
          badge: '/badge-72.png',
          tag:   'kp25-portal-push',
        })
      );
    } catch {}
  }
});
