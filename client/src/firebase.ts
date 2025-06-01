// src/firebase.ts
import { initializeApp, FirebaseApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY || undefined,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN || undefined,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID || undefined,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET || undefined,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID || undefined,
  appId: process.env.REACT_APP_FIREBASE_APP_ID || undefined,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID || undefined,
};

// Check if Firebase config has required fields for basic functionality
const isFirebaseConfigured = firebaseConfig.apiKey && firebaseConfig.projectId && firebaseConfig.appId;

let app: FirebaseApp | null = null;
let analytics: Analytics | null = null;

// Function to initialize Firebase
const initializeFirebase = (): FirebaseApp | null => {
  if (!isFirebaseConfigured) {
    console.log('Firebase configuration is incomplete. Some features will be disabled.');
    return null;
  }

  try {
    return initializeApp(firebaseConfig);
  } catch (error) {
    console.error('Error initializing Firebase:', error);
    return null;
  }
};

// Function to initialize analytics
const initializeAnalytics = async () => {
  if (!app) {
    return;
  }

  try {
    const isAnalyticsSupported = await isSupported();
    if (isAnalyticsSupported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } else {
      console.log('Firebase Analytics is not supported in this environment');
    }
  } catch (error) {
    console.warn('Firebase Analytics initialization failed:', error);
    // Continue app execution - analytics is non-critical
  }
};

// Initialize Firebase when the module loads
app = initializeFirebase();
if (app) {
  initializeAnalytics();
}

// Helper function to safely log events
export const logAnalyticsEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  if (!analytics) {
    // Silently ignore analytics events when Firebase is not configured
    return;
  }

  try {
    logEvent(analytics, eventName, eventParams);
  } catch (error) {
    console.warn('Error logging analytics event:', error);
  }
};

export { analytics };
