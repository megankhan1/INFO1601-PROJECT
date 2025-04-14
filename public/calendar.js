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
});

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
});*/

document.addEventListener('DOMContentLoaded', function () {
  var calendarEl = document.getElementById('calendar');

  var calendar = new FullCalendar.Calendar(calendarEl, {
    initialView: 'timeGridWeek',
    initialDate: '2025-04-12',
    selectable: true,
    businessHours: true,

    headerToolbar: {
      left: 'prev,next today',
      center: 'title addEventButton',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },

    customButtons: {
      addEventButton: {
        text: 'add event...',
        click: function () {
          var dateStr = prompt('Enter a date in YYYY-MM-DD format');
          var date = new Date(dateStr + 'T00:00:00');

          if (!isNaN(date.valueOf())) {
            calendar.addEvent({
              title: 'dynamic event',
              start: date,
              allDay: true
            });
            alert('Great. Now, update your database...');
          } else {
            alert('Invalid date.');
          }
        }
      }
    },

    dateClick: function (info) {
      alert('clicked ' + info.dateStr);
    },

    select: function (info) {
      alert('selected ' + info.startStr + ' to ' + info.endStr);
    },

    eventClick: function (info) {
      var eventObj = info.event;

      if (eventObj.url) {
        alert('Clicked ' + eventObj.title + '.\nWill open ' + eventObj.url + ' in a new tab');
        window.open(eventObj.url);
        info.jsEvent.preventDefault();
      } else {
        alert('Clicked ' + eventObj.title);
      }
    },

    eventDidMount: function (info) {
      if (info.event.extendedProps.description) {
        new Tooltip(info.el, {
          title: info.event.extendedProps.description,
          placement: 'top',
          trigger: 'hover',
          container: 'body'
        });
      }
    },

    events: [
      {
        title: 'All Day Event',
        description: 'description for All Day Event',
        start: '2025-04-01'
      },
      {
        title: 'Long Event',
        description: 'description for Long Event',
        start: '2025-04-07',
        end: '2025-04-10'
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        description: 'description for Repeating Event',
        start: '2025-04-09T16:00:00'
      },
      {
        groupId: '999',
        title: 'Repeating Event',
        description: 'description for Repeating Event',
        start: '2025-04-16T16:00:00'
      },
      {
        title: 'Conference',
        description: 'description for Conference',
        start: '2025-04-11',
        end: '2025-04-13'
      },
      {
        title: 'Meeting',
        description: 'description for Meeting',
        start: '2025-04-12T10:30:00',
        end: '2025-04-12T12:30:00'
      },
      {
        title: 'Lunch',
        description: 'description for Lunch',
        start: '2025-04-12T12:00:00'
      },
      {
        title: 'Meeting',
        description: 'description for Meeting',
        start: '2025-04-12T14:30:00'
      },
      {
        title: 'Birthday Party',
        description: 'description for Birthday Party',
        start: '2025-04-13T07:00:00'
      },
      {
        title: 'Click for Google',
        description: 'description for Click for Google',
        url: 'https://google.com/',
        start: '2025-04-28'
      },
      {
        title: 'simple event',
        start: '2025-04-02'
      },
      {
        title: 'event with URL',
        url: 'https://www.google.com/',
        start: '2025-04-03'
      }
    ]
  });

  calendar.render();
});