// Firebase is temporarily removed for security review.
// import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth';
// import { getFirestore } from 'firebase/firestore';
// import firebaseConfig from '../firebase-applet-config.json';
// 
// const app = initializeApp({
//   ...firebaseConfig,
//   apiKey: import.meta.env.VITE_FIREBASE_API_KEY || firebaseConfig.apiKey
// });
// export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId); // CRITICAL: The app will break without this line
// export const auth = getAuth(app);
export const db = {} as any;
export const auth = { currentUser: null } as any;
