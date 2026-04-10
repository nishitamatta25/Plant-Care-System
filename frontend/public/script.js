// Pl@ntNet API configuration
const PLANT_API_KEY = '2b106ZwUkVuOdbzZOv5otkSSou'; // Your Pl@ntNet API key
const PLANT_API_URL = 'https://my-api.plantnet.org/v2/identify/all';

// Add console logs to help debug
console.log('Script loaded with Pl@ntNet API key:', PLANT_API_KEY);

// Wait for DOM to be fully loaded before accessing elements
document.addEventListener('DOMContentLoaded', function () {
    console.log('DOM fully loaded');

    // Check if all critical elements exist
    console.log('Scanner video element exists:', !!document.getElementById('scannerVideo'));
    console.log('Start scanner button exists:', !!document.getElementById('startScanner'));
    console.log('Capture image button exists:', !!document.getElementById('captureImage'));
    console.log('Upload button exists:', !!document.getElementById('uploadBtn'));
});
const WEATHER_API_KEY = 'YOUR_WEATHER_API_KEY'; // R2b106ZwUkVuOdbzZOv5otkSSou'; // OpenWeatherMap API key

// DOM Elements
const scannerVideo = document.getElementById('scannerVideo');
const scannerCanvas = document.getElementById('scannerCanvas');
const startScannerBtn = document.getElementById('startScanner');
const captureImageBtn = document.getElementById('captureImage');
const uploadBtn = document.getElementById('uploadBtn');
const uploadImage = document.getElementById('uploadImage');
const resultsBox = document.getElementById('resultsBox');
const plantResults = document.getElementById('plantResults');
const placeholderContent = document.querySelector('.placeholder-content');
const scanStatus = document.querySelector('.scan-status');
const loadingSpinner = document.getElementById('loadingSpinner');
const plantsGrid = document.getElementById('plantsGrid');
const plantSearch = document.getElementById('plantSearch');
const benefitFilter = document.getElementById('benefitFilter');
const difficultyFilter = document.getElementById('difficultyFilter');
const loadMorePlants = document.getElementById('loadMorePlants');
const getLocationBtn = document.getElementById('getLocation');
const weatherInfo = document.getElementById('weatherInfo');
const weatherPlants = document.getElementById('weatherPlants');
const seasonalTips = document.getElementById('seasonalTips');
const tabButtons = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');
const mobileMenuBtn = document.querySelector('.mobile-menu-btn');
const mainNav = document.querySelector('.main-nav');
const plantModal = document.getElementById('plantModal');
const modalPlantContent = document.getElementById('modalPlantContent');
const modalClose = document.querySelector('.modal-close');

// Variables
let stream = null;
let videoStream = null;
let isScanning = false;
let displayedPlants = 6;
let allPlants = [];
let currentLocation = null;

