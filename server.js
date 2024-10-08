// Updated server.js

require('dotenv').config();

const express = require('express');
const axios = require('axios');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const { verifyToken, verifyAdmin } = require('./middleware/authMiddleware');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(
  cors({
    origin: '*',
    credentials: true,
  })
);
app.use(express.json());

// Connect to MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('MongoDB Atlas connected'))
  .catch((err) => console.log('MongoDB connection error:', err));

// Open-Meteo Weather Endpoint
app.get('/weather', async (req, res) => {
  const latitude = 33.1032; // Allen, TX latitude
  const longitude = -96.6706; // Allen, TX longitude
  const timezone = 'America/Chicago';

  try {
    const response = await axios.get('https://api.open-meteo.com/v1/forecast', {
      params: {
        latitude,
        longitude,
        daily: 'temperature_2m_max,temperature_2m_min,weathercode,precipitation_probability_max',
        timezone,
        temperature_unit: 'fahrenheit',
        forecast_days: 7,
      },
    });
    res.json(response.data);
  } catch (error) {
    console.error('Error fetching weather data:', error.message);
    res.status(500).json({ error: 'Failed to fetch weather data' });
  }
});

// NewsAPI Proxy Endpoint
app.get('/api/news', async (req, res) => {
  const apiKey = process.env.NEWSAPI_KEY;

  if (!apiKey) {
    return res.status(500).json({ error: 'API key not defined' });
  }

  try {
    const response = await axios.get('https://newsapi.org/v2/everything', {
      params: {
        q: 'cybersecurity',
        sortBy: 'publishedAt',
        language: 'en',
        pageSize: 10,
        apiKey: apiKey,
      },
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching news:', error.message);
    res.status(500).json({ error: 'Failed to fetch news' });
  }
});

// Authentication Routes
app.use('/api/auth', authRoutes);

// User Management Routes (Protected)
app.use('/api/users', verifyToken, verifyAdmin, userRoutes);

// Temporary route to create an admin user (remove or comment out after use)
app.post('/create-admin', async (req, res) => {
  const { username, password } = req.body;
  try {
    // Check if the user already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Hash the password before saving
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create a new admin user
    const newUser = new User({ username, password: hashedPassword, isAdmin: true });
    await newUser.save();

    res.json({ msg: 'Admin user created successfully' });
  } catch (err) {
    console.error('Error creating admin user:', err);
    res.status(500).json({ msg: 'Server error' });
  }
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});