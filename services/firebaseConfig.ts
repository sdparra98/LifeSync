import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyBniLXjmSGqwi55ujKLYdN0mPywBIqdcpc",
  authDomain: "lifesync-620c9.firebaseapp.com",
  projectId: "lifesync-620c9",
  storageBucket: "lifesync-620c9.firebasestorage.app",
  messagingSenderId: "1063931519814",
  appId: "1:1063931519814:web:abdb8477b04fe0c0553b47",
  measurementId: "G-9ZQL6RBH6Y"
};

// Initialize Firebase only if config is present to avoid crash on empty config
let app;
let auth;
let db;

try {
  if (firebaseConfig.apiKey) {
    app = initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
  } else {
    console.warn("Firebase config is missing. App is running in demo mode (no sync).");
  }
} catch (error) {
  console.error("Error initializing Firebase:", error);
}

export { auth, db };