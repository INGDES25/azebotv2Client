import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyCUN-Ye5eYWzmXiaLXAOp8itOBOG6rzxm0",
  authDomain: "azebot-64c88.firebaseapp.com",
  projectId: "azebot-64c88",
  storageBucket: "azebot-64c88.firebasestorage.app",
  messagingSenderId: "424448243647",
  appId: "1:424448243647:web:705d37fd2582705efcd30a"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);