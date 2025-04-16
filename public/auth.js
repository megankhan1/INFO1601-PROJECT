import { auth } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut, getAuth
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const signupForm = document.getElementById("signup-form");

if (signupForm) {
  signupForm.addEventListener("submit", (e) => {
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

if (loginForm) {
  loginForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = loginForm.querySelector('input[name="email"]').value;
    const password = loginForm.querySelector('input[name="password"]').value;

    signInWithEmailAndPassword(auth, email, password)
      .then((userCredential) => {
        console.log("Login success:", userCredential.user);
        window.location.href = "calendar.html";
      })
      .catch((error) => {
        alert(error.message);
        console.error("Login Error:", error);
      });
  });
}

const auth = getAuth();
const logoutButton = document.getElementById("logout-button");
// if (logoutButton) {
//   logoutButton.addEventListener("click", () => {
//     signOut(auth)
//       .then(() => {
//         console.log("User signed out.");
//         window.location.href = "index.html";
//       })
//       .catch((error) => {
//         alert(error.message);
//         console.error("Logout Error:", error);
//       });
//   });
// }

// filepath: c:\Users\User\OneDrive - The University of the West Indies, St. Augustine\Y1\S2\INFO1601\INFO1601-PROJECT\public\auth.js
document.getElementById('logout-button').addEventListener('click', () => {
  // Example logout logic
  console.log('Logout button clicked');
  // // Clear user session or token
  // localStorage.removeItem('userToken'); // Adjust based on your app's auth logic
  // // Redirect to login page
  // window.location.href = 'index.html';
});