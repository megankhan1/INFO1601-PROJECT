import { auth } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const signupForm = document.getElementById("signup-form");
if (signupForm && window.location.pathname.includes("create-user.html")) {
  signupForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = signupForm.querySelector('input[name="email"]').value;
    const password = signupForm.querySelector('input[name="password"]').value;
    const confirmPassword = signupForm.querySelector('input[name="confirm_password"]').value;

    if (password !== confirmPassword) {
      alert("Passwords do not match.");
      return;
    }

    createUserWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "index.html";
      })
      .catch((error) => {
        alert(error.message);
        console.error("Signup Error:", error);
      });
  });
}

const loginForm = document.getElementById("login-form");
if (loginForm && window.location.pathname.includes('index.html')) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;

    signInWithEmailAndPassword(auth, email, password)
      .then(() => {
        window.location.href = "calendar.html";
      })
      .catch((error) => {
        alert(error.message);
        console.error("Login Error:", error);
      });
  });
}