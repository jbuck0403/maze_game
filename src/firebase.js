// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "maze-game-fcc3d.firebaseapp.com",
  projectId: "maze-game-fcc3d",
  storageBucket: "maze-game-fcc3d.appspot.com",
  messagingSenderId: "132925999988",
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize firebase
const app = initializeApp(firebaseConfig);
// Initialize firebase auth
export const auth = getAuth(app);
