// Firebase Configuration
// IMPORTANT: Fill in these values from your Firebase Console
// See FIREBASE_SETUP.md for detailed instructions

const firebaseConfig = {
  apiKey: "AIzaSyBtDalAlOzEqIKVd67m2D-IEFloIlrEihI",
  authDomain: "aqua-buddy-3ff72.firebaseapp.com",
  projectId: "aqua-buddy-3ff72",
  storageBucket: "aqua-buddy-3ff72.firebasestorage.app",
  messagingSenderId: "597924721055",
  appId: "1:597924721055:web:77bf589810868e16984daa",
  measurementId: "G-MFY2RKJRLJ"
};

// Web Push certificate key (VAPID key)
// Get this from Firebase Console > Project Settings > Cloud Messaging > Web Push certificates
const vapidKey = "BNYzjBGgeqqPanyKT6mCqhqfRlB1GXXUj8ybL4Oumh1iVlbQjGff62a9yymL54UzOpqxfWe-7jkENtI6UO8S5CA";

// Initialize Firebase (only if config is filled in)
if (firebaseConfig.apiKey !== "YOUR_API_KEY_HERE") {
  try {
    firebase.initializeApp(firebaseConfig);
    console.log("Firebase initialized successfully");
  } catch (error) {
    console.error("Firebase initialization error:", error);
  }
} else {
  console.warn("Firebase config not set. Please fill in firebase-config.js with your Firebase credentials.");
  console.warn("See FIREBASE_SETUP.md for instructions.");
}
