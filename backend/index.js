require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { vectorSearchRoutes } = require('./api/vector-search');
const { geminiRoutes } = require('./api/gemini');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/vector', vectorSearchRoutes);
app.use('/api/gemini', geminiRoutes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'OceanPulse backend is running' });
});

// Start server
app.listen(PORT, () => {
  console.log(`OceanPulse backend server running on port ${PORT}`);
});
