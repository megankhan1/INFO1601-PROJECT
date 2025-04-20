import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

import {
  doc,
  setDoc,
  getDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = signupForm.querySelector('input[name="email"]').value;
    const password = signupForm.querySelector('input[name="password"]').value;
    const confirmPassword = signupForm.querySelector('input[name="confirm_password"]').value;
    const username = signupForm.querySelector('input[name="username"]').value;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.email), {
        username: username,
        email: user.email,
        createdAt: new Date().toISOString()
      });

      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
      console.error("Signup Error:", error);
    }
  });
}

const loginForm = document.getElementById("login-form");

if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log("Login success:", userCredential.user);
      window.location.href = "home.html";
    } catch (error) {
      alert(error.message);
      console.error("Login Error:", error);
    }
  });
}

const logoutButton = document.getElementById("logout-button");

if (logoutButton) {
  logoutButton.addEventListener("click", async () => {
    try {
      await signOut(auth);
      console.log("User signed out.");
      window.location.href = "index.html";
    } catch (error) {
      alert(error.message);
      console.error("Logout Error:", error);
    }
  });
}

// Redirect to login page if the user is not authenticated
onAuthStateChanged(auth, async (user) => {
  const userInfo = document.getElementById("user-info");
  if (!user) {
    // Redirect to login page if not authenticated
    if (!window.location.pathname.endsWith("index.html") && !window.location.pathname.endsWith("create-user.html")) {
      window.location.href = "index.html";
    }
    return;
  }

  if (user) {
    try {
      // Fetch the username from Firestore
      const userDocRef = doc(db, "users", user.email);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userData = userDocSnap.data();
        userInfo.textContent = `Logged in as: ${userData.username}`;
      } else {
        console.warn("User document not found in Firestore.");
        userInfo.textContent = `Logged in as: ${user.email}`;
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      userInfo.textContent = `Logged in as: ${user.email}`;
    }
  } else {
    // User is signed out
    userInfo.textContent = "";
  }
});