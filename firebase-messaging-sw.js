/* Firebase Cloud Messaging — معالجة الإشعارات في الخلفية */
/* يجب أن يبقى هذا الملف في جذر الموقع */

importScripts("https://www.gstatic.com/firebasejs/13.3.0/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/13.3.0/firebase-messaging-compat.js");

firebase.initializeApp({
  apiKey: "AIzaSyA7XoSoggcC-VJ91f3jTmTKBGv4rGS54LE",
  authDomain: "transport-coordination.firebaseapp.com",
  projectId: "transport-coordination",
  storageBucket: "transport-coordination.firebasestorage.app",
  messagingSenderId: "348267439556",
  appId: "1:348267439556:web:19b55bdf6b7228e719f091"
});

const messaging = firebase.messaging();
const DEFAULT_URL = "https://t.me/TansiqElna9Lldzl";

function resolveUrl(data, note) {
  data = data || {};
  note = note || {};
  return (
    data.url ||
    data.link ||
    data.click_action ||
    (note && note.click_action) ||
    DEFAULT_URL
  );
}

messaging.onBackgroundMessage(function (payload) {
  const data = (payload && payload.data) || {};
  const note = (payload && payload.notification) || {};
  const title = note.title || data.title || "قانون تنسيق النقل والمرور";
  const body = note.body || data.body || data.msg || "لديك إشعار جديد";
  const url = resolveUrl(data, note);

  // ضمّن الرابط داخل data حتى يُقرأ عند الضغط على الإشعار
  const notifData = Object.assign({}, data, { url: url });

  const options = {
    body: body,
    icon: "/icons/icon-192.png",
    badge: "/icons/icon-192.png",
    data: notifData,
    tag: data.tag || "tc-fcm",
    renotify: true,
    dir: "rtl",
    lang: "ar"
  };
  return self.registration.showNotification(title, options);
});

self.addEventListener("notificationclick", function (event) {
  event.notification.close();
  const data = (event.notification && event.notification.data) || {};
  const url = data.url || data.link || data.click_action || DEFAULT_URL;

  event.waitUntil(
    clients.matchAll({ type: "window", includeUncontrolled: true }).then(function (list) {
      // حاول فتح/التركيز على نافذة بنفس الرابط إن وُجدت
      for (let i = 0; i < list.length; i++) {
        const c = list[i];
        if (c.url && c.url.indexOf(url) !== -1 && "focus" in c) {
          return c.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(url);
    })
  );
});
