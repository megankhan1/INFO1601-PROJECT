/*window.togglePatientForm = function () {
  const type = document.getElementById('patientType').value;
  document.getElementById('newPatientForm').classList.toggle('hidden', type !== 'new');
  document.getElementById('existingPatientForm').classList.toggle('hidden', type !== 'existing');
};

document.addEventListener('DOMContentLoaded', function () {
  const calendarEl = document.getElementById('calendar');


  let selectedSlot = null;


  const calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    height: 600,
    selectable: true,
    events: [],

    eventClick: function (info) {
      selectedSlot = info.event.start;
      alert(`You selected: ${selectedSlot.toLocaleString()}`);
    }
  });


  calendar.render();


  document.getElementById('clinic').addEventListener('change', async function () {
    const clinic = this.value;
    if (!clinic) return;


    // Simulate fetching from backend
    const response = await fetch(`/api/availability?clinic=${clinic}`);
    const slots = await response.json();


    const events = slots.map(slot => ({
      title: slot.time,
      start: slot.date,
      allDay: false
    }));


    calendar.removeAllEvents();
    calendar.addEventSource(events);
  });
});

window.submitAppointment = function () {
  const patientType = document.getElementById('patientType').value;
  const clinic = document.getElementById('clinic').value;

  let formData = {
    patientType,
    clinic,
    appointmentTime: selectedSlot ? selectedSlot.toISOString() : null,
  };

  if (!selectedSlot) {
    alert('Please select a time slot.');
    return;
  }

  if (patientType === 'new') {
    formData.fullName = document.querySelector('[name="fullName"]').value;
    formData.dob = document.querySelector('[name="dob"]').value;
    formData.address = document.querySelector('[name="address"]').value;
    formData.contact = document.querySelector('[name="contact"]').value;
    formData.emergencyContact = document.querySelector('[name="emergencyContact"]').value;
    formData.medicalHistory = document.querySelector('[name="medicalHistory"]').value;
  } else if (patientType === 'existing') {
    formData.patientLookup = document.querySelector('[name="patientLookup"]').value;
  }

  console.log("Submitting Appointment:", formData);
  alert("Appointment submitted (check console)!");
};

window.togglePatientForm = togglePatientForm;
window.submitAppointment = submitAppointment;*/


  
import { db } from './firebaseConfig.js';
import { collection, addDoc } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

  // Your existing calendar and form code
  let selectedSlot = null;

  window.togglePatientForm = function () {
    const type = document.getElementById('patientType').value;
    document.getElementById('newPatientForm').classList.toggle('hidden', type !== 'new');
    document.getElementById('existingPatientForm').classList.toggle('hidden', type !== 'existing');
  };

  document.addEventListener('DOMContentLoaded', function () {
    const calendarEl = document.getElementById('calendar');

    const calendar = new FullCalendar.Calendar(calendarEl, {
      initialView: 'timeGridWeek',
      height: 600,
      selectable: true,
      events: [],

      // Time slot selection
      eventClick: function (info) {
        selectedSlot = info.event.start;
        alert(`You selected: ${selectedSlot.toLocaleString()}`);
      }
    });

    calendar.render();

    // Simulated backend for now (replace with actual API call)
    document.getElementById('clinic').addEventListener('change', async function () {
      const clinic = this.value;
      if (!clinic) return;

      const slots = [
        { date: '2025-04-20T09:00:00', time: '9:00 AM' },
        { date: '2025-04-20T10:30:00', time: '10:30 AM' },
        { date: '2025-04-20T01:00:00', time: '1:00 PM' },
        { date: '2025-04-20T02:30:00', time: '2:30 PM' }
      ];

      const events = slots.map(slot => ({
        title: slot.time,
        start: slot.date,
        allDay: false
      }));

      calendar.removeAllEvents();
      calendar.addEventSource(events);
    });
  });

  window.submitAppointment = async function () {
    const patientType = document.getElementById('patientType').value;
    const clinic = document.getElementById('clinic').value;

    if (!selectedSlot) {
      alert('Please select a time slot.');
      return;
    }

    let formData = {
      patientType,
      clinic,
      appointmentTime: selectedSlot.toISOString(),
    };

    if (patientType === 'new') {
      formData.fullName = document.querySelector('[name="fullName"]').value;
      formData.dob = document.querySelector('[name="dob"]').value;
      formData.address = document.querySelector('[name="address"]').value;
      formData.contact = document.querySelector('[name="contact"]').value;
      formData.emergencyContact = document.querySelector('[name="emergencyContact"]').value;
      formData.medicalHistory = document.querySelector('[name="medicalHistory"]').value;
    } else if (patientType === 'existing') {
      formData.patientLookup = document.querySelector('[name="patientLookup"]').value;
    }

    try {
      await addDoc(collection(db, "appointments"), formData);
      alert("Appointment successfully submitted!");
    } catch (error) {
      console.error("Error adding appointment:", error);
      alert("Failed to submit appointment.");
    }
  };