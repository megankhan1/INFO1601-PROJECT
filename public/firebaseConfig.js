import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyBzXZD7ScTc9mC4Ug4NNibChlt3uc9Umpc",
  authDomain: "medicalink-74f93.firebaseapp.com",
  projectId: "medicalink-74f93",
  storageBucket: "medicalink-74f93.appspot.com",
  messagingSenderId: "508036411554",
  appId: "1:508036411554:web:67e34070c763c1813ce7fb",
  measurementId: "G-VY49TE2E7K"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

export { app, auth, db };

export default firebaseConfig;