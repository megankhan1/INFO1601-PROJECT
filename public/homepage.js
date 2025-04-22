import { collection, getDocs, getDoc, query, orderBy, doc, updateDoc, deleteDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebaseConfig.js'; // Adjust path if necessary

function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
}

async function loadPatientDetails(patientId) {
  console.log("Loading details for patient ID:", patientId); // Debugging log

  const detailsBox = document.getElementById("patient-details");
  if (detailsBox) {
    const docRef = doc(db, "patients", patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      detailsBox.innerHTML = `<h4>${data.fullName}</h4>
        <p><strong>Patient ID:</strong> ${patientId}</p>
        <p><strong>DOB:</strong> ${data.dob}</p>
        <p><strong>Address:</strong> ${data.address}</p>
        <p><strong>Contact:</strong> ${data.contact}</p>
        <p><strong>Emergency Contact:</strong> ${data.emergencyContact}</p>
        <p><strong>Medical History:</strong> ${data.medicalHistory}</p>`;
    } else {
      detailsBox.innerHTML = `<p>No details found for patient ID: ${patientId}</p>`;
    }
  }
}

async function loadAppointments() {
  const appointmentsDiv = document.querySelector(".appointments");
  appointmentsDiv.innerHTML = `<h3>APPOINTMENTS</h3>`;

  try {
    const appointmentsRef = collection(db, "appointments");
    const q = query(appointmentsRef, orderBy("appointmentTime", "asc"));

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      appointmentsDiv.innerHTML += `<p>No appointments found.</p>`;
      return;
    }

    const today = new Date();
    today.setHours(0, 0, 0, 0); // Reset time to the start of the day

    const todayAppointments = [];
    const upcomingAppointments = [];

    snapshot.forEach((doc) => {
      const data = doc.data();
      const timeStr = data.appointmentTime;
      const dateObj = new Date(timeStr);

      if (isNaN(dateObj)) return;

      if (isSameDate(dateObj, today)) {
        todayAppointments.push({ ...data, dateObj });
      } else if (dateObj > today) {
        upcomingAppointments.push({ ...data, dateObj });
      }
    });

    function renderAppointmentSection(title, appointments) {
      if (appointments.length === 0) return "";

      let html = `<div class="section"><h4>${title}</h4>`;
      appointments.forEach((appt) => {
        const formattedTime = appt.dateObj.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        });

        const formattedDate = appt.dateObj.toLocaleDateString([], {
          year: "numeric",
          month: "long",
          day: "numeric",
        });

        const name = appt.patientLookup || appt.fullName || "Unnamed";
        const clinic = appt.clinic || "Unknown Clinic";

        html += `
          <div class="appointment-item" data-id="${appt.patientId}" data-appointment-id="${appt.id}" style="margin-bottom: 0.5rem; cursor: pointer;">
            <strong>${name}</strong><br>
            Clinic: ${clinic}<br>
            Date: ${formattedDate}<br>
            Time: ${formattedTime}
            <div class="appointment-actions">
              <button class="edit-btn" data-id="${appt.appointmentId}" title="Edit Appointment">
                ✏️
              </button>
              <button class="cancel-btn" data-id="${appt.appointmentId}" title="Cancel Appointment">
                ❌
              </button>
            </div>
          </div>
        `;
      });
      html += `</div>`;
      return html;
    }

    appointmentsDiv.innerHTML += renderAppointmentSection("Today", todayAppointments);
    appointmentsDiv.innerHTML += renderAppointmentSection("Upcoming", upcomingAppointments);

    // Add click event listener for patient details
    document.querySelector(".appointments").addEventListener("click", async (e) => {
      const item = e.target.closest(".appointment-item");
      if (!item) return;
      const patientId = item.getAttribute("data-id");
      if (!patientId) return;

      await loadPatientDetails(patientId);
      //await loadPatientComments(patientId); // Ensure this function exists
    });

    // Add click event listener for edit and cancel buttons
    document.querySelector(".appointments").addEventListener("click", async (e) => {
      const editButton = e.target.closest(".edit-btn");
      const cancelButton = e.target.closest(".cancel-btn");

      if (editButton) {
        const appointmentId = editButton.getAttribute("data-id");
        await editAppointment(appointmentId);
      }

      if (cancelButton) {
        const appointmentId = cancelButton.getAttribute("data-id");
        await deleteAppointment(appointmentId);
      }
    });
  } catch (error) {
    console.error("Error loading appointments:", error);
    appointmentsDiv.innerHTML += `<p style="color:red;">Failed to load appointments.</p>`;
  }
}

async function editAppointment(appointmentId) {
  const appointmentRef = doc(db, "appointments", appointmentId);
  const appointmentSnap = await getDoc(appointmentRef);

  if (!appointmentSnap.exists()) {
    alert("Appointment not found.");
    return;
  }

  const appointmentData = appointmentSnap.data();

  // Prompt the user to edit the details (you can replace this with a modal or form)
  const newDate = prompt("Enter new date (YYYY-MM-DD):", appointmentData.appointmentTime.split("T")[0]);
  const newTime = prompt("Enter new time (HH:MM):", appointmentData.appointmentTime.split("T")[1].slice(0, 5));

  if (!newDate || !newTime) {
    alert("Invalid input. Appointment not updated.");
    return;
  }

  const newDateTime = new Date(`${newDate}T${newTime}`).toISOString();

  // Update the appointment in Firestore
  await updateDoc(appointmentRef, { appointmentTime: newDateTime });

  // Make the old slot available again
  const oldSlotRef = doc(db, "availabilitySlots", appointmentData.clinic, "availability", appointmentData.slotId);
  await updateDoc(oldSlotRef, { isAvailable: true });

  // Mark the new slot as unavailable
  const newSlotRef = doc(db, "availabilitySlots", appointmentData.clinic, "availability", `${newDate}-${newTime}`);
  await updateDoc(newSlotRef, { isAvailable: false });

  alert("Appointment updated successfully!");
  await loadAppointments(); // Refresh the appointments list
}

async function deleteAppointment(appointmentId) {
  const appointmentRef = doc(db, "appointments", appointmentId);
  const appointmentSnap = await getDoc(appointmentRef);

  if (!appointmentSnap.exists()) {
    alert("Appointment not found.");
    return;
  }

  const appointmentData = appointmentSnap.data();

  // Show confirmation prompt
  const confirmDelete = confirm("Are you sure you want to cancel this appointment?");
  if (!confirmDelete) {
    return; // Exit if the user cancels the action
  }

  // Delete the appointment
  await deleteDoc(appointmentRef);

  // Make the slot available again
  const slotRef = doc(db, "availabilitySlots", appointmentData.clinic, "availability", appointmentData.slotId);
  await updateDoc(slotRef, { isAvailable: true });

  alert("Appointment canceled successfully!");
  await loadAppointments(); // Refresh the appointments list
}

document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("appointments-loader");
  const todayAppointments = document.getElementById("today-appointments");
  const tomorrowAppointments = document.getElementById("tomorrow-appointments");

  // Show the loader
  loader.style.display = "block";
});

loadAppointments();