// Sample Plant Data (in a real app, this would come from a database)
const medicinalPlants = [
    {
        id: 1,
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
        id: 2,
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
        id: 3,
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
        id: 4,
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
        id: 5,
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
        id: 6,
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
    },
    {
        id: 7,
        name: "Turmeric",
        scientificName: "Curcuma longa",
        image: "https://i.pinimg.com/474x/03/57/1d/03571d155ce0e324723d4282ca592b86.jpg",
        benefits: ["immune", "pain", "digestive"],
        difficulty: "medium",
        description: "Turmeric is a bright yellow-orange rhizome in the ginger family. It's the spice that gives curry its color and has powerful anti-inflammatory properties.",
        medicinalUses: "Turmeric contains curcumin, which has strong anti-inflammatory and antioxidant effects. It may help with arthritis, digestive issues, and may boost immune function.",
        growingInfo: "Turmeric requires a long, warm growing season (8-10 months). It thrives in rich, well-drained soil with consistent moisture and partial shade.",
        careTips: [
            "Start with organic rhizomes from a garden center",
            "Plant after last frost when soil is warm",
            "Water regularly to keep soil moist",
            "Harvest when leaves turn yellow and die back"
        ]
    },
    {
        id: 8,
        name: "Holy Basil (Tulsi)",
        scientificName: "Ocimum tenuiflorum",
        image: "https://i.pinimg.com/474x/b6/71/c6/b671c62b04ba30a6805ad1662ef9c843.jpg",
        benefits: ["stress", "immune", "respiratory"],
        difficulty: "easy",
        description: "Holy basil, or tulsi, is a sacred herb in Ayurvedic medicine. It has a spicy, clove-like aroma and is considered an adaptogen that helps the body cope with stress.",
        medicinalUses: "Holy basil helps reduce stress and anxiety, boosts immunity, and may help regulate blood sugar. It's also used for respiratory conditions and as an anti-inflammatory.",
        growingInfo: "Holy basil grows well in full sun and rich, well-drained soil. It's an annual in cooler climates but can be perennial in tropical areas.",
        careTips: [
            "Start seeds indoors 6 weeks before last frost",
            "Pinch back to encourage bushiness",
            "Harvest leaves as needed",
            "Can be grown indoors in winter"
        ]
    },
    {
        id: 9,
        name: "Calendula",
        scientificName: "Calendula officinalis",
        image: "https://i.pinimg.com/474x/20/0b/75/200b7567f5daa317997e4bc92bba2db5.jpg",
        benefits: ["skin", "immune", "digestive"],
        difficulty: "easy",
        description: "Calendula, or pot marigold, is a cheerful flowering plant with bright orange or yellow blooms. Its petals are edible and have medicinal properties.",
        medicinalUses: "Calendula is excellent for skin health, helping with wounds, burns, and skin irritations. It also has anti-inflammatory and immune-boosting properties when taken internally.",
        growingInfo: "Calendula grows easily in full sun to partial shade and most soil types. It's an annual but often self-seeds. Flowers bloom from spring until frost.",
        careTips: [
            "Sow seeds directly in the garden in spring",
            "Deadhead regularly to promote more blooms",
            "Harvest flowers when fully open",
            "Use fresh or dry for later use"
        ]
    },
    {
        id: 10,
        name: "Lemon Balm",
        scientificName: "Melissa officinalis",
        image: "https://i.pinimg.com/474x/a0/8b/0e/a08b0ef95e1f24882e64c774c3947e12.jpg",
        benefits: ["stress", "digestive", "immune"],
        difficulty: "easy",
        description: "Lemon balm is a lemon-scented member of the mint family. It has a long history of use for calming nerves and promoting relaxation.",
        medicinalUses: "Lemon balm helps reduce anxiety and promote sleep. It may also help with digestive issues and cold sores when applied topically.",
        growingInfo: "Lemon balm grows in full sun to partial shade and most soil types. Like other mints, it can spread aggressively, so container growing is recommended.",
        careTips: [
            "Plant in containers to control spreading",
            "Harvest leaves before flowering for best flavor",
            "Cut back hard if it becomes leggy",
            "Can be grown indoors near a sunny window"
        ]
    },
    {
        id: 11,
        name: "Feverfew",
        scientificName: "Tanacetum parthenium",
        image: "https://i.pinimg.com/474x/80/76/bf/8076bf26eb157030cd03751c2fbacee1.jpg",
        benefits: ["pain", "stress", "digestive"],
        difficulty: "medium",
        description: "Feverfew is a daisy-like herb traditionally used to reduce fevers and prevent migraines. It has small white flowers with yellow centers.",
        medicinalUses: "Feverfew is most famous for preventing migraines when taken regularly. It may also help with arthritis pain and reduce inflammation.",
        growingInfo: "Feverfew grows in full sun to partial shade and well-drained soil. It's a perennial in mild climates but often grown as an annual.",
        careTips: [
            "Start seeds indoors 6-8 weeks before last frost",
            "Space plants 12-15 inches apart",
            "Deadhead to prolong blooming",
            "Leaves can be bitter; dry for tea"
        ]
    },
    {
        id: 12,
        name: "Thyme",
        scientificName: "Thymus vulgaris",
        image: " https://i.pinimg.com/474x/4a/06/18/4a06187b062538fcb6225a0fc1bdad23.jpg",
        benefits: ["respiratory", "immune", "digestive"],
        difficulty: "easy",
        description: "Thyme is a fragrant Mediterranean herb with small leaves and a strong flavor. It contains thymol, a compound with powerful antiseptic properties.",
        medicinalUses: "Thyme is excellent for respiratory infections, coughs, and sore throats. It also has antimicrobial properties and may help with digestive issues.",
        growingInfo: "Thyme thrives in full sun and well-drained, slightly alkaline soil. It's drought-tolerant once established and makes an excellent ground cover.",
        careTips: [
            "Plant in a sunny location with good drainage",
            "Water sparingly once established",
            "Prune back in spring to maintain shape",
            "Harvest as needed, best before flowering"
        ]
    }
];

// Initialize the application
function initApp() {
    console.log('Initializing app...');
    initScanner();
    loadPlants();
    setupEventListeners();
    getSeasonalTips();
    console.log('App initialization complete');
}

// Initialize the scanner
function initScanner() {
    console.log('Setting up scanner buttons...');
    if (!startScannerBtn) {
        console.error('startScannerBtn not found!');
    } else {
        startScannerBtn.addEventListener('click', toggleScanner);
        console.log('Start scanner button listener added');
    }

    if (!captureImageBtn) {
        console.error('captureImageBtn not found!');
    } else {
        captureImageBtn.addEventListener('click', captureImage);
        console.log('Capture image button listener added');
    }

    if (!uploadBtn) {
        console.error('uploadBtn not found!');
    } else {
        uploadBtn.addEventListener('click', () => {
            console.log('Upload button clicked');
            uploadImage.click();
        });
        console.log('Upload button listener added');
    }

    if (!uploadImage) {
        console.error('uploadImage not found!');
    } else {
        uploadImage.addEventListener('change', handleImageUpload);
        console.log('Upload image change listener added');
    }
}

