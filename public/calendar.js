// server.js
const express = require('express');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());

app.get('/api/availability', (req, res) => {
  const clinic = req.query.clinic;

  // Simulate available time slots (you'll eventually pull this from your DB)
  const sampleSlots = [
    { date: '2025-04-16T09:00:00' },
    { date: '2025-04-16T10:00:00' },
    { date: '2025-04-16T14:00:00' },
    { date: '2025-04-17T11:30:00' },
    { date: '2025-04-17T13:00:00' }
  ];

  res.json(sampleSlots);
});

app.listen(PORT, () => {
  console.log(Server running at http://localhost:${PORT});
});