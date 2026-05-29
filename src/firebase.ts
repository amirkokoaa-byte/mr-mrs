import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCuFiuZdk_E7O2Zo8rm8xRPb21NOJPg2sY",
  authDomain: "gen-lang-client-0650630522.firebaseapp.com",
  projectId: "gen-lang-client-0650630522",
  storageBucket: "gen-lang-client-0650630522.firebasestorage.app",
  messagingSenderId: "920845848192",
  appId: "1:920845848192:web:1b909e38ed20cd28b7e065"
};

// Initialize Firebase
export const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