// Toggle scanner
async function toggleScanner() {
    console.log('Toggle scanner called');
    if (stream) {
        console.log('Stream exists, stopping scanner');
        stopScanner();
    } else {
        console.log('No stream, starting scanner');
        await startScanner();
    }
}

// Start scanner
async function startScanner() {
    console.log('Starting scanner...');
    try {
        updateStatus('Starting camera...', 'info');

        console.log('Requesting camera access');
        stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            }
        });

        console.log('Camera access granted');
        scannerVideo.srcObject = stream;
        videoStream = stream; // Set the videoStream variable for use in resetScanner
        startScannerBtn.innerHTML = '<i class="fas fa-stop"></i> Stop Scanner';
        captureImageBtn.disabled = false;
        updateStatus('Camera ready. Center plant and click Capture.', 'ready');
        console.log('Scanner started successfully');

    } catch (error) {
        console.error('Camera error:', error);
        updateStatus('Camera access denied. Please enable camera permissions.', 'error');
        startScannerBtn.innerHTML = '<i class="fas fa-camera"></i> Start Scanner';
    }
}

// Stop scanner
function stopScanner() {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
        stream = null;
        videoStream = null;
        scannerVideo.srcObject = null;
    }

    startScannerBtn.innerHTML = '<i class="fas fa-camera"></i> Start Scanner';
    captureImageBtn.disabled = true;
    updateStatus('Scanner stopped', 'info');
}

// Capture image from camera
async function captureImage() {
    if (!stream || isScanning) return;

    isScanning = true;
    showLoading(true);
    updateStatus('Identifying plant...', 'scanning');

    try {
        // Capture frame
        const context = scannerCanvas.getContext('2d');
        scannerCanvas.width = scannerVideo.videoWidth;
        scannerCanvas.height = scannerVideo.videoHeight;
        context.drawImage(scannerVideo, 0, 0, scannerCanvas.width, scannerCanvas.height);

        // Convert to Blob
        const blob = await new Promise(resolve => {
            scannerCanvas.toBlob(resolve, 'image/jpeg', 0.9);
        });

        // Identify plant
        const result = await identifyPlant(blob);
        displayResults(result);

    } catch (error) {
        console.error('Scan error:', error);
        if (error.message === 'No plant detected') {
            updateStatus('No plant recognized in this image. Please try another photo.', 'warning');
            
            // Clear any previous results
            const resultsBox = document.getElementById('resultsBox');
            const plantResults = document.getElementById('plantResults');
            const placeholderContent = document.querySelector('.placeholder-content');
            
            if (plantResults) plantResults.style.display = 'none';
            if (placeholderContent) placeholderContent.style.display = 'block';
        } else {
            updateStatus('Identification failed. Please try again.', 'error');
        }
    } finally {
        isScanning = false;
        showLoading(false);
    }
}

// Handle image upload
async function handleImageUpload(event) {
    if (isScanning) return;

    const file = event.target.files[0];
    if (!file) return;

    isScanning = true;
    showLoading(true);
    updateStatus('Identifying plant...', 'scanning');

    try {
        const result = await identifyPlant(file);
        displayResults(result);
    } catch (error) {
        console.error('Upload error:', error);
        updateStatus('Identification failed. Please try a different image.', 'error');
    } finally {
        isScanning = false;
        showLoading(false);
        event.target.value = ''; // Reset input
    }
}

