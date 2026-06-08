import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, getDocFromServer } from "firebase/firestore";

// Firebase configuration from environment variables
// These are SAFE to expose in the frontend (they contain VITE_ prefix)
// Do NOT expose sensitive backend credentials here
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "",
};

// Log config only in development to help debugging
if (import.meta.env.DEV) {
  console.log("🔧 Firebase Config (Dev Only):", firebaseConfig);
}

// Validate Firebase configuration
const isConfigured =
  firebaseConfig &&
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== "" &&
  firebaseConfig.projectId &&
  firebaseConfig.projectId !== "";

if (!isConfigured && import.meta.env.PROD) {
  console.error(
    "⚠️ Firebase is not properly configured. Ensure all VITE_FIREBASE_* environment variables are set.",
  );
}

let app: any = null;
let db: any = null;
let auth: any = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    
    // Explicitly configure Firestore Database ID if configured
    db = getFirestore(
      app,
      (firebaseConfig as any).firestoreDatabaseId || undefined,
    );
    
    auth = getAuth(app);

    // Validate connection to Firestore in development
    if (import.meta.env.DEV) {
      const testConnection = async () => {
        try {
          await getDocFromServer(doc(db, "test", "connection"));
          console.log("✅ Firebase Firestore connected successfully");
        } catch (error) {
          if (
            error instanceof Error &&
            (error.message.includes("the client is offline") ||
              error.message.includes("offline"))
          ) {
            console.warn(
              "⚠️ Firebase: Client is offline or test collection doesn't exist.",
            );
          } else {
            console.warn("⚠️ Firebase connection test failed:", error);
          }
        }
      };
      testConnection();
    }
  } catch (error) {
    console.error(
      "❌ Failed to initialize Firebase:",
      error instanceof Error ? error.message : error,
    );
  }
} else {
  console.warn(
    "ℹ️ Firebase is not configured. Running in offline/localStorage mode.",
  );
}

export { app, db, auth, isConfigured };
