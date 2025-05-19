const http = require('http');
const url = require('url');
const path = require('path');
const fs = require('fs');
const crypto = require('crypto');
const https = require('https');
const querystring = require('querystring');
const { Readable } = require('stream');
const FormData = require('form-data');

const PORT = process.env.PORT || 5000;

// File-based storage for persistence
const DATA_FILE = path.join(__dirname, 'users-data.json');

// Load existing data or initialize empty data
let userData = { users: [], tokens: {} };
try {
    if (fs.existsSync(DATA_FILE)) {
        const data = fs.readFileSync(DATA_FILE, 'utf8');
        userData = JSON.parse(data);
    } else {
        // Create the file if it doesn't exist
        fs.writeFileSync(DATA_FILE, JSON.stringify(userData, null, 2));
    }
} catch (error) {
    console.error('Error loading user data:', error);
}

// Extract users and tokens from loaded data
let users = userData.users;
let tokens = userData.tokens;

// Function to save data to file
function saveUserData() {
    try {
        fs.writeFileSync(DATA_FILE, JSON.stringify({ users, tokens }, null, 2));
    } catch (error) {
        console.error('Error saving user data:', error);
    }
}

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

// Helper functions
function generateToken() {
    return crypto.randomBytes(32).toString('hex');
}

function hashPassword(password) {
    return crypto.createHash('sha256').update(password).digest('hex');
}

function parseRequestBody(req) {
    return new Promise((resolve, reject) => {
        let body = '';
        req.on('data', chunk => {
            body += chunk.toString();
        });
        req.on('end', () => {
            try {
                // Check if the body is empty
                if (!body.trim()) {
                    resolve({});
                    return;
                }

                // Try to parse as JSON
                try {
                    resolve(JSON.parse(body));
                } catch (e) {
                    // If it's not valid JSON, just return the raw body
                    // This handles FormData and other non-JSON content
                    resolve({ rawData: body });
                }
            } catch (error) {
                reject(error);
            }
        });
        req.on('error', (error) => {
            reject(error);
        });
    });
}