// Identify plant using Pl@ntNet API
async function identifyPlant(imageData) {
    try {
        updateStatus('Analyzing plant image...', 'scanning');

        // Convert image to blob if it's a data URL
        let imageBlob;
        if (typeof imageData === 'string' && imageData.startsWith('data:')) {
            console.log('Converting data URL to blob');
            const response = await fetch(imageData);
            imageBlob = await response.blob();
        } else {
            console.log('Using provided blob/file:', imageData instanceof Blob ? 'Blob' : 'File');
            imageBlob = imageData;
        }

        console.log('Image blob size:', imageBlob.size, 'bytes, type:', imageBlob.type);

        // Check if the image is valid
        if (!imageBlob || imageBlob.size === 0) {
            throw new Error('Invalid image data');
        }

        updateStatus('Sending to plant identification service...', 'scanning');

        // Create form data for the Pl@ntNet API
        const formData = new FormData();

        // According to Pl@ntNet docs, the parameter name should be 'images'
        formData.append('images', imageBlob, 'plant_image.jpg');

        // Optionally add organ parameter (flower, leaf, fruit, bark, habit)
        // formData.append('organs', 'flower');

        // Change API URL to our backend proxy to avoid CORS
        const apiUrl = `http://localhost:5000/api/identify-plant`;
        console.log('Sending request to Backend Proxy:', apiUrl);
        console.log('FormData contains image:', formData.has('images'));

        // Backend will append the api key seamlessly
        const response = await fetch(apiUrl, {
            method: 'POST',
            body: formData
        });

        console.log('API response status:', response.status);
        console.log('API response headers:', [...response.headers.entries()]);

        if (!response.ok) {
            let errorText = await response.text();
            console.error('API error response text:', errorText);

            try {
                const errorData = JSON.parse(errorText);
                throw new Error(errorData.message || `API error: ${response.status}`);
            } catch (e) {
                throw new Error(`API error: ${response.status} - ${errorText.substring(0, 100)}`);
            }
        }

        // Get the response text first to debug any issues
        const responseText = await response.text();
        console.log('API response text (first 100 chars):', responseText.substring(0, 100));

        // Parse the JSON response
        let apiResult;
        try {
            apiResult = JSON.parse(responseText);
        } catch (e) {
            console.error('Failed to parse API response as JSON:', e);
            throw new Error('Invalid API response format');
        }

        console.log('Pl@ntNet API response:', apiResult);

        // Check if we got valid results
        if (!apiResult.results || apiResult.results.length === 0) {
            console.error('No results found in API response');
            throw new Error('No plants identified in the image');
        }

        updateStatus('Plant identified! Checking our database...', 'scanning');

        // Get the top suggestion
        const topMatch = apiResult.results[0];
        const scientificName = topMatch.species.scientificNameWithoutAuthor;
        const commonName = topMatch.species.commonNames && topMatch.species.commonNames.length > 0
            ? topMatch.species.commonNames[0]
            : scientificName;

        // Try to find this plant in our database
        const dbResponse = await fetch(`http://localhost:5000/api/plants/search?name=${encodeURIComponent(scientificName)}`);
        let inDatabase = false;
        let plantFromDb = null;

        if (dbResponse.ok) {
            const dbResults = await dbResponse.json();
            if (dbResults && dbResults.length > 0) {
                inDatabase = true;
                plantFromDb = dbResults[0];
            }
        }

        // Get images from API result
        const similarImages = [];
        if (topMatch.images && topMatch.images.length > 0) {
            topMatch.images.forEach(img => {
                if (img.url && img.url.o) {
                    similarImages.push({ url: img.url.o });
                }
            });
        }

        // If we found the plant in our database, use that information
        if (inDatabase && plantFromDb) {
            return {
                suggestions: [{
                    plant_name: plantFromDb.name,
                    plant_details: {
                        scientific_name: plantFromDb.scientificName,
                        description: plantFromDb.description,
                        medicinal_uses: plantFromDb.medicinalUses,
                        growing_info: plantFromDb.growingInfo
                    },
                    probability: topMatch.score,
                    similar_images: similarImages.length > 0 ? similarImages : [{ url: plantFromDb.image }],
                    plant_id: plantFromDb.id,
                    in_database: true
                }]
            };
        } else {
            // Plant not in our database, return API results
            // Get description from species info
            let description = "No description available";
            if (topMatch.species.commonNames) {
                description = `${scientificName} (${topMatch.species.commonNames.join(", ")}) is a plant species that has been identified with ${Math.round(topMatch.score * 100)}% confidence.`;
            }

            return {
                suggestions: [{
                    plant_name: commonName,
                    plant_details: {
                        scientific_name: scientificName,
                        description: description,
                        medicinal_uses: "Information not available in our database.",
                        growing_info: "Information not available in our database."
                    },
                    probability: topMatch.score,
                    similar_images: similarImages,
                    in_database: false
                }]
            };
        }
    } catch (error) {
        console.error('API Error:', error);
        console.error('Error details:', error.message);
        console.error('Error stack:', error.stack);
        
        // Handle specific "Not a plant" cases from the API
        if (error.message && error.message.includes('Species not found')) {
            updateStatus('No plant recognized in this image. Please try another photo.', 'warning');
            throw new Error('No plant detected');
        }

        updateStatus('Identification service error. Using fallback...', 'warning');

        // Fallback to mock data for actual network/server errors
        console.log('Falling back to mock data due to error:', error.message);

        // Return a random plant from our sample data
        const randomIndex = Math.floor(Math.random() * medicinalPlants.length);
        const plant = medicinalPlants[randomIndex];

        // Format to match API response structure
        return {
            suggestions: [{
                plant_name: plant.name,
                plant_details: {
                    scientific_name: plant.scientificName,
                    description: plant.description,
                    medicinal_uses: plant.medicinalUses,
                    growing_info: plant.growingInfo
                },
                probability: Math.random() * 0.3 + 0.7, // Random confidence between 0.7 and 1.0
                similar_images: [
                    { url: plant.image }
                ],
                plant_id: plant.id,
                in_database: true,
                is_fallback: true
            }]
        };
    }
}

