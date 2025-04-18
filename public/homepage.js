import { collection, getDocs, query, orderBy } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import { db } from './firebaseConfig.js'; // Adjust path if necessary

function isSameDate(date1, date2) {
  return (
    date1.getFullYear() === date2.getFullYear() &&
    date1.getMonth() === date2.getMonth() &&
    date1.getDate() === date2.getDate()
  );
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
    const tomorrow = new Date();
    tomorrow.setDate(today.getDate() + 1);

    const todayAppointments = [];
    const tomorrowAppointments = [];

    snapshot.forEach(doc => {
      const data = doc.data();
      const timeStr = data.appointmentTime;
      const dateObj = new Date(timeStr);

      if (isNaN(dateObj)) return; 

      if (isSameDate(dateObj, today)) {
        todayAppointments.push({ ...data, dateObj });
      } else if (isSameDate(dateObj, tomorrow)) {
        tomorrowAppointments.push({ ...data, dateObj });
      }
    });

    function renderAppointmentSection(title, appointments) {
        if (appointments.length === 0) return '';
      
        let html = `<div class="section"><h4>${title}</h4>`;
        appointments.forEach(appt => {
          const formattedTime = appt.dateObj.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          });
      
          const name = appt.patientLookup || appt.fullName || "Unnamed";
          const clinic = appt.clinic || "Unknown Clinic";
          const patientType = appt.patientType || "unspecified";
      
          let medicalHistory = '';
          if (patientType === "new" && appt.medicalHistory) {
            medicalHistory = `${appt.medicalHistory}`;
          }
      
          html += `
            <div style="margin-bottom: 0.5rem;">
              <strong>${name}</strong><br>
              Clinic: ${clinic}<br>
              Patient Type: ${patientType}<br>
              Time: ${formattedTime} <br>
              Medical History: ${medicalHistory}
            </div>
          `;
        });
        html += `</div>`;
        return html;
      }
      

    appointmentsDiv.innerHTML += renderAppointmentSection("Today", todayAppointments);
    appointmentsDiv.innerHTML += renderAppointmentSection("Tomorrow", tomorrowAppointments);

  } catch (error) {
    console.error("Error loading appointments:", error);
    appointmentsDiv.innerHTML += `<p style="color:red;">Failed to load appointments.</p>`;
  }
}

loadAppointments();
