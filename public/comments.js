/*import { db } from "./firebaseConfig.js";
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

const commentList = document.getElementById("comment-list");
const commentText = document.getElementById("comment-text");
const submitComment = document.getElementById("submit-comment");

const commentsRef = collection(db, "comments");
const auth = getAuth();

let currentUsername = "Anonymous";

onAuthStateChanged(auth, async (user) => {
  if (user) {
    const email = user.email;
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      currentUsername = userDoc.data().username || "Anonymous";
    }

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
});*/

/*import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const commentList = document.getElementById("comment-list");
const commentText = document.getElementById("comment-text");
const submitComment = document.getElementById("submit-comment");

const commentsRef = collection(db, "comments");
const auth = getAuth();

let currentUser = null;
let currentUsername = "Anonymous";
let selectedAppointment = null;

// Detect appointment clicked from homepage
document.addEventListener("click", (e) => {
  const appointmentItem = e.target.closest(".appointment-item");
  if (appointmentItem) {
    const patientName = appointmentItem.querySelector("strong")?.textContent?.trim() || "Unnamed Patient";
    const appointmentId = appointmentItem.getAttribute("data-appointment-id");
    selectedAppointment = {
      id: appointmentId,
      patientName: patientName
    };
  }
});

// Get current user's info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const email = user.email;
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      currentUsername = userDoc.data().username || "Anonymous";
    }

    submitComment.addEventListener("click", async () => {
      const text = commentText.value.trim();
      if (!text || !selectedAppointment) {
        alert("Please select an appointment before commenting.");
        return;
      }

      await addDoc(commentsRef, {
        text,
        username: currentUsername,
        userId: user.uid,
        timestamp: serverTimestamp(),
        appointmentId: selectedAppointment.id,
        patientName: selectedAppointment.patientName,
        parentId: null
      });

      commentText.value = "";
    });

  } else {
    submitComment.disabled = true;
    submitComment.textContent = "Login to comment";
  }
});

// Display comments and replies
onSnapshot(query(commentsRef, orderBy("timestamp", "asc")), (snapshot) => {
  commentList.innerHTML = "";

  const comments = [];
  snapshot.forEach((docSnap) => {
    comments.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Group replies under parentId
  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  topLevel.forEach((comment) => {
    const commentDiv = createCommentDiv(comment, replies);
    commentList.appendChild(commentDiv);
  });
});

// Create comment element with replies
function createCommentDiv(comment, allReplies) {
  const div = document.createElement("div");
  div.className = "comment border rounded p-3 mb-3 bg-light shadow-sm";

  const replies = allReplies.filter(r => r.parentId === comment.id);

  div.innerHTML = `
    <p class="mb-1"><strong>${comment.username}</strong></p>
    <p class="mb-1 text-muted small"><em>Patient: ${comment.patientName || "Unknown"}</em></p>
    <p>${comment.text}</p>
    <button class="btn btn-sm btn-outline-secondary me-2 reply-btn">Reply</button>
    ${currentUser && comment.userId === currentUser.uid
      ? `<button class="btn btn-sm btn-outline-danger delete-btn">Delete</button>` 
      : ""}
    <div class="replies mt-3 ps-3 border-start"></div>
  `;

  const replyBtn = div.querySelector(".reply-btn");
  const deleteBtn = div.querySelector(".delete-btn");
  const repliesDiv = div.querySelector(".replies");

  // Reply functionality
  replyBtn.addEventListener("click", () => {
    const replyInput = document.createElement("textarea");
    replyInput.className = "form-control my-2";
    replyInput.placeholder = "Write a reply...";

    const sendReplyBtn = document.createElement("button");
    sendReplyBtn.textContent = "Send";
    sendReplyBtn.className = "btn btn-sm btn-primary mt-1";

    replyBtn.replaceWith(replyInput);
    replyInput.after(sendReplyBtn);

    sendReplyBtn.addEventListener("click", async () => {
      const replyText = replyInput.value.trim();
      if (!replyText) return;

      await addDoc(commentsRef, {
        text: replyText,
        username: currentUsername,
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        appointmentId: comment.appointmentId,
        patientName: comment.patientName,
        parentId: comment.id
      });

      replyInput.remove();
      sendReplyBtn.remove();
    });
  });

  // Delete functionality
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this comment?")) {
        await deleteDoc(doc(db, "comments", comment.id));
      }
    });
  }

  // Render replies
  replies.forEach((reply) => {
    const replyDiv = document.createElement("div");
    replyDiv.className = "reply bg-white border rounded p-2 mb-2";

    replyDiv.innerHTML = `
      <p class="mb-1"><strong>${reply.username}</strong></p>
      <p class="mb-1 text-muted small">Reply:</p>
      <p>${reply.text}</p>
      ${currentUser && reply.userId === currentUser.uid
        ? `<button class="btn btn-sm btn-outline-danger delete-reply-btn">Delete</button>` 
        : ""}
    `;

    const deleteReplyBtn = replyDiv.querySelector(".delete-reply-btn");
    if (deleteReplyBtn) {
      deleteReplyBtn.addEventListener("click", async () => {
        if (confirm("Delete this reply?")) {
          await deleteDoc(doc(db, "comments", reply.id));
        }
      });
    }

    repliesDiv.appendChild(replyDiv);
  });

  return div;
}*/

