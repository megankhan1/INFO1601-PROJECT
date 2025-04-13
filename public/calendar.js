/*document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');
  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'dayGridMonth'
  });
  calendar.render();
});

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    timeZone: 'UTC',
    initialView: 'dayGridYear',
    headerToolbar: {
      left: 'prev,next',
      center: 'title',
      right: 'dayGridYear,dayGridWeek,dayGridDay'
    },
    editable: true,
    events: 'https://fullcalendar.io/api/demo-feeds/events.json'
  });

  calendar.render();
});*/

document.addEventListener('DOMContentLoaded', function() {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    selectable: true,
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    dateClick: function(info) {
      alert('clicked ' + info.dateStr);
    },
    select: function(info) {
      alert('selected ' + info.startStr + ' to ' + info.endStr);
    }
  });

  calendar.render();
});