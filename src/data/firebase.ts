import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const isConfigured = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "";

let app: any = null;
let db: any = null;
let auth: any = null;

if (isConfigured) {
  try {
    app = initializeApp(firebaseConfig);
    // Explicitly configure Firestore Database ID if configured
    db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || undefined);
    auth = getAuth(app);

    // Validate connection to Firestore as per SKILL guidelines
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && (error.message.includes('the client is offline') || error.message.includes('offline'))) {
          console.warn("Please check your Firebase configuration. Client is offline.");
        }
      }
    };
    testConnection();
  } catch (error) {
    console.warn("Failed to initialize Firebase with configured credentials:", error);
  }
} else {
  console.log("Firebase is not fully configured yet. Running in offline/localStorage catalog mode.");
}

export { app, db, auth, isConfigured };
