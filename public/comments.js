import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDocs,
  deleteDoc,
  doc,
  onSnapshot
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

const commentInput = document.getElementById("comment-input");
const submitBtn = document.getElementById("submit-comment");
const commentList = document.getElementById("comment-list");
const extraBox = document.querySelector(".extra-box");

const commentsRef = collection(db, "comments");

function resizeBox() {
  const contentHeight = extraBox.scrollHeight;
  extraBox.style.maxHeight = contentHeight + "px";
}

onSnapshot(commentsRef, (snapshot) => {
  commentList.innerHTML = "";

  snapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const commentDiv = document.createElement("div");
    commentDiv.className = "d-flex justify-content-between align-items-center mb-2";

    commentDiv.innerHTML = `
    <span>${data.text}</span>
    <button class="btn btn-sm btn-outline-secondary" title="Delete">
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor"
        class="bi bi-trash3" viewBox="0 0 16 16">
        <path d="M6.5 1.5v1h3v-1h-3Z"/>
        <path d="M3.5 3v1h9V3h-9Zm1.68 1.11A.5.5 0 0 0 4.5 4.5h-1a.5.5 0 0 0 0 1h.25l.546 7.591a1 1 0 0 0 .998.909h5.412a1 1 0 0 0 .998-.909L12.25 5.5h.25a.5.5 0 0 0 0-1h-1a.5.5 0 0 0-.49.39L10.214 13H5.786L5.01 4.61Z"/>
        </svg>
    </button>
    `;


    commentDiv.querySelector("button").addEventListener("click", async () => {
      await deleteDoc(doc(db, "comments", docSnap.id));
    });

    commentList.appendChild(commentDiv);
  });

  resizeBox();
});

submitBtn.addEventListener("click", async () => {
  const commentText = commentInput.value.trim();
  if (!commentText) return;

  await addDoc(commentsRef, {
    text: commentText,
    timestamp: new Date()
  });

  commentInput.value = "";
});