// Display results
function displayResults(data) {
    if (!data || !data.suggestions || data.suggestions.length === 0) {
        updateStatus('No plant identified. Try a clearer image.', 'error');
        showLoading(false);
        isScanning = false;
        return;
    }

    const bestMatch = data.suggestions[0];
    const probability = Math.round(bestMatch.probability * 100);
    const isFallback = bestMatch.is_fallback;
    const inDatabase = bestMatch.in_database;
    const plantId = bestMatch.plant_id;

    placeholderContent.style.display = 'none';
    plantResults.style.display = 'block';

    // Create status message based on identification result
    let statusMessage = '';
    if (isFallback) {
        statusMessage = '<div class="status-message warning">Using fallback data due to API error</div>';
    } else if (!inDatabase) {
        statusMessage = '<div class="status-message info">Plant identified but not in our medicinal database</div>';
    }

    // Create confidence class based on probability
    const confidenceClass = probability > 80 ? 'high' : probability > 60 ? 'medium' : 'low';

    plantResults.innerHTML = `
        <div class="plant-result">
            <h3>${bestMatch.plant_name}</h3>
            <p class="scientific-name">${bestMatch.plant_details?.scientific_name || 'Scientific name not available'}</p>
            <div class="result-meta">
                <span class="confidence-badge ${confidenceClass}">${probability}% Confidence</span>
                ${statusMessage}
            </div>
            
            ${bestMatch.similar_images?.length ? `
            <div class="plant-images">
                <div class="main-image-container">
                    <img src="${bestMatch.similar_images[0].url}" alt="${bestMatch.plant_name}" class="main-plant-image">
                </div>
            </div>
            ` : ''}
            
            <div class="plant-details">
                ${bestMatch.plant_details?.description ? `
                <div class="detail-section">
                    <h4><i class="fas fa-info-circle"></i> Description</h4>
                    <p>${bestMatch.plant_details.description}</p>
                </div>
                ` : ''}
                
                ${bestMatch.plant_details?.medicinal_uses ? `
                <div class="detail-section">
                    <h4><i class="fas fa-heartbeat"></i> Medicinal Uses</h4>
                    <p>${bestMatch.plant_details.medicinal_uses}</p>
                </div>
                ` : ''}
                
                ${bestMatch.plant_details?.growing_info ? `
                <div class="detail-section">
                    <h4><i class="fas fa-seedling"></i> Growing Information</h4>
                    <p>${bestMatch.plant_details.growing_info}</p>
                </div>
                ` : ''}
            </div>
            
            <div class="result-actions">
                ${inDatabase ? `
                    <button class="btn primary-btn" onclick="showPlantDetails('${plantId}')">
                        <i class="fas fa-info-circle"></i> View Full Details
                    </button>
                    <button class="btn secondary-btn" onclick="addToFavorites('${plantId}')">
                        <i class="far fa-heart"></i> Add to Favorites
                    </button>
                ` : `
                    <button class="btn disabled-btn" disabled>
                        <i class="fas fa-database"></i> Not in Medicinal Database
                    </button>
                `}
                <button class="btn outline-btn" onclick="resetScanner()">
                    <i class="fas fa-redo"></i> Scan Again
                </button>
            </div>
        </div>
    `;

    updateStatus(`Identified as ${bestMatch.plant_name} (${probability}% match)`, 'success');
    showLoading(false);
    isScanning = false;
}

// Update status message
function updateStatus(message, type) {
    scanStatus.textContent = message;
    scanStatus.className = `scan-status ${type}`;

    // Auto-hide success messages after 5 seconds
    if (type === 'success') {
        setTimeout(() => {
            scanStatus.textContent = '';
            scanStatus.className = 'scan-status';
        }, 5000);
    }
}

// Show/hide loading spinner
function showLoading(show) {
    loadingSpinner.style.display = show ? 'block' : 'none';
}

// Reset scanner to initial state
function resetScanner() {
    // Hide results and show placeholder
    plantResults.style.display = 'none';
    placeholderContent.style.display = 'block';

    // Reset status
    updateStatus('Ready to scan. Take a photo or upload an image.', 'ready');

    // Reset any active camera
    if (videoStream) {
        videoStream.getTracks().forEach(track => track.stop());
        videoStream = null;
    }

    // Hide video elements if visible
    if (scannerVideo) {
        scannerVideo.style.display = 'none';
    }
    if (scannerCanvas) {
        scannerCanvas.style.display = 'none';
    }

    isScanning = false;
}

// Add plant to user favorites
async function addToFavorites(plantId) {
    const token = localStorage.getItem('token');

    if (!token) {
        // If not logged in, redirect to auth page
        window.location.hash = '#auth';
        return;
    }

    try {
        const response = await fetch('http://localhost:5000/api/user/favorites', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ plantId })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || `Failed to add to favorites: ${response.status}`);
        }

        const data = await response.json();

        // Show success message
        alert('Plant added to favorites successfully!');

        // If we're in the modal, update the button
        const addFavoriteBtn = document.querySelector('.add-favorite');
        if (addFavoriteBtn) {
            addFavoriteBtn.innerHTML = '<i class="fas fa-check"></i> Added to Favorites';
            addFavoriteBtn.disabled = true;
            addFavoriteBtn.classList.add('success-btn');
            addFavoriteBtn.classList.remove('outline-btn');
        }

    } catch (error) {
        console.error('Error adding to favorites:', error);
        alert(`Failed to add to favorites: ${error.message}`);
    }
}

