import { initializeApp } from "firebase/app";
import { getMessaging, onBackgroundMessage } from "firebase/messaging/sw";

const firebaseConfig = {
  apiKey: "AIzaSyDBWurvGNq_ld0BMqUlhzs0sKRrU8CBUD8",
  authDomain: "dhlc-davao-system.firebaseapp.com",
  projectId: "dhlc-davao-system",
  storageBucket: "dhlc-davao-system.firebasestorage.app",
  messagingSenderId: "695103836847",
  appId: "1:695103836847:web:f126abb2d96979f23bba5a"
};

const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

onBackgroundMessage(messaging, (payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/logo.jpg'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
