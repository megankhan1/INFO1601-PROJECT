import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyBzXZD7ScTc9mC4Ug4NNibChlt3uc9Umpc",
  authDomain: "medicalink-74f93.firebaseapp.com",
  projectId: "medicalink-74f93",
  storageBucket: "medicalink-74f93.firebasestorage.app",
  messagingSenderId: "508036411554",
  appId: "1:508036411554:web:67e34070c763c1813ce7fb",
  measurementId: "G-VY49TE2E7K"
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
