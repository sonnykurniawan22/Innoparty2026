import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeFirestore } from "firebase/firestore";
import firebaseConfig from "../../firebase-applet-config.json";

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

const databaseId = firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== ""
  ? firebaseConfig.firestoreDatabaseId
  : "(default)";

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
}, databaseId);

export default app;


