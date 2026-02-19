import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAnalytics } from "firebase/analytics";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
    apiKey: "AIzaSyAMLwYK5ER1gHAmqU7zcSGWNj3MkNhE6xg",
    authDomain: "neon-camp-341511.firebaseapp.com",
    projectId: "neon-camp-341511",
    storageBucket: "neon-camp-341511.firebasestorage.app",
    messagingSenderId: "120818860058",
    appId: "1:120818860058:web:2b5801c411d0b1b868d1a3",
    measurementId: "G-ZVHW2NCR49"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();
export const db = getFirestore(app, "foundation");
export const storage = getStorage(app);
