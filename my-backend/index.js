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

const multer = require('multer');
const FormData = require('form-data');
const upload = multer({ storage: multer.memoryStorage() });

// Plant API proxy route
app.post('/api/identify-plant', upload.single('images'), async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, error: 'No image file uploaded' });
        }

        const plantApiKey = process.env.PLANT_API_KEY;
        if (!plantApiKey || plantApiKey === 'your_plant_id_api_key') {
             console.error('Missing PlantNet API Key in .env');
             return res.status(500).json({ success: false, error: 'Server Missing API Key' });
        }

        const formData = new FormData();
        formData.append('images', req.file.buffer, {
            filename: req.file.originalname || 'image.jpg',
            contentType: req.file.mimetype || 'image/jpeg'
        });

        const url = `https://my-api.plantnet.org/v2/identify/all?api-key=${plantApiKey}`;

        const https = require('https');
        const response = await axios.post(url, formData, {
            headers: {
                ...formData.getHeaders()
            },
            httpsAgent: new https.Agent({ rejectUnauthorized: false }) // Bypass local strict SSL/Antivirus interception
        });

        res.json(response.data);
    } catch (error) {
        console.error('Plant identification proxy error:', error.response?.data || error.message);
        
        if (error.response) {
            res.status(error.response.status).json(error.response.data);
        } else {
            // Include the exact axios error message in the fallback response so we can see why it failed locally
            res.status(500).json({ success: false, error: 'Failed to identify plant', details: error.message });
        }
    }
});

// Weather API proxy route
app.get('/api/weather', async (req, res) => {
    try {
        const { lat, lon } = req.query;

        if (!lat || !lon) {
            return res.status(400).json({ success: false, error: 'Latitude and longitude are required' });
        }

        const weatherApiKey = process.env.WEATHER_API_KEY;
        if (!weatherApiKey || weatherApiKey === 'your_weather_api_key') {
            return res.status(500).json({ success: false, error: 'Server Missing Weather API Key' });
        }

        // Call OpenWeatherMap API using imperial units to get Fahrenheit (since frontend expects Fahrenheit)
        const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${weatherApiKey}&units=imperial`;
        
        const response = await axios.get(url);
        const data = response.data;

        // Map OpenWeatherMap condition to match frontend expectations
        let condition = data.weather[0].main;
        if (condition === 'Clear') condition = 'Sunny';
        else if (condition === 'Clouds') {
            if (data.weather[0].description === 'few clouds') condition = 'Partly Cloudy';
            else condition = 'Cloudy';
        }

        res.json({
            success: true,
            weather: {
                temp: Math.round(data.main.temp),
                condition: condition,
                humidity: data.main.humidity,
                wind: Math.round(data.wind.speed) // wind speed in mph
            }
        });
    } catch (error) {
        console.error('Weather API error:', error.response?.data || error.message);
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