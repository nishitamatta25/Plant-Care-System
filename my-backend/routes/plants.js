const express = require('express');
const router = express.Router();
const Plant = require('../models/Plant');

// @route   GET /api/plants
// @desc    Get all plants
// @access  Public
router.get('/', async (req, res) => {
    try {
        const plants = await Plant.find();
        res.json(plants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/plants/filter
// @desc    Filter plants by benefit or difficulty
// @access  Public
router.get('/filter', async (req, res) => {
    try {
        const { benefit, difficulty } = req.query;
        let query = {};

        if (benefit) {
            query.benefits = benefit;
        }

        if (difficulty) {
            query.difficulty = difficulty;
        }

        const plants = await Plant.find(query);
        res.json(plants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/plants/search
// @desc    Search plants by name or scientific name
// @access  Public
router.get('/search', async (req, res) => {
    try {
        const { name } = req.query;
        if (!name) {
            return res.status(400).json({ msg: 'Please provide a search term' });
        }

        // Case-insensitive regex search on both common name and scientific name
        const match = new RegExp(name, 'i');
        const plants = await Plant.find({
            $or: [
                { name: { $regex: match } },
                { scientificName: { $regex: match } }
            ]
        });

        res.json(plants);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/plants/:id
// @desc    Get plant by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const plant = await Plant.findById(req.params.id);

        if (!plant) {
            return res.status(404).json({ msg: 'Plant not found' });
        }

        res.json(plant);
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Plant not found' });
        }

        res.status(500).send('Server Error');
    }
});

// @route   POST /api/plants
// @desc    Create a plant
// @access  Private (would require auth middleware in production)
router.post('/', async (req, res) => {
    try {
        const newPlant = new Plant(req.body);
        const plant = await newPlant.save();
        res.json(plant);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;