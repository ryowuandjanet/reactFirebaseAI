import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
    apiKey: "AIzaSyBcKVTgo_L12TzjFdcLLpGmww-UEJO9a24",
    authDomain: "smackchat-d077e.firebaseapp.com",
    databaseURL: "https://smackchat-d077e-default-rtdb.firebaseio.com",
    projectId: "smackchat-d077e",
    storageBucket: "smackchat-d077e.firebasestorage.app",
    messagingSenderId: "1006136468816",
    appId: "1:1006136468816:web:72ad8752c972e8d2b67855",
    measurementId: "G-QCDDDZ98CQ"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);