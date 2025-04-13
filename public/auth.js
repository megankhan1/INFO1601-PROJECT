import { initializeApp } from "https://www.gstatic.com/firebasejs/10.10.0/firebase-app.js";
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  setPersistence,
  browserLocalPersistence,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.10.0/firebase-auth.js";

import firebaseConfig from "./firebaseConfig.js";

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

const isLoginPage = window.location.pathname.includes("login.html");
const isHomePage = window.location.pathname.includes("index.html");

if (isLoginPage) {
  const loginBtn = document.getElementById("loginBtn");
  const createBtn = document.getElementById("createBtn");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");

  loginBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      await setPersistence(auth, browserLocalPersistence);
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Logged in as:", userCredential.user.email);

      window.location.href = "index.html";

    } catch (error) {
      console.error("Login failed:", error.code, error.message);
      alert("Login failed: " + error.message);
    }
  });


  createBtn.addEventListener("click", async () => {
    const email = emailInput.value;
    const password = passwordInput.value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log("User created:", userCredential.user.email);
      alert("Account created. You can now log in.");
    } catch (error) {
      console.error("User creation failed:", error.message);
      alert("Error creating account: " + error.message);
    }
  });
}

if (isHomePage) {
  const logoutBtn = document.getElementById("logoutBtn");

  logoutBtn.addEventListener("click", () => {
    signOut(auth).then(() => {
      window.location.href = "login.html";
    }).catch(error => {
      console.error("Logout error:", error);
    });
  });

  onAuthStateChanged(auth, user => {
    if (!user) {
      window.location.href = "login.html";
    }
  });
}

/*
createUserWithEmailAndPassword(auth, email, password)
  .then((userCredential) => {
    const user = userCredential.user;
    console.log("User created:", user.email);
  })
  .catch((error) => {
    console.error("Error creating user:", error.code, error.message);
  });
*/