function authenticateToken(req) {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) return null;

    // Check if token exists and is valid
    for (const userId in tokens) {
        if (tokens[userId] === token) {
            return userId;
        }
    }

    return null;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
    // Set CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

    // Handle OPTIONS request for CORS preflight
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    // Parse URL
    const parsedUrl = url.parse(req.url, true);
    const pathname = parsedUrl.pathname;

    // Authentication routes
    if (pathname === '/api/auth/register' && req.method === 'POST') {
        try {
            const data = await parseRequestBody(req);

            // Validate input
            if (!data.username || !data.password || !data.email) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Username, password, and email are required'
                }));
                return;
            }

            // Check if username already exists
            if (users.some(user => user.username === data.username)) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Username already exists'
                }));
                return;
            }

            // Create new user
            const newUser = {
                id: Date.now().toString(),
                username: data.username,
                email: data.email,
                password: hashPassword(data.password),
                favorites: []
            };

            users.push(newUser);

            // Generate token
            const token = generateToken();
            tokens[newUser.id] = token;

            // Save to file
            saveUserData();

            res.writeHead(201, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'User registered successfully',
                token,
                user: {
                    id: newUser.id,
                    username: newUser.username,
                    email: newUser.email
                }
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Server error',
                error: error.message
            }));
        }
    }
    else if (pathname === '/api/auth/login' && req.method === 'POST') {
        try {
            const data = await parseRequestBody(req);

            // Validate input
            if (!data.username || !data.password) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Username and password are required'
                }));
                return;
            }

            // Find user
            const user = users.find(u =>
                u.username === data.username &&
                u.password === hashPassword(data.password)
            );

            if (!user) {
                res.writeHead(401, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Invalid username or password'
                }));
                return;
            }

            // Generate token
            const token = generateToken();
            tokens[user.id] = token;

            // Save to file
            saveUserData();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Login successful',
                token,
                user: {
                    id: user.id,
                    username: user.username,
                    email: user.email
                }
            }));
        } catch (error) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Server error',
                error: error.message
            }));
        }
    }
    else if (pathname === '/api/auth/logout' && req.method === 'POST') {
        const userId = authenticateToken(req);

        if (userId) {
            // Remove token
            delete tokens[userId];

            // Save to file
            saveUserData();

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                message: 'Logout successful'
            }));
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }));
        }
    }
    else if (pathname === '/api/user/profile' && req.method === 'GET') {
        const userId = authenticateToken(req);

        if (userId) {
            const user = users.find(u => u.id === userId);

            if (user) {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    user: {
                        id: user.id,
                        username: user.username,
                        email: user.email,
                        favorites: user.favorites
                    }
                }));
            } else {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'User not found'
                }));
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }));
        }
    }
    else if (pathname === '/api/user/favorites' && req.method === 'POST') {
        const userId = authenticateToken(req);

        if (userId) {
            try {
                const data = await parseRequestBody(req);

                if (!data.plantId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Plant ID is required'
                    }));
                    return;
                }

                const user = users.find(u => u.id === userId);

                if (!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'User not found'
                    }));
                    return;
                }

                // Add to favorites if not already there
                if (!user.favorites.includes(data.plantId)) {
                    user.favorites.push(data.plantId);
                    // Save to file
                    saveUserData();
                }

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Plant added to favorites',
                    favorites: user.favorites
                }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Server error',
                    error: error.message
                }));
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }));
        }
    }
    else if (pathname === '/api/user/favorites' && req.method === 'DELETE') {
        const userId = authenticateToken(req);

        if (userId) {
            try {
                const data = await parseRequestBody(req);

                if (!data.plantId) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Plant ID is required'
                    }));
                    return;
                }

                const user = users.find(u => u.id === userId);

                if (!user) {
                    res.writeHead(404, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'User not found'
                    }));
                    return;
                }

                // Remove from favorites
                user.favorites = user.favorites.filter(id => id !== data.plantId);
                // Save to file
                saveUserData();

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    message: 'Plant removed from favorites',
                    favorites: user.favorites
                }));
            } catch (error) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Server error',
                    error: error.message
                }));
            }
        } else {
            res.writeHead(401, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Unauthorized'
            }));
        }
    }
    // API routes
    else if (pathname === '/api') {
        // Home route
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: 'Welcome to MediGrow API' }));
    }
    else if (pathname === '/api/plants') {
        // Get all plants
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(medicinalPlants));
    }
    else if (pathname === '/api/plants/search') {
        // Search plants by name (scientific or common)
        const url = new URL(req.url, `http://${req.headers.host}`);
        const searchName = url.searchParams.get('name');

        if (!searchName) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Search name parameter is required' }));
            return;
        }

        // Search for plants that match the name (case insensitive)
        const searchNameLower = searchName.toLowerCase();
        const matchingPlants = medicinalPlants.filter(plant =>
            plant.name.toLowerCase().includes(searchNameLower) ||
            plant.scientificName.toLowerCase().includes(searchNameLower)
        );

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(matchingPlants));
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
        try {
            // In a real app, we would process the uploaded image here
            // and use a plant identification API to identify the plant

            // For now, we'll implement a more sophisticated mock
            // that simulates analyzing the image and returning results

            // Parse the form data to extract the image
            const formData = await parseRequestBody(req);

            // Simulate processing time (1-2 seconds)
            await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));

            // Select a random plant from our database
            const randomIndex = Math.floor(Math.random() * medicinalPlants.length);
            const identifiedPlant = medicinalPlants[randomIndex];

            // Create a response with confidence score and plant details
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                plantId: identifiedPlant.id,
                confidence: Math.floor(75 + Math.random() * 25), // Random confidence between 75-99%
                plantDetails: {
                    name: identifiedPlant.name,
                    scientificName: identifiedPlant.scientificName,
                    thumbnail: identifiedPlant.image
                },
                message: `Identified as ${identifiedPlant.name} with high confidence.`
            }));
        } catch (error) {
            console.error('Error in plant identification:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Error processing plant image',
                error: error.message
            }));
        }
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
    // Pl@ntNet API proxy endpoint
    else if (pathname === '/api/identify-plant' && req.method === 'POST') {
        try {
            console.log('Plant identification proxy request received');

            // Get the content type and content length
            const contentType = req.headers['content-type'] || '';

            // Check if it's a multipart form
            if (!contentType.includes('multipart/form-data')) {
                res.writeHead(400, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Content-Type must be multipart/form-data'
                }));
                return;
            }

            // Create a buffer to store the request body
            let requestBody = [];

            req.on('data', (chunk) => {
                requestBody.push(chunk);
            });

            req.on('end', () => {
                try {
                    const bodyBuffer = Buffer.concat(requestBody);

                    // Create options for the HTTPS request to Pl@ntNet API
                    const apiKey = '2b106ZwUkVuOdbzZOv5otkSSou'; // Your Pl@ntNet API key
                    const apiUrl = new URL('https://my-api.plantnet.org/v2/identify/all');
                    apiUrl.searchParams.append('api-key', apiKey);

                    const options = {
                        method: 'POST',
                        headers: {
                            'Content-Type': contentType,
                            'Content-Length': bodyBuffer.length
                        }
                    };

                    console.log('Forwarding request to Pl@ntNet API:', apiUrl.toString());

                    // For testing, return a mock response in the format expected by the frontend
                    // This simulates what the Pl@ntNet API would return
                    const mockResponse = {
                        results: [
                            {
                                score: 0.95,
                                species: {
                                    scientificNameWithoutAuthor: "Mentha × piperita",
                                    scientificName: "Mentha × piperita L.",
                                    commonNames: ["Peppermint", "Mint"],
                                    family: {
                                        scientificName: "Lamiaceae"
                                    },
                                    genus: {
                                        scientificNameWithoutAuthor: "Mentha"
                                    }
                                },
                                images: [
                                    {
                                        url: {
                                            o: "https://i.pinimg.com/474x/c4/e0/e7/c4e0e7e933b30e078da3138f332b0be7.jpg"
                                        }
                                    }
                                ]
                            }
                        ],
                        language: "en",
                        version: "2023-07-05"
                    };

                    console.log('Returning mock Pl@ntNet API response');
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(mockResponse));

                    // Comment out the actual API call for now
                    /*
                    const apiReq = https.request(apiUrl, options, (apiRes) => {
                        console.log('Pl@ntNet API response status:', apiRes.statusCode);

                        let responseData = [];

                        apiRes.on('data', (chunk) => {
                            responseData.push(chunk);
                        });

                        apiRes.on('end', () => {
                            try {
                                const responseBody = Buffer.concat(responseData).toString();
                                console.log('Pl@ntNet API response received');

                                // Set response headers
                                res.writeHead(apiRes.statusCode, { 'Content-Type': 'application/json' });
                                res.end(responseBody);
                            } catch (error) {
                                console.error('Error processing API response:', error);
                                res.writeHead(500, { 'Content-Type': 'application/json' });
                                res.end(JSON.stringify({
                                    success: false,
                                    message: 'Error processing API response',
                                    error: error.message
                                }));
                            }
                        });
                    });
                    */

                    // This code is commented out since we're using the mock response
                    /*
                    apiReq.on('error', (error) => {
                        console.error('Error making API request:', error);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify({
                            success: false,
                            message: 'Error making API request',
                            error: error.message
                        }));
                    });

                    // Write the request body to the API request
                    apiReq.write(bodyBuffer);
                    apiReq.end();
                    */

                } catch (error) {
                    console.error('Error processing request:', error);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({
                        success: false,
                        message: 'Error processing request',
                        error: error.message
                    }));
                }
            });

            req.on('error', (error) => {
                console.error('Error receiving request data:', error);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: false,
                    message: 'Error receiving request data',
                    error: error.message
                }));
            });

        } catch (error) {
            console.error('Unexpected error:', error);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: false,
                message: 'Unexpected error',
                error: error.message
            }));
        }
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
    console.log(`Auth server running on port ${PORT}`);
});