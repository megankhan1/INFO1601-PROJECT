  import { db } from './firebaseConfig.js';
  import {
    collection,
    addDoc,
    getDocs,
    query,
    where,
    updateDoc,
    doc as firestoreDoc
  } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
  
  let selectedSlot = null;
  
  window.togglePatientForm = function () {
    const type = document.getElementById('patientType').value;
    document.getElementById('newPatientForm').classList.toggle('hidden', type !== 'new');
    document.getElementById('existingPatientForm').classList.toggle('hidden', type !== 'existing');
  };
  
  document.addEventListener('DOMContentLoaded', async function () {
    const calendarEl = document.getElementById('calendar');
  
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
  
    async function loadAvailableSlots(clinicId) {
      const slots = [];
      const availabilityRef = collection(db, 'availabilitySlots', clinicId, 'availability');
      const q = query(availabilityRef, where('isAvailable', '==', true));
      const snapshot = await getDocs(q);
  
      snapshot.forEach(doc => {
        const data = doc.data();
        const timestamp = data.time; // Firestore Timestamp
        const dateObj = timestamp.toDate();
  
        slots.push({
          id: doc.id,
          title: 'Available',
          start: dateObj.toISOString(),
          allDay: false
        });
      });
  
      calendar.removeAllEvents();
      calendar.addEventSource(slots);
    }
  
    document.getElementById('clinic').addEventListener('change', function () {
      const clinicId = this.value;
      if (!clinicId) return;
      loadAvailableSlots(clinicId);
    });

    const defaultClinic = document.getElementById('clinic').value;
    if (defaultClinic) {
      loadAvailableSlots(defaultClinic);
    }
  
    window.getSelectedSlot = function () {
      return selectedSlot;
    };
  });
  
  window.submitAppointment = async function () {
    const patientType = document.getElementById('patientType').value;
    const clinic = document.getElementById('clinic').value;
    const selectedSlot = window.getSelectedSlot();
  
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
      await addDoc(collection(db, 'appointments'), formData);
  
      const availabilityRef = collection(db, 'availabilitySlots', clinic, 'availability');
      const q = query(availabilityRef, where('isAvailable', '==', true));
      const snapshot = await getDocs(q);
  
      const selectedTime = new Date(selectedSlot);
      const selectedMinutes = selectedTime.getHours() * 60 + selectedTime.getMinutes();
  
      let matchFound = false;
  
      for (const docSnap of snapshot.docs) {
        const data = docSnap.data();
        const time = data.time.toDate();
        const timeMinutes = time.getHours() * 60 + time.getMinutes();
  
        if (Math.abs(timeMinutes - selectedMinutes) < 1) {
          const docRef = firestoreDoc(db, 'availabilitySlots', clinic, 'availability', docSnap.id);
          await updateDoc(docRef, { isAvailable: false });
          matchFound = true;
          break;
        }
      }
  
      if (!matchFound) {
        alert("Couldn't find the exact slot to mark as unavailable.");
      } else {
        alert("Appointment booked successfully!");
        window.location.reload();
      }
    } catch (err) {
      console.error("Error submitting appointment:", err);
      alert("There was an error submitting the appointment.");
    }
  };
  