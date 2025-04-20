import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  deleteDoc,
  doc,
  query,
  orderBy,
  onSnapshot,
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

// DOM Elements
const commentList = document.getElementById("comment-list");
const commentText = document.getElementById("comment-text");
const submitComment = document.getElementById("submit-comment");

const commentsRef = collection(db, "comments");
const auth = getAuth();

let currentUsername = "Anonymous";

// Get logged-in user's username
onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email;
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      currentUsername = userDoc.data().username || "Anonymous";
    }

    // Submit main comment
    submitComment.addEventListener("click", async () => {
      const text = commentText.value.trim();
      if (!text) return;

      await addDoc(commentsRef, {
        text,
        username: currentUsername,
        timestamp: new Date()
      });

      commentText.value = "";
    });

  } else {
    submitComment.disabled = true;
    submitComment.textContent = "Login to comment";
  }
});

// Load Main Comments
onSnapshot(query(commentsRef, orderBy("timestamp", "desc")), (snapshot) => {
  commentList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const commentId = docSnap.id;

    const commentDiv = document.createElement("div");
    commentDiv.className = "comment border rounded p-3 mb-3 bg-light shadow-sm";

    commentDiv.innerHTML = `
      <p class="mb-1"><strong>${data.username}</strong></p>
      <p>${data.text}</p>
      <div class="d-flex gap-2">
        <button class="btn btn-sm btn-outline-primary reply-toggle">Reply</button>
        <button class="btn btn-sm btn-outline-danger delete-comment-btn">🗑️</button>
      </div>
      <div class="reply-section mt-2" style="display:none;">
        <input type="text" class="form-control mb-1 reply-text" placeholder="Your reply">
        <button class="btn btn-sm btn-success post-reply-btn">Post Reply</button>
      </div>
      <div class="replies mt-3 ps-3 border-start" id="replies-${commentId}"></div>
    `;

    // Toggle Reply Input
    const toggleBtn = commentDiv.querySelector(".reply-toggle");
    const replySection = commentDiv.querySelector(".reply-section");
    toggleBtn.addEventListener("click", () => {
      replySection.style.display = replySection.style.display === "none" ? "block" : "none";
    });

    // Delete Main Comment
    const deleteBtn = commentDiv.querySelector(".delete-comment-btn");
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this comment and all its replies?")) {
        await deleteDoc(doc(db, "comments", commentId));
      }
    });

    // Post Reply
    const replyBtn = commentDiv.querySelector(".post-reply-btn");
    replyBtn.addEventListener("click", async () => {
      const replyText = commentDiv.querySelector(".reply-text").value.trim();
      if (!replyText) return;

      const repliesRef = collection(db, "comments", commentId, "replies");
      await addDoc(repliesRef, {
        text: replyText,
        username: currentUsername,
        timestamp: new Date()
      });

      commentDiv.querySelector(".reply-text").value = "";
      replySection.style.display = "none";
    });

    // Load Replies
    const repliesRef = collection(db, "comments", commentId, "replies");
    onSnapshot(query(repliesRef, orderBy("timestamp", "asc")), (replySnapshot) => {
      const repliesContainer = commentDiv.querySelector(`#replies-${commentId}`);
      repliesContainer.innerHTML = "";

      replySnapshot.forEach((replyDoc) => {
        const replyData = replyDoc.data();
        const replyId = replyDoc.id;

        const replyDiv = document.createElement("div");
        replyDiv.className = "reply d-flex justify-content-between align-items-start mt-2 bg-white p-2 rounded shadow-sm";

        replyDiv.innerHTML = `
          <div><strong>${replyData.username}</strong>: ${replyData.text}</div>
          <button class="btn btn-sm btn-outline-danger delete-reply-btn ms-2">🗑️</button>
        `;

        // Delete Reply
        const deleteReplyBtn = replyDiv.querySelector(".delete-reply-btn");
        deleteReplyBtn.addEventListener("click", async () => {
          if (confirm("Delete this reply?")) {
            await deleteDoc(doc(db, "comments", commentId, "replies", replyId));
          }
        });

        repliesContainer.appendChild(replyDiv);
      });
    });

    commentList.appendChild(commentDiv);
  });
});