// Load plants into the library
async function loadPlants() {
    try {
        // Fetch plants from our API
        const response = await fetch('http://localhost:5000/api/plants');

        if (!response.ok) {
            throw new Error(`Failed to fetch plants: ${response.status}`);
        }

        const plants = await response.json();
        allPlants = plants;

        // If API returns no plants, fall back to our sample data
        if (!plants || plants.length === 0) {
            console.log('No plants found in API, using sample data');
            allPlants = [...medicinalPlants];
        }

        filterPlants();
    } catch (error) {
        console.error('Error loading plants:', error);
        // Fall back to sample data if API fails
        allPlants = [...medicinalPlants];
        filterPlants();
    }
}

// Filter plants based on search and filters
function filterPlants() {
    const searchTerm = plantSearch.value.toLowerCase();
    const benefitFilterValue = benefitFilter.value;
    const difficultyFilterValue = difficultyFilter.value;

    let filteredPlants = allPlants.filter(plant => {
        const matchesSearch = plant.name.toLowerCase().includes(searchTerm) ||
            plant.scientificName.toLowerCase().includes(searchTerm);
        const matchesBenefit = !benefitFilterValue || plant.benefits.includes(benefitFilterValue);
        const matchesDifficulty = !difficultyFilterValue || plant.difficulty === difficultyFilterValue;

        return matchesSearch && matchesBenefit && matchesDifficulty;
    });

    displayPlants(filteredPlants.slice(0, displayedPlants));

    // Show/hide load more button
    loadMorePlants.style.display = filteredPlants.length > displayedPlants ? 'block' : 'none';
}

// Display plants in the grid
function displayPlants(plants) {
    plantsGrid.innerHTML = plants.map(plant => `
        <div class="plant-card" data-id="${plant.id}">
            <div class="plant-card-img">
                <img src="${plant.image}" alt="${plant.name}">
            </div>
            <div class="plant-card-body">
                <h3>${plant.name}</h3>
                <p class="scientific-name">${plant.scientificName}</p>
                <div class="benefits">
                    ${plant.benefits.map(benefit => `
                        <span class="benefit-tag">${formatBenefit(benefit)}</span>
                    `).join('')}
                </div>
                <div class="difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span class="difficulty-stars">${getDifficultyStars(plant.difficulty)}</span>
                </div>
                <button class="view-btn">View Details</button>
            </div>
        </div>
    `).join('');

    // Add event listeners to plant cards
    document.querySelectorAll('.plant-card').forEach(card => {
        card.addEventListener('click', () => {
            const plantId = parseInt(card.dataset.id);
            showPlantDetails(plantId);
        });
    });
}

// Format benefit for display
function formatBenefit(benefit) {
    const benefitNames = {
        digestive: "Digestive",
        respiratory: "Respiratory",
        immune: "Immune",
        pain: "Pain Relief",
        stress: "Stress",
        skin: "Skin Health"
    };
    return benefitNames[benefit] || benefit;
}

// Get difficulty stars
function getDifficultyStars(difficulty) {
    const stars = {
        easy: "★☆☆",
        medium: "★★☆",
        hard: "★★★"
    };
    return stars[difficulty] || difficulty;
}

// Show plant details in modal
async function showPlantDetails(plantId) {
    // First try to get the plant from allPlants (which comes from the API)
    let plant = allPlants.find(p => p.id === plantId.toString());

    // If not found, fall back to the sample data
    if (!plant) {
        plant = medicinalPlants.find(p => p.id === plantId);
    }

    if (!plant) return;

    // Check if user is logged in to show favorite button
    const isLoggedIn = localStorage.getItem('token') !== null;
    const favoriteBtn = isLoggedIn ?
        `<button class="btn outline-btn add-favorite" data-id="${plant.id}">
            <i class="fas fa-heart"></i> Add to Favorites
         </button>` :
        `<button class="btn outline-btn" onclick="window.location.hash='#auth'">
            <i class="fas fa-sign-in-alt"></i> Login to Save
         </button>`;

    modalPlantContent.innerHTML = `
        <div class="modal-plant-header">
            <div class="modal-plant-img">
                <img src="${plant.image}" alt="${plant.name}">
            </div>
            <div class="modal-plant-info">
                <h2>${plant.name}</h2>
                <p class="scientific-name">${plant.scientificName}</p>
                <div class="benefits">
                    ${plant.benefits.map(benefit => `
                        <span class="benefit-tag">${formatBenefit(benefit)}</span>
                    `).join('')}
                </div>
                <div class="difficulty">
                    <span class="difficulty-label">Difficulty:</span>
                    <span class="difficulty-stars">${getDifficultyStars(plant.difficulty)}</span>
                </div>
                <div class="plant-actions">
                    ${favoriteBtn}
                </div>
            </div>
        </div>
        
        <div class="modal-plant-details">
            <div class="detail-section">
                <h3><i class="fas fa-info-circle"></i> Description</h3>
                <p>${plant.description}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-heartbeat"></i> Medicinal Uses</h3>
                <p>${plant.medicinalUses}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-seedling"></i> Growing Information</h3>
                <p>${plant.growingInfo}</p>
            </div>
            
            <div class="detail-section">
                <h3><i class="fas fa-clipboard-list"></i> Care Tips</h3>
                <ul class="care-tips">
                    ${plant.careTips.map(tip => `<li>${tip}</li>`).join('')}
                </ul>
            </div>
        </div>
    `;

    // Add event listener to the favorite button if user is logged in
    if (isLoggedIn) {
        const addFavoriteBtn = modalPlantContent.querySelector('.add-favorite');
        if (addFavoriteBtn) {
            // Remove any existing event listeners
            const newBtn = addFavoriteBtn.cloneNode(true);
            addFavoriteBtn.parentNode.replaceChild(newBtn, addFavoriteBtn);

            // Add new event listener
            newBtn.addEventListener('click', () => {
                addToFavorites(plant.id);
            });
        }
    }

    plantModal.classList.add('show');
    document.body.style.overflow = 'hidden';
}

