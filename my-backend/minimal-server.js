const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');

const PORT = process.env.PORT || 5000;

// Sample plant data
const medicinalPlants = [
    {
        id: "1",
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
        id: "2",
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
    },
    {
        id: "3",
        name: "Lavender",
        scientificName: "Lavandula angustifolia",
        image: "https://i.pinimg.com/474x/ae/e2/1b/aee21b7746300f31f7f2e1361c4a8de7.jpg",
        benefits: ["stress", "skin", "pain"],
        difficulty: "medium",
        description: "Lavender is a fragrant herb known for its beautiful purple flowers and calming properties.",
        medicinalUses: "Lavender is widely used for its calming and relaxing effects.",
        growingInfo: "Lavender requires full sun and well-drained, slightly alkaline soil.",
        careTips: [
            "Plant in a sunny location with good air circulation",
            "Water deeply but infrequently",
            "Prune back by one-third in early spring",
            "Harvest flowers just as they begin to open"
        ]
    }
];

// Create HTTP server
const server = http.createServer((req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // API routes
    if (pathname === '/api') {
        // Home route
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Welcome to MediGrow API' }));
    }
    else if (pathname === '/api/plants') {
        // Get all plants
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(medicinalPlants));
    }
    else if (pathname.match(/^\/api\/plants\/\d+$/)) {
        // Get plant by ID
        const id = pathname.split('/').pop();
        const plant = medicinalPlants.find(p => p.id === id);

        if (plant) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(plant));
        } else {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Plant not found' }));
        }
    }
    else if (pathname === '/api/identify-plant' && req.method === 'POST') {
        // Plant identification mock
        const randomIndex = Math.floor(Math.random() * medicinalPlants.length);
        const randomPlant = medicinalPlants[randomIndex];

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            plantId: randomPlant.id
        }));
    }
    else if (pathname === '/api/weather') {
        // Weather API mock
        const { lat, lon } = parsedUrl.query;

        if (!lat || !lon) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                error: 'Latitude and longitude are required'
            }));
            return;
        }

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            success: true,
            weather: {
                temp: Math.floor(Math.random() * 30) + 10,
                condition: ['Sunny', 'Cloudy', 'Rainy', 'Partly Cloudy'][Math.floor(Math.random() * 4)],
                humidity: Math.floor(Math.random() * 60) + 30,
                wind: Math.floor(Math.random() * 20) + 1
            }
        }));
    }
    else {
        // Try to serve static files from the frontend directory
        const filePath = path.join(__dirname, '..', pathname === '/' ? 'index.html' : pathname);

        fs.readFile(filePath, (err, data) => {
            if (err) {
                // File not found, return 404
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: 'Not found' }));
                return;
            }

            // Determine content type based on file extension
            let contentType = 'text/html';
            const ext = path.extname(filePath);

            switch (ext) {
                case '.js':
                    contentType = 'text/javascript';
                    break;
                case '.css':
                    contentType = 'text/css';
                    break;
                case '.json':
                    contentType = 'application/json';
                    break;
                case '.png':
                    contentType = 'image/png';
                    break;
                case '.jpg':
                case '.jpeg':
                    contentType = 'image/jpeg';
                    break;
            }

            // Serve the file
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(data);
        });
    }
});

// Start server
server.listen(PORT, () => {
    console.log(`Minimal server running on port ${PORT}`);
});