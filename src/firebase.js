// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: process.env.FIREBASE_API_KEY,
  authDomain: "maze-game-fcc3d.firebaseapp.com",
  projectId: "maze-game-fcc3d",
  storageBucket: "maze-game-fcc3d.appspot.com",
  messagingSenderId: "132925999988",
  appId: "1:132925999988:web:bc8ead9bd48775ed3c7a21",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
