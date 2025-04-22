import { db } from './firebaseConfig.js';
import {
  collection,
  addDoc,
  setDoc,
  getDocs,
  query,
  where,
  doc as firestoreDoc
} from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

let selectedSlot = null;

window.togglePatientForm = function () {
  const type = document.getElementById('patientType').value;
  document.getElementById('newPatientForm').classList.toggle('hidden', type !== 'new');
  document.getElementById('existingPatientForm').classList.toggle('hidden', type !== 'existing');
};

let loadAvailableSlots; // declared in outer scope for access across functions

document.addEventListener('DOMContentLoaded', async function () {
  const calendarEl = document.getElementById('calendar');

  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    height: 600,
    selectable: true,
    events: [],
    eventClick: function (info) {
      if (info.event.title !== 'Available') {
        alert("This slot is not available.");
        return;
      }

      selectedSlot = new Date(info.event.start);

      calendar.getEvents().forEach(e => {
        if (e.title === 'Available') {
          e.setProp('backgroundColor', '#3788d8');
        } else {
          e.setProp('backgroundColor', '#d3d3d3');
        }
      });

      info.event.setProp('backgroundColor', '#90ee90'); // light green
    }
  });

  calendar.render();

  loadAvailableSlots = async function (clinicId) {
    const slots = [];
    const weeksToShow = 36;

    const availabilityRef = collection(db, 'availabilitySlots', clinicId, 'availability');
    const appointmentRef = collection(db, 'appointments');

    const availabilitySnapshot = await getDocs(availabilityRef);
    const appointmentSnapshot = await getDocs(query(appointmentRef, where("clinic", "==", clinicId)));

    const bookedSet = new Set();
    appointmentSnapshot.forEach(doc => {
      const apptTime = doc.data().appointmentTime;
      bookedSet.add(new Date(apptTime).toISOString());
    });

    availabilitySnapshot.forEach((doc) => {
      const data = doc.data();
      const dayOfWeek = data.dayOfWeek;
      const time = data.time;
      const [hours, minutes] = time.split(":").map(Number);

      for (let i = 0; i < weeksToShow; i++) {
        const date = getDateForDayOfWeek(dayOfWeek, i);
        if (!date) continue;

        date.setHours(hours, minutes, 0, 0);
        const iso = date.toISOString();

        const isBooked = bookedSet.has(iso);

        slots.push({
          id: doc.id + '_week' + i,
          title: isBooked ? 'Unavailable' : 'Available',
          start: iso,
          allDay: false,
          backgroundColor: isBooked ? 'grey' : 'blue',
          borderColor: isBooked ? 'grey' : 'blue',
          editable: false
        });
      }
    });

    calendar.removeAllEvents();
    calendar.addEventSource(slots);
  };

  async function loadExistingPatients() {
    const snapshot = await getDocs(collection(db, 'patients'));
    const datalist = document.getElementById('patientList');
    datalist.innerHTML = '';

    const defaultOption = document.createElement('option');
    defaultOption.value = '';
    defaultOption.textContent = 'Select an existing patient';
    defaultOption.disabled = true;
    defaultOption.selected = true;
    datalist.appendChild(defaultOption);

    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = data.patientId;
      option.textContent = `${data.fullName} (${data.patientId})`;
      datalist.appendChild(option);
    });
  }

  function getDateForDayOfWeek(dayName, weekOffset = 0) {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const targetIndex = days.indexOf(dayName);
    if (targetIndex === -1) return null;

    const now = new Date();
    const currentDay = now.getDay();
    const diff = targetIndex - currentDay + (weekOffset * 7);
    const targetDate = new Date(now);
    targetDate.setDate(now.getDate() + diff);
    targetDate.setHours(0, 0, 0, 0); 
    return targetDate;
  }

  document.getElementById('clinic').addEventListener('change', function () {
    const clinicId = this.value;
    console.log("Selected clinic ID:", clinicId);
    if (!clinicId) return;
    loadAvailableSlots(clinicId);
  });

  const defaultClinic = document.getElementById('clinic').value;
  if (defaultClinic) {
    await loadAvailableSlots(defaultClinic);
  }

  loadExistingPatients();

  window.getSelectedSlot = function () {
    return selectedSlot;
  };
});

function generateAppointmentId(clinicId, appointmentTime) {
  const datePart = new Date(appointmentTime).toISOString().slice(0, 10).replace(/-/g, '');
  const timePart = new Date(appointmentTime).toISOString().slice(11, 16).replace(':', '');
  const randomPart = Math.floor(1000 + Math.random() * 9000); 
  return `APPT-${clinicId}-${datePart}-${timePart}-${randomPart}`;
}

window.submitAppointment = async function () {
  const patientType = document.getElementById('patientType').value;
  const clinicId = document.getElementById('clinic').value;
  const selectedSlot = window.getSelectedSlot();

  if (!selectedSlot) {
    alert('Please select a time slot.');
    return;
  }

  const appointmentId = generateAppointmentId(clinicId, selectedSlot);

  let formData = {
    appointmentId,
    patientType,
    clinic: clinicId,
    appointmentTime: selectedSlot.toISOString(),
  };

  if (patientType === 'new') {
    formData.fullName = document.querySelector('[name="fullName"]').value;
    formData.dob = document.querySelector('[name="dob"]').value;
    formData.address = document.querySelector('[name="address"]').value;
    formData.contact = document.querySelector('[name="contact"]').value;
    formData.emergencyContact = document.querySelector('[name="emergencyContact"]').value;
    formData.medicalHistory = document.querySelector('[name="medicalHistory"]').value;

    function generatePatientId(fullName) {
      const initials = fullName.split(' ').map(word => word[0].toUpperCase()).join('').slice(0, 3);
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);
      return `PT-${initials}-${datePart}-${randomPart}`;
    }

    const fullName = formData.fullName;
    const generatedId = generatePatientId(fullName);
    const patientData = {
      patientId: generatedId,
      fullName,
      dob: formData.dob,
      address: formData.address,
      contact: formData.contact,
      emergencyContact: formData.emergencyContact,
      medicalHistory: formData.medicalHistory,
      createdAt: new Date().toISOString()
    };

    const patientsRef = collection(db, 'patients');
    const dupQuery = query(patientsRef, where('patientId', '==', generatedId));
    const dupSnapshot = await getDocs(dupQuery);

    if (!dupSnapshot.empty) {
      alert("Patient ID already exists. Please try again.");
      return;
    }

    const patientRef = firestoreDoc(db, 'patients', generatedId);
    await setDoc(patientRef, patientData);
    formData.patientId = generatedId;

  } else if (patientType === 'existing') {
    const patientId = document.querySelector('[name="patientLookup"]').value;

    const q = query(collection(db, 'patients'), where('patientId', '==', patientId));
    const match = await getDocs(q);

    if (match.empty) {
      alert("No existing patient found with that ID.");
      return;
    }

    const patientData = match.docs[0].data();
    formData.patientId = patientId;
    formData.fullName = patientData.fullName;
  }

  try {
    const appointmentRef = firestoreDoc(db, 'appointments', appointmentId); // Use the generated ID
    await setDoc(appointmentRef, formData); // Save the appointment with the custom ID
    alert("Appointment booked successfully!");
    await loadAvailableSlots(clinicId); // Refresh available slots
  } catch (err) {
    console.error("Error submitting appointment:", err);
    alert("There was an error submitting the appointment.");
  }
};

window.cancelAppointment = function() {
  window.location.href = "home.html"; // Redirect to the home page
}