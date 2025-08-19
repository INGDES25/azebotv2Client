import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUN-Ye5eYWzmXiaLXAOp8itOBOG6rzxm0",
  authDomain: "azebot-64c88.firebaseapp.com",
  projectId: "azebot-64c88",
  storageBucket: "azebot-64c88.firebasestorage.app",
  messagingSenderId: "424448243647",
  appId: "1:424448243647:web:705d37fd2582705efcd30a"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const analytics = getAnalytics(app);