// Close modal
function closeModal() {
    plantModal.classList.remove('show');
    document.body.style.overflow = 'auto';
}

// Get weather data based on location
async function getWeatherData(lat, lon) {
    try {
        // Call our backend API for weather data
        const response = await fetch(`http://localhost:5000/api/weather?lat=${lat}&lon=${lon}`);

        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }

        const data = await response.json();

        if (data.success && data.weather) {
            return {
                condition: data.weather.condition,
                temperature: data.weather.temp,
                humidity: data.weather.humidity,
                icon: getWeatherIcon(data.weather.condition)
            };
        } else {
            throw new Error('Invalid weather data');
        }
    } catch (error) {
        console.error('Weather API error:', error);

        // Fall back to mock data if API fails
        console.log('Falling back to mock weather data');

        // Generate random weather data
        const weatherConditions = ["Sunny", "Partly Cloudy", "Cloudy", "Rainy", "Thunderstorm"];
        const temperatures = Array.from({ length: 41 }, (_, i) => i + 40); // 40-80°F
        const humidities = Array.from({ length: 61 }, (_, i) => i + 30); // 30-90%

        const randomCondition = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
        const randomTemp = temperatures[Math.floor(Math.random() * temperatures.length)];
        const randomHumidity = humidities[Math.floor(Math.random() * humidities.length)];

        return {
            condition: randomCondition,
            temperature: randomTemp,
            humidity: randomHumidity,
            icon: getWeatherIcon(randomCondition)
        };
    }

    // Actual API code would look like this:
    /*
    try {
        const response = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${WEATHER_API_KEY}&units=imperial`);
        
        if (!response.ok) {
            throw new Error(`Weather API error: ${response.status}`);
        }
        
        const data = await response.json();
        return {
            condition: data.weather[0].main,
            temperature: Math.round(data.main.temp),
            humidity: data.main.humidity,
            icon: getWeatherIcon(data.weather[0].main)
        };
    } catch (error) {
        console.error('Weather API Error:', error);
        throw error;
    }
    */
}

// Get weather icon based on condition
function getWeatherIcon(condition) {
    const icons = {
        "Sunny": "wi-day-sunny",
        "Clear": "wi-night-clear",
        "Partly Cloudy": "wi-day-cloudy",
        "Cloudy": "wi-cloudy",
        "Rainy": "wi-rain",
        "Thunderstorm": "wi-thunderstorm",
        "Snow": "wi-snow",
        "Fog": "wi-fog"
    };

    return icons[condition] || "wi-day-sunny";
}

// Get seasonal tips
function getSeasonalTips() {
    const month = new Date().getMonth();
    let season, tips;

    if (month >= 2 && month <= 4) { // Spring
        season = "Spring";
        tips = [
            "Start seeds indoors for warm-season medicinal herbs like holy basil and ginger",
            "Prepare garden beds by adding compost and organic matter",
            "Divide and transplant perennial herbs like echinacea and lavender",
            "Begin hardening off seedlings before transplanting outdoors"
        ];
    } else if (month >= 5 && month <= 7) { // Summer
        season = "Summer";
        tips = [
            "Harvest herbs in the morning after dew evaporates for maximum potency",
            "Regularly prune flowering herbs to encourage leaf growth",
            "Water deeply in the early morning to prevent evaporation",
            "Watch for pests and treat organically with neem oil if needed"
        ];
    } else if (month >= 8 && month <= 10) { // Fall
        season = "Fall";
        tips = [
            "Harvest and dry herbs for winter use",
            "Plant garlic and perennial herbs for next year",
            "Take cuttings of tender perennials like rosemary to overwinter indoors",
            "Mulch around perennial herbs to protect roots from freezing"
        ];
    } else { // Winter
        season = "Winter";
        tips = [
            "Plan next year's medicinal garden and order seeds",
            "Grow windowsill herbs like mint and thyme indoors",
            "Make herbal remedies with your dried harvest",
            "Prune dormant perennial herbs while they're not actively growing"
        ];
    }

    seasonalTips.innerHTML = `
        <h4>${season} Gardening Tips</h4>
        <ul>
            ${tips.map(tip => `<li>${tip}</li>`).join('')}
        </ul>
    `;
}

