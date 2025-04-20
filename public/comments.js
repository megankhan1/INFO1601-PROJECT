import { db } from "./firebaseConfig.js";
import {
  collection,
  doc,
  addDoc,
  getDoc,
  deleteDoc,
  onSnapshot,
  query,
  orderBy
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

async function getUsername(uid) {
  try {
    const userDocRef = doc(db, "users", uid); 
    const userDocSnap = await getDoc(userDocRef); 

    if (userDocSnap.exists()) {
      return userDocSnap.data().username || "Anonymous";
    } else {
      console.warn("User not found, returning Anonymous.");
      return "Anonymous";
    }
  } catch (error) {
    console.error("Error fetching username:", error);
    return "Anonymous"; 
  }
}

onAuthStateChanged(auth, (user) => {
  if (user) {
    submitComment.disabled = false;

    submitComment.addEventListener("click", async () => {
      const text = commentText.value.trim();
      if (!text) return;

      const username = await getUsername(user.uid);

      await addDoc(commentsRef, {
        text,
        username, 
        timestamp: new Date()
      });

      commentText.value = "";
    });
  } else {
    submitComment.disabled = true;
    submitComment.textContent = "Login to comment";
  }
});

onSnapshot(query(commentsRef, orderBy("timestamp", "desc")), (snapshot) => {
  commentList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const commentId = docSnap.id;

    const commentDiv = document.createElement("div");
    commentDiv.className = "comment border rounded p-3 mb-3";

    commentDiv.innerHTML = `
      <strong>${data.username}</strong>
      <p>${data.text}</p>
      <button class="btn btn-sm btn-outline-secondary reply-toggle">Reply</button>
      <button class="btn btn-sm btn-danger delete-comment-btn" data-id="${commentId}">Delete</button>
      <div class="reply-section mt-2" style="display:none;">
        <input type="text" class="form-control mb-1 reply-text" placeholder="Your reply">
        <button class="btn btn-sm btn-primary post-reply-btn">Post Reply</button>
      </div>
      <div class="replies mt-2" id="replies-${commentId}"></div>
    `;

    const toggleBtn = commentDiv.querySelector(".reply-toggle");
    const replySection = commentDiv.querySelector(".reply-section");

    toggleBtn.addEventListener("click", () => {
      replySection.style.display = replySection.style.display === "none" ? "block" : "none";
    });

    const replyBtn = commentDiv.querySelector(".post-reply-btn");
    replyBtn.addEventListener("click", async () => {
      const replyText = commentDiv.querySelector(".reply-text").value.trim();
      const currentUser = auth.currentUser;

      if (!replyText || !currentUser) return;

      const replyUsername = await getUsername(currentUser.uid);

      const repliesRef = collection(db, "comments", commentId, "replies");
      await addDoc(repliesRef, {
        text: replyText,
        username: replyUsername, 
        timestamp: new Date()
      });

      commentDiv.querySelector(".reply-text").value = "";
      replySection.style.display = "none";
    });

    const repliesRef = collection(db, "comments", commentId, "replies");
    onSnapshot(query(repliesRef, orderBy("timestamp", "asc")), (replySnapshot) => {
      const repliesContainer = commentDiv.querySelector(`#replies-${commentId}`);
      repliesContainer.innerHTML = "";

      replySnapshot.forEach((replyDoc) => {
        const replyData = replyDoc.data();

        const replyDiv = document.createElement("div");
        replyDiv.className = "reply border-start ps-3 mt-2";
        replyDiv.innerHTML = `<strong>${replyData.username}</strong>: ${replyData.text}`;
        repliesContainer.appendChild(replyDiv);
      });
    });

    const deleteBtn = commentDiv.querySelector(".delete-comment-btn");
    deleteBtn.addEventListener("click", async () => {
      await deleteDoc(doc(db, "comments", commentId));
      commentDiv.remove();
    });

    commentList.appendChild(commentDiv); 
  });
});
