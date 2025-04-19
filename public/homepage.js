import { collection, getDocs, getDoc, query, orderBy, doc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
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

  const detailsBox = document.getElementById("patient-details-box");
  if (detailsBox) {
    const docRef = doc(db, "patients", patientId);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      const data = docSnap.data();
      detailsBox.innerHTML = `<h4>${data.fullName}</h4>
        <p>Patient ID: ${patientId}</p>
        <p>DOB: ${data.dob}</p>
        <p>Address: ${data.address}</p>
        <p>Contact: ${data.contact}</p>
        <p>Emergency Contact: ${data.emergencyContact}</p>
        <p>Medical History: ${data.medicalHistory}</p>`;
    } else {
      detailsBox.innerHTML = `<p>No details found for patient ID: ${patientId}</p>`;
    }
  }
}

async function loadAppointments() {
  const appointmentsDiv = document.querySelector(".appointments");
  appointmentsDiv.innerHTML = `<h3>Appointments</h3>`;

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
        const patientType = appt.patientType || "unspecified";

        html += `
          <div class="appointment-item" data-id="${appt.patientId}" style="margin-bottom: 0.5rem; cursor: pointer;">
            <strong>${name}</strong><br>
            Clinic: ${clinic}<br>
            Date: ${formattedDate}<br>
            Time: ${formattedTime}
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
      await loadPatientComments(patientId); // Ensure this function exists
    });
  } catch (error) {
    console.error("Error loading appointments:", error);
    appointmentsDiv.innerHTML += `<p style="color:red;">Failed to load appointments.</p>`;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  const loader = document.getElementById("appointments-loader");
  const todayAppointments = document.getElementById("today-appointments");
  const tomorrowAppointments = document.getElementById("tomorrow-appointments");

  // Show the loader
  loader.style.display = "block";
});

loadAppointments();