import { db } from "./firebaseConfig.js";
import {
  collection,
  addDoc,
  getDoc,
  getDocs,
  doc,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  serverTimestamp
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

import {
  getAuth,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js";

const commentList = document.getElementById("comment-list");
const commentText = document.getElementById("comment-text");
const submitComment = document.getElementById("submit-comment");

const commentsRef = collection(db, "comments");
const auth = getAuth();

let currentUser = null;
let currentUsername = "Anonymous";
let selectedAppointment = null;

// Detect appointment clicked from homepage
document.addEventListener("click", (e) => {
  const appointmentItem = e.target.closest(".appointment-item");
  if (appointmentItem) {
    const patientName = appointmentItem.querySelector("strong")?.textContent?.trim() || "Unnamed Patient";
    const appointmentId = appointmentItem.getAttribute("data-appointment-id");
    selectedAppointment = {
      id: appointmentId,
      patientName: patientName
    };
  }
});

// Get current user's info
onAuthStateChanged(auth, async (user) => {
  if (user) {
    currentUser = user;
    const email = user.email;
    const userDoc = await getDoc(doc(db, "users", email));
    if (userDoc.exists()) {
      currentUsername = userDoc.data().username || "Anonymous";
    }

    submitComment.addEventListener("click", async () => {
      const text = commentText.value.trim();
      if (!text || !selectedAppointment) {
        alert("Please select an appointment before commenting.");
        return;
      }

      await addDoc(commentsRef, {
        text,
        username: currentUsername,
        userId: user.uid,
        timestamp: serverTimestamp(),
        appointmentId: selectedAppointment.id,
        patientName: selectedAppointment.patientName,
        parentId: null
      });

      commentText.value = "";
    });

  } else {
    submitComment.disabled = true;
    submitComment.textContent = "Login to comment";
  }
});

// Display comments and replies
onSnapshot(query(commentsRef, orderBy("timestamp", "asc")), (snapshot) => {
  commentList.innerHTML = "";

  const comments = [];
  snapshot.forEach((docSnap) => {
    comments.push({ id: docSnap.id, ...docSnap.data() });
  });

  // Group replies under parentId
  const topLevel = comments.filter(c => !c.parentId);
  const replies = comments.filter(c => c.parentId);

  topLevel.forEach((comment) => {
    const commentDiv = createCommentDiv(comment, replies);
    commentList.appendChild(commentDiv);
  });
});

// Create comment element with replies
function createCommentDiv(comment, allReplies) {
  const div = document.createElement("div");
  div.className = "comment border rounded p-3 mb-3 bg-light shadow-sm";

  const replies = allReplies.filter(r => r.parentId === comment.id);

  div.innerHTML = `
    <p class="mb-1"><strong>${comment.username}</strong></p>
    <p class="mb-1 text-muted small"><em>Patient: ${comment.patientName || "Unknown"}</em></p>
    <p>${comment.text}</p>
    <button class="btn btn-sm btn-outline-secondary me-2 reply-btn">Reply</button>
    ${currentUser && comment.userId === currentUser.uid
      ? `<button class="btn btn-sm btn-outline-danger delete-btn">Delete</button>` 
      : ""}
    <div class="replies mt-3 ps-3 border-start"></div>
  `;

  const replyBtn = div.querySelector(".reply-btn");
  const deleteBtn = div.querySelector(".delete-btn");
  const repliesDiv = div.querySelector(".replies");

  // Reply functionality
  replyBtn.addEventListener("click", () => {
    const replyInput = document.createElement("textarea");
    replyInput.className = "form-control my-2";
    replyInput.placeholder = "Write a reply...";

    const sendReplyBtn = document.createElement("button");
    sendReplyBtn.textContent = "Send";
    sendReplyBtn.className = "btn btn-sm btn-primary mt-1";

    replyBtn.replaceWith(replyInput);
    replyInput.after(sendReplyBtn);

    sendReplyBtn.addEventListener("click", async () => {
      const replyText = replyInput.value.trim();
      if (!replyText) return;

      await addDoc(commentsRef, {
        text: replyText,
        username: currentUsername,
        userId: currentUser.uid,
        timestamp: serverTimestamp(),
        appointmentId: comment.appointmentId,
        patientName: comment.patientName,
        parentId: comment.id
      });

      replyInput.remove();
      sendReplyBtn.remove();
    });
  });

  // Delete functionality for comments
  if (deleteBtn) {
    deleteBtn.addEventListener("click", async () => {
      if (confirm("Delete this comment and all its replies?")) {
        // Delete replies first
        const repliesToDelete = allReplies.filter(r => r.parentId === comment.id);
        for (const reply of repliesToDelete) {
          await deleteDoc(doc(db, "comments", reply.id));
        }
        // Then delete parent comment
        await deleteDoc(doc(db, "comments", comment.id));
      }
    });
  }

  // Render replies
  replies.forEach((reply) => {
    const replyDiv = document.createElement("div");
    replyDiv.className = "reply bg-white border rounded p-2 mb-2";

    replyDiv.innerHTML = `
      <p class="mb-1"><strong>${reply.username}</strong></p>
      <p class="mb-1 text-muted small">Reply:</p>
      <p>${reply.text}</p>
      ${currentUser && reply.userId === currentUser.uid
        ? `<button class="btn btn-sm btn-outline-danger delete-reply-btn">Delete</button>` 
        : ""}
    `;

    const deleteReplyBtn = replyDiv.querySelector(".delete-reply-btn");
    if (deleteReplyBtn) {
      deleteReplyBtn.addEventListener("click", async () => {
        if (confirm("Delete this reply?")) {
          await deleteDoc(doc(db, "comments", reply.id));
        }
      });
    }

    repliesDiv.appendChild(replyDiv);
  });

  return div;
}

