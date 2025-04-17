window.togglePatientForm = function () {
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
window.submitAppointment = submitAppointment;
