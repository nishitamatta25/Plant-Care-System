const express = require('express');
const cors = require('cors');
const axios = require('axios');
const path = require('path');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../')));

// MongoDB Connection
const connectDB = async () => {
    try {
        // Replace with your MongoDB Atlas connection string
        // We'll use environment variables for security
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medigrow');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

// Import routes
const plantRoutes = require('./routes/plants');
const userRoutes = require('./routes/users');
const postRoutes = require('./routes/posts');

// Routes
// Home route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to MediGrow API' });
});

// Use route files
app.use('/api/plants', plantRoutes);
app.use('/api/users', userRoutes);
app.use('/api/posts', postRoutes);

// Plant API proxy route
app.post('/api/identify-plant', async (req, res) => {
    try {
        const { image } = req.body;

        // In a real implementation, you would:
        // 1. Process the image data
        // 2. Call the Plant.id API
        // 3. Return the results

        // For now, we'll return a mock response
        const randomIndex = Math.floor(Math.random() * 12) + 1; // Assuming we have 12 plants

        res.json({
            success: true,
            plantId: randomIndex
        });
    } catch (error) {
        console.error('Plant identification error:', error);
        res.status(500).json({ success: false, error: 'Failed to identify plant' });
    }
});

// Weather API proxy route
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
        }

        // In a real implementation, you would call the weather API
        // For now, we'll return mock data
        res.json({
            success: true,
            weather: {
                temp: Math.floor(Math.random() * 30) + 10, // Random temperature between 10-40°C
                condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
                humidity: Math.floor(Math.random() * 60) + 30, // Random humidity between 30-90%
                wind: Math.floor(Math.random() * 20) + 1 // Random wind speed between 1-20 km/h
            }
        });
    } catch (error) {
        console.error('Weather API error:', error);
        res.status(500).json({ success: false, error: 'Failed to fetch weather data' });
    }
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
connectDB().then(() => {
    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
    });
});