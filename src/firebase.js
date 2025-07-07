// Firebase 연동 설정 파일
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyB_v-oqPKXHVpKmR1ZghkRAFmJ88ziZ7Ag",
  authDomain: "curioor-7e1be.firebaseapp.com",
  projectId: "curioor-7e1be",
  storageBucket: "curioor-7e1be.appspot.com",
  messagingSenderId: "343004750763",
  appId: "1:343004750763:web:49939c6058fd42da1ea8ee",
  measurementId: "G-PPWB7E9G2Z"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const analytics = getAnalytics(app);
export const db = getFirestore(app); 