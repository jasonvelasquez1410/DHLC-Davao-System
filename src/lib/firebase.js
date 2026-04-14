import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyDBWurvGNq_ld0BMqUlhzs0sKRrU8CBUD8",
  authDomain: "dhlc-davao-system.firebaseapp.com",
  projectId: "dhlc-davao-system",
  storageBucket: "dhlc-davao-system.firebasestorage.app",
  messagingSenderId: "695103836847",
  appId: "1:695103836847:web:f126abb2d96979f23bba5a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
