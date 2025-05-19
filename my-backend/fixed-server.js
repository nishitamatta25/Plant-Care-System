const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the frontend
app.use(express.static(path.join(__dirname, '../')));

// Sample plant data
const medicinalPlants = [
    {
        id: "1",
        name: "Aloe Vera",
        scientificName: "Aloe barbadensis miller",
        image: "https://i.pinimg.com/736x/70/9c/6a/709c6adf444b9c71cbbc87b2abe79566.jpg",
        benefits: ["skin", "digestive", "immune"],
        difficulty: "easy",
        description: "Aloe vera is a succulent plant species that has been used for centuries for its medicinal properties. The gel inside its leaves contains compounds with anti-inflammatory, antibacterial, and wound-healing properties.",
        medicinalUses: "The gel is commonly used to treat burns, sunburns, cuts, and skin irritations. When taken internally, it may help with digestive issues like heartburn and irritable bowel syndrome.",
        growingInfo: "Aloe vera thrives in well-draining soil and bright, indirect sunlight. Water deeply but infrequently, allowing the soil to dry completely between waterings. Protect from frost and temperatures below 50°F (10°C).",
        careTips: [
            "Use a cactus or succulent potting mix",
            "Water every 2-3 weeks, less in winter",
            "Fertilize sparingly with a balanced fertilizer in spring",
            "Repot when the plant becomes root-bound"
        ]
    },
    {
        id: "2",
        name: "Peppermint",
        scientificName: "Mentha × piperita",
        image: "https://i.pinimg.com/474x/c4/e0/e7/c4e0e7e933b30e078da3138f332b0be7.jpg",
        benefits: ["digestive", "respiratory", "stress"],
        difficulty: "easy",
        description: "Peppermint is a hybrid mint plant that is a cross between watermint and spearmint. It's known for its strong aroma and cooling sensation caused by the high menthol content.",
        medicinalUses: "Peppermint is excellent for relieving digestive issues like indigestion, nausea, and IBS. It can also help clear sinuses and relieve tension headaches when inhaled.",
        growingInfo: "Peppermint grows best in moist, well-drained soil and partial shade. It spreads aggressively, so it's often grown in containers to prevent it from taking over the garden.",
        careTips: [
            "Plant in containers to control spreading",
            "Keep soil consistently moist",
            "Harvest leaves as needed, preferably in the morning",
            "Cut back to ground level in autumn"
        ]
    },
    {
        id: "3",
        name: "Lavender",
        scientificName: "Lavandula angustifolia",
        image: "https://i.pinimg.com/474x/ae/e2/1b/aee21b7746300f31f7f2e1361c4a8de7.jpg",
        benefits: ["stress", "skin", "pain"],
        difficulty: "medium",
        description: "Lavender is a fragrant herb known for its beautiful purple flowers and calming properties. It's native to the Mediterranean but grows well in many climates.",
        medicinalUses: "Lavender is widely used for its calming and relaxing effects. It can help with anxiety, insomnia, and stress. The oil has antiseptic and anti-inflammatory properties useful for minor burns and insect bites.",
        growingInfo: "Lavender requires full sun and well-drained, slightly alkaline soil. It's drought-tolerant once established and doesn't like to be overwatered.",
        careTips: [
            "Plant in a sunny location with good air circulation",
            "Water deeply but infrequently",
            "Prune back by one-third in early spring",
            "Harvest flowers just as they begin to open"
        ]
    },
    {
        id: "4",
        name: "Echinacea",
        scientificName: "Echinacea purpurea",
        image: "https://i.pinimg.com/474x/8e/f2/e0/8ef2e0f80e2551eb8dccef417f4f13b1.jpg",
        benefits: ["immune", "respiratory", "pain"],
        difficulty: "easy",
        description: "Echinacea, also known as purple coneflower, is a popular herb for immune support. It's native to North America and produces beautiful daisy-like flowers.",
        medicinalUses: "Echinacea is commonly used to prevent and treat colds and flu. It may help reduce the duration and severity of upper respiratory infections.",
        growingInfo: "Echinacea thrives in full sun to partial shade and well-drained soil. It's drought-tolerant and attracts pollinators like bees and butterflies.",
        careTips: [
            "Plant in spring or fall",
            "Space plants 1-3 feet apart",
            "Deadhead flowers to encourage more blooms",
            "Divide clumps every 3-4 years"
        ]
    },
    {
        id: "5",
        name: "Chamomile",
        scientificName: "Matricaria chamomilla",
        image: "https://i.pinimg.com/474x/69/81/e9/6981e95e8bc63d538be17249ec388c95.jpg",
        benefits: ["stress", "digestive", "skin"],
        difficulty: "easy",
        description: "Chamomile is a daisy-like herb known for its calming properties and apple-like fragrance. There are two main types: German and Roman chamomile.",
        medicinalUses: "Chamomile tea is famous for promoting relaxation and sleep. It also helps with digestive issues like indigestion and colic. Topically, it can soothe skin irritations.",
        growingInfo: "Chamomile grows best in full sun and well-drained soil. It's an annual but often self-seeds. German chamomile grows upright, while Roman chamomile is a low-growing perennial.",
        careTips: [
            "Sow seeds directly in the garden after last frost",
            "Thin seedlings to 6-8 inches apart",
            "Harvest flowers when fully open",
            "Dry flowers in a dark, well-ventilated area"
        ]
    },
    {
        id: "6",
        name: "Ginger",
        scientificName: "Zingiber officinale",
        image: "https://i.pinimg.com/474x/d2/71/44/d27144debe46bbcff7451bd65c8776f2.jpg",
        benefits: ["digestive", "pain", "immune"],
        difficulty: "medium",
        description: "Ginger is a tropical plant grown for its aromatic, spicy rhizomes. It's been used for thousands of years in both cooking and medicine.",
        medicinalUses: "Ginger is excellent for nausea, including motion sickness and morning sickness. It has anti-inflammatory properties that may help with arthritis and muscle pain.",
        growingInfo: "Ginger requires warm temperatures, high humidity, and rich, moist soil. In cooler climates, it can be grown in containers indoors.",
        careTips: [
            "Start with fresh rhizomes from a garden center",
            "Plant in partial shade in warm climates",
            "Keep soil consistently moist but not soggy",
            "Harvest after 8-10 months when leaves yellow"
        ]
    }
];