// Get recommended plants for current weather
function getRecommendedPlants(weather) {
    // Simple recommendation logic - in a real app this would be more sophisticated
    let recommended = [];

    if (weather.temperature > 75) {
        recommended = medicinalPlants.filter(p =>
            p.name === "Aloe Vera" || p.name === "Holy Basil" || p.name === "Peppermint"
        );
    } else if (weather.temperature > 55) {
        recommended = medicinalPlants.filter(p =>
            p.name === "Lavender" || p.name === "Echinacea" || p.name === "Calendula"
        );
    } else {
        recommended = medicinalPlants.filter(p =>
            p.name === "Thyme" || p.name === "Chamomile" || p.name === "Ginger"
        );
    }

    if (weather.condition === "Rainy") {
        recommended = recommended.filter(p => p.difficulty !== "hard");
    }

    return recommended.slice(0, 3);
}

// Setup event listeners
function setupEventListeners() {
    // Plant library filters
    plantSearch.addEventListener('input', filterPlants);
    benefitFilter.addEventListener('change', filterPlants);
    difficultyFilter.addEventListener('change', filterPlants);
    loadMorePlants.addEventListener('click', () => {
        displayedPlants += 6;
        filterPlants();
    });

    // Weather location
    getLocationBtn.addEventListener('click', async () => {
        try {
            getLocationBtn.disabled = true;
            getLocationBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Detecting...';

            // Get user location
            const position = await new Promise((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject);
            });

            currentLocation = {
                lat: position.coords.latitude,
                lon: position.coords.longitude
            };

            // Get weather data
            const weather = await getWeatherData(currentLocation.lat, currentLocation.lon);

            // Update weather display
            weatherInfo.innerHTML = `
                <div class="weather-icon">
                    <i class="wi ${weather.icon}"></i>
                </div>
                <div class="weather-details">
                    <p><strong>${weather.condition}</strong></p>
                    <p>Temperature: ${weather.temperature}°F</p>
                    <p>Humidity: ${weather.humidity}%</p>
                </div>
            `;

            // Get recommended plants
            const recommendedPlants = getRecommendedPlants(weather);
            const plantsList = document.querySelector('.weather-plants-list');
            plantsList.innerHTML = recommendedPlants.map(plant => `
                <div class="weather-plant">${plant.name}</div>
            `).join('');

            weatherPlants.style.display = 'block';

        } catch (error) {
            console.error('Location error:', error);
            weatherInfo.innerHTML = `
                <div class="weather-icon">
                    <i class="wi wi-day-sunny"></i>
                </div>
                <div class="weather-details">
                    <p>Could not get location. Please try again or enter manually.</p>
                </div>
            `;
            weatherPlants.style.display = 'none';
        } finally {
            getLocationBtn.disabled = false;
            getLocationBtn.innerHTML = '<i class="fas fa-location-arrow"></i> Use My Location';
        }
    });

    // Tab switching
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.dataset.tab;

            // Update active tab button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show corresponding tab content
            tabContents.forEach(content => {
                content.classList.remove('active');
                if (content.id === tabId) {
                    content.classList.add('active');
                }
            });
        });
    });

    // Mobile menu
    mobileMenuBtn.addEventListener('click', () => {
        mainNav.classList.toggle('active');
    });

    // Close modal
    modalClose.addEventListener('click', closeModal);
    window.addEventListener('click', (e) => {
        if (e.target === plantModal) {
            closeModal();
        }
    });

    // Smooth scrolling for navigation
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();

            const targetId = this.getAttribute('href');
            const targetElement = document.querySelector(targetId);

            if (targetElement) {
                window.scrollTo({
                    top: targetElement.offsetTop - 80,
                    behavior: 'smooth'
                });

                // Close mobile menu if open
                mainNav.classList.remove('active');
            }
        });
    });
}

// Initialize when script is loaded since DOM is already ready via React
console.log('Script loaded, initializing app directly...');

// Check if all critical elements exist before initializing
if (!document.getElementById('startScanner') ||
    !document.getElementById('captureImage') ||
    !document.getElementById('uploadBtn')) {
    console.error('Critical UI elements missing! App initialization aborted.');
} else {
    // Initialize the app
    initApp();
}

// Clean up when leaving page
window.addEventListener('beforeunload', () => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());
    }
});

// Helper function to convert Blob to base64
function blobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}