// Import Firebase
import { initializeApp } from "firebase/app";
// import { getAuth } from "firebase/auth";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Initialize Firebase
const firebaseConfig = {
  apiKey: "AIzaSyA2CSI9BobFoxOimiZbJPpdzmLBb9xLvZk",
  authDomain: "theabhiraj-qr.firebaseapp.com",
  databaseURL: "https://theabhiraj-qr-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "theabhiraj-qr",
  storageBucket: "theabhiraj-qr.appspot.com",
  messagingSenderId: "1074796492944",
  appId: "1:1074796492944:web:b700280211cdec5b578015"
};

const app = initializeApp(firebaseConfig);

//services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export { GoogleAuthProvider };