// Routes
// Home route
app.get('/api', (req, res) => {
    res.json({ message: 'Welcome to MediGrow API' });
});

// Get all plants
app.get('/api/plants', (req, res) => {
    res.json(medicinalPlants);
});

// Filter plants - IMPORTANT: This must come BEFORE the :id route
app.get('/api/plants/filter', (req, res) => {
    const { benefit, difficulty } = req.query;
    let filteredPlants = [...medicinalPlants];

    if (benefit) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.benefits.includes(benefit)
        );
    }

    if (difficulty) {
        filteredPlants = filteredPlants.filter(plant =>
            plant.difficulty === difficulty
        );
    }

    res.json(filteredPlants);
});

// Get plant by ID - This must come AFTER the filter route
app.get('/api/plants/:id', (req, res) => {
    const plant = medicinalPlants.find(p => p.id === req.params.id);

    if (!plant) {
        return res.status(404).json({ error: 'Plant not found' });
    }

    res.json(plant);
});

// Plant identification mock
app.post('/api/identify-plant', (req, res) => {
    // Return a random plant ID
    const randomIndex = Math.floor(Math.random() * medicinalPlants.length);
    const randomPlant = medicinalPlants[randomIndex];

    res.json({
        success: true,
        plantId: randomPlant.id
    });
});

// Weather API mock
app.get('/api/weather', (req, res) => {
    const { lat, lon } = req.query;

    if (!lat || !lon) {
        return res.status(400).json({
            success: false,
            error: 'Latitude and longitude are required'
        });
    }

    res.json({
        success: true,
        weather: {
            temp: Math.floor(Math.random() * 30) + 10, // Random temperature between 10-40°C
            condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
            humidity: Math.floor(Math.random() * 60) + 30, // Random humidity between 30-90%
            wind: Math.floor(Math.random() * 20) + 1 // Random wind speed between 1-20 km/h
        }
    });
});

// Catch-all route to serve the frontend
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../index.html'));
});

// Start server
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});