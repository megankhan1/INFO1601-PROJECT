  import { db } from './firebaseConfig.js';
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
      selectable: true,
      events: [],
      select: function (info) {
        selectedSlot = new Date(info.start);
        alert(`You selected: ${selectedSlot.toLocaleString()}`);
      },
      eventClick: function (info) {
        selectedSlot = new Date(info.event.start);
        alert(`You selected: ${selectedSlot.toLocaleString()}`);
      }
    });
  
    calendar.render();
  
    async function loadAvailableSlots(clinicId) {
      const slots = [];
      const availabilityRef = collection(db, 'availabilitySlots', clinicId, 'availability');
      const q = query(availabilityRef, where('isAvailable', '==', true));
      const snapshot = await getDocs(q);

      const weeksToShow = 3;
  
      snapshot.forEach(doc => {
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
        title: 'Available',
        start: dateForThisWeek.toISOString(),
        allDay: false
      });
    }
  });
  
      calendar.removeAllEvents();
      calendar.addEventSource(slots);
    }

    async function loadAvailableSlots(clinicId) {
      const slots = [];
      const availabilityRef = collection(db, 'availabilitySlots', clinicId, 'availability');
      const q = query(availabilityRef, where('isAvailable', '==', true));
      const snapshot = await getDocs(q);
    
      const weeksToShow = 36;
    
      snapshot.forEach(doc => {
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
            title: 'Available',
            start: dateForThisWeek.toISOString(),
            allDay: false
          });
        }
      });
    
      calendar.removeAllEvents();
      calendar.addEventSource(slots);
    }

    async function loadExistingPatients() {
      const snapshot = await getDocs(collection(db, 'patients'));
      const datalist = document.getElementById('patientList');
      datalist.innerHTML = ''; // Clear existing options

      snapshot.forEach(doc => {
        const data = doc.data();
        const option = document.createElement('option');
        option.value = data.patientId + ' ' + data['fullName'];
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
      const patientName = document.querySelector('[name="patientLookup"]').value;
      
      const q = query(
        collection(db, 'patients'),
        where('Patient Name', '==', patientName)
      );
      
      const match = await getDocs(q);
      if(match.empty) {
        alert("No existing patient found with that name. Please check the name or register as a new patient.");
        return;
      }
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
      window.location.reload();
    }
  } catch (err) {
    console.error("Error submitting appointment:", err);
    alert("There was an error submitting the appointment.");
  }
};