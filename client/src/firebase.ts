// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getAnalytics, isSupported, Analytics, logEvent } from "firebase/analytics";

const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID,
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Analytics with type safety
let analytics: Analytics | null = null;

// Function to initialize analytics
const initializeAnalytics = async () => {
  try {
    const isAnalyticsSupported = await isSupported();
    if (isAnalyticsSupported) {
      analytics = getAnalytics(app);
      console.log('Firebase Analytics initialized successfully');
    } else {
      console.log('Firebase Analytics is not supported in this environment');
    }
  } catch (error) {
    console.error('Error initializing Firebase Analytics:', error);
  }
};

// Initialize analytics when the module loads
initializeAnalytics();

// Helper function to safely log events
export const logAnalyticsEvent = (eventName: string, eventParams?: { [key: string]: any }) => {
  if (analytics) {
    try {
      logEvent(analytics, eventName, eventParams);
    } catch (error) {
      console.error('Error logging analytics event:', error);
    }
  }
};

export { analytics };
