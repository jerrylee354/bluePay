
// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, updateProfile } from "firebase/auth";
import { getFirestore, updateDoc } from "firebase/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAu9OYsRVms6Dlrdermq5PLh2kMWeDrPNU",
  authDomain: "bluepay-fojq8.firebaseapp.com",
  projectId: "bluepay-fojq8",
  storageBucket: "bluepay-fojq8.appspot.com",
  messagingSenderId: "623887467932",
  appId: "1:623887467932:web:9f5a3d57efd0a295907459"
};

const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);


export { app, auth, db, updateProfile, updateDoc };
