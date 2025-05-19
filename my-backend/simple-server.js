const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/medigrow')
    .then(() => console.log('MongoDB Connected'))
    .catch(err => console.error('MongoDB Connection Error:', err));

// Plant Schema
const PlantSchema = new mongoose.Schema({
    name: String,
    scientificName: String,
    image: String,
    benefits: [String],
    difficulty: String,
    description: String,
    medicinalUses: String,
    growingInfo: String,
    careTips: [String]
});

const Plant = mongoose.model('Plant', PlantSchema);

// Routes
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to MediGrow API' });
});

// Get all plants
app.get('/api/plants', async (req, res) => {
    try {
        const plants = await Plant.find();
        res.json(plants);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Get plant by ID
app.get('/api/plants/:id', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);
        if (!plant) {
            return res.status(404).json({ error: 'Plant not found' });
        }
        res.json(plant);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Server error' });
    }
});

// Plant identification mock
app.post('/api/identify-plant', (req, res) => {
    const randomId = Math.floor(Math.random() * 6) + 1;
    res.json({ success: true, plantId: randomId });
});

// Weather API mock
app.get('/api/weather', (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({ error: 'Latitude and longitude are required' });
    }

    res.json({
        success: true,
        weather: {
            temp: Math.floor(Math.random() * 30) + 10,
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 60) + 30,
            wind: Math.floor(Math.random() * 20) + 1
        }
    });
});

// Sample plant data
const medicinalPlants = [
    {
        name: "Aloe Vera",
        scientificName: "Aloe barbadensis miller",
        image: "https://i.pinimg.com/736x/70/9c/6a/709c6adf444b9c71cbbc87b2abe79566.jpg",
        benefits: ["skin", "digestive", "immune"],
        difficulty: "easy",
        description: "Aloe vera is a succulent plant species that has been used for centuries for its medicinal properties.",
        medicinalUses: "The gel is commonly used to treat burns, sunburns, cuts, and skin irritations.",
        growingInfo: "Aloe vera thrives in well-draining soil and bright, indirect sunlight.",
        careTips: [
            "Use a cactus or succulent potting mix",
            "Water every 2-3 weeks, less in winter",
            "Fertilize sparingly with a balanced fertilizer in spring",
            "Repot when the plant becomes root-bound"
        ]
    },
    {
        name: "Peppermint",
        scientificName: "Mentha × piperita",
        image: "https://i.pinimg.com/474x/c4/e0/e7/c4e0e7e933b30e078da3138f332b0be7.jpg",
        benefits: ["digestive", "respiratory", "stress"],
        difficulty: "easy",
        description: "Peppermint is a hybrid mint plant that is a cross between watermint and spearmint.",
        medicinalUses: "Peppermint is excellent for relieving digestive issues like indigestion, nausea, and IBS.",
        growingInfo: "Peppermint grows best in moist, well-drained soil and partial shade.",
        careTips: [
            "Plant in containers to control spreading",
            "Keep soil consistently moist",
            "Harvest leaves as needed, preferably in the morning",
            "Cut back to ground level in autumn"
        ]
    }
];

// Seed database if empty
const seedDatabase = async () => {
    const count = await Plant.countDocuments();
    if (count === 0) {
        await Plant.insertMany(medicinalPlants);
        console.log('Database seeded with sample plants');
    }
};

// Start server
app.listen(PORT, async () => {
    console.log(`Server running on port ${PORT}`);
    try {
        await seedDatabase();
    } catch (err) {
        console.error('Error seeding database:', err);
    }
});