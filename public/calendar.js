/*import { db } from './firebaseConfig.js';
import {
  collection,
  addDoc,
  setDoc,
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
    selectable: FontFaceSetLoadEvent,
    events: [],
    eventClick: function (info) {
      if (info.event.title !== 'Available') {
        alert("This slot is not available.");
        return;
      }
    
      selectedSlot = new Date(info.event.start);
    
      // Clear previous highlights
      calendar.getEvents().forEach(e => {
        if (e.title === 'Available') {
          e.setProp('backgroundColor', '#3788d8'); // default available slot color
        } else {
          e.setProp('backgroundColor', '#d3d3d3'); // grey for unavailable
        }
      });
    
      // Highlight the selected slot
      info.event.setProp('backgroundColor', '#90ee90'); // light green
    }
  });

  calendar.render();

  window.loadAvailableSlots = async function (clinicId) {
    const slots = [];
    const availabilityRef = collection(db, 'availabilitySlots', clinicId, 'availability');
    const q = query(availabilityRef); // Query all slots
    const snapshot = await getDocs(q);

    const weeksToShow = 3; // Number of weeks to display

    snapshot.forEach((doc) => {
      const data = doc.data();
      const dayOfWeek = data.dayOfWeek;
      const time = data.time;

      const [hours, minutes] = time.split(":").map(Number);

      for (let i = 0; i < weeksToShow; i++) {
        const dateForThisWeek = getDateForDayOfWeek(dayOfWeek, i);
        if (!dateForThisWeek) continue;

        dateForThisWeek.setHours(hours, minutes, 0, 0);

        slots.push({
          id: doc.id + '_week' + i,
          title: data.isAvailable ? 'Available' : 'Unavailable',
          start: dateForThisWeek.toISOString(),
          allDay: false,
          backgroundColor: data.isAvailable ? 'blue' : 'grey', // Blue for available, grey for unavailable
          borderColor: data.isAvailable ? 'blue' : 'grey',
          editable: false,
        });
      }
    });

    calendar.removeAllEvents(); // Clear existing events
    calendar.addEventSource(slots); // Add the new slots
  }

  async function loadExistingPatients() {
    const snapshot = await getDocs(collection(db, 'patients'));
    const datalist = document.getElementById('patientList');
    datalist.innerHTML = ''; // Clear existing options

    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = data.patientId; //+ ' ' + data['fullName'];
      datalist.appendChild(option);
    });
  }

  loadExistingPatients();
  
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
  const clinicId = document.getElementById('clinic').value;
  const selectedSlot = window.getSelectedSlot();

  if (!selectedSlot) {
    alert('Please select a time slot.');
    return;
  }

  const dayName = selectedSlot.toLocaleString('en-US', { weekday: 'long' });
  const timeStr = selectedSlot.toTimeString().slice(0, 5);

  let formData = {
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
      const initials = fullName.split(' ').map(word => word[0].toUpperCase())
        .join('').slice(0, 3);
      const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randomPart = Math.floor(1000 + Math.random() * 9000);

      return `PT-${initials}-${datePart}-${randomPart}`;
    }
    
    const fullName = formData.fullName;
    const generatedId = generatePatientId(fullName);
    const patientData = {
      patientId: generatedId, fullName,
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
    
  }

  if (patientType === 'existing') {
    const patientId = document.querySelector('[name="patientLookup"]').value;
    
    const q = query(
      collection(db, 'patients'),
      where('patientId', '==', patientId)
    );
    
    const match = await getDocs(q);
    if (match.empty) {
      alert("No existing patient found with that name. Please check the name or register as a new patient.");
      return;
    }

    const patientData = match.docs[0].data(); // Get the first matching document
    formData.patientId = patientId; // Add patientId to formData
    formData.fullName = patientData.fullName; // Add the patient's name to formData
  }

  try {
    await addDoc(collection(db, 'appointments'), formData);

    const availabilityRef = collection(db, 'availabilitySlots', clinicId, 'availability');
    const q = query(availabilityRef, 
      where('dayOfWeek', '==', dayName),
      where('time', '==', timeStr),
      where('isAvailable', '==', true)
    );

    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      alert("Couldn't find the exact slot to mark as unavailable.");
    } else {
      for (const docSnap of snapshot.docs) {
        const docRef = firestoreDoc(db, 'availabilitySlots', clinicId, 'availability', docSnap.id);
        await updateDoc(docRef, { isAvailable: false });
      }
      alert("Appointment booked successfully!");
      loadAvailableSlots(clinicId); // Reload available slots to reflect the change
    }
  } catch (err) {
    console.error("Error submitting appointment:", err);
    alert("There was an error submitting the appointment.");
  }
};*/

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

    snapshot.forEach(doc => {
      const data = doc.data();
      const option = document.createElement('option');
      option.value = data.patientId;
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

window.submitAppointment = async function () {
  const patientType = document.getElementById('patientType').value;
  const clinicId = document.getElementById('clinic').value;
  const selectedSlot = window.getSelectedSlot();

  if (!selectedSlot) {
    alert('Please select a time slot.');
    return;
  }

  let formData = {
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
    await addDoc(collection(db, 'appointments'), formData);
    alert("Appointment booked successfully!");
    await loadAvailableSlots(clinicId); // Refresh available slots
  } catch (err) {
    console.error("Error submitting appointment:", err);
    alert("There was an error submitting the appointment.");
  }
};