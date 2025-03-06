// Import Firebase SDK functions
import { initializeApp } from "firebase/app";
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
} from "firebase/auth";
//import { getAnalytics } from "firebase/analytics";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyDe1mS5JrOz-7XcdTIrcOr8RkNjP5XBQ2o",
  authDomain: "documentme-7a47b.firebaseapp.com",
  projectId: "documentme-7a47b",
  storageBucket: "documentme-7a47b.appspot.com", // Fixed storage URL
  messagingSenderId: "222978100032",
  appId: "1:222978100032:web:c6efc61998dcbf280c88a5",
  measurementId: "G-6KLMYVHC03",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
//const analytics = getAnalytics(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

// Function to sign in with Google
const signInWithGoogle = async () => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    return result.user; // Returns user details
  } catch (error) {
    console.error("Google Sign-In Error:", error);
    return null;
  }
};

// Function to log out
const logout = async () => {
  await signOut(auth);
};

// Export authentication functions
export { auth, signInWithGoogle, logout };
