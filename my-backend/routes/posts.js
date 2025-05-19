const express = require('express');
const router = express.Router();
const Post = require('../models/Post');

// @route   GET /api/posts
// @desc    Get all posts
// @access  Public
router.get('/', async (req, res) => {
    try {
        const posts = await Post.find()
            .sort({ createdAt: -1 })
            .populate('author', ['name', 'avatar']);

        res.json(posts);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/posts/:id
// @desc    Get post by ID
// @access  Public
router.get('/:id', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id)
            .populate('author', ['name', 'avatar'])
            .populate('comments.user', ['name', 'avatar']);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.json(post);
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.status(500).send('Server Error');
    }
});

// @route   POST /api/posts
// @desc    Create a post
// @access  Private (would require auth middleware in production)
router.post('/', async (req, res) => {
    try {
        // In production, this would use the user ID from the auth middleware
        // For now, we'll just create a mock post
        const newPost = new Post({
            title: req.body.title,
            content: req.body.content,
            author: '60d0fe4f5311236168a109ca', // Mock user ID
            tags: req.body.tags
        });

        const post = await newPost.save();
        res.json(post);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/posts/:id/comment
// @desc    Comment on a post
// @access  Private (would require auth middleware in production)
router.post('/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);

        if (!post) {
            return res.status(404).json({ msg: 'Post not found' });
        }

        // In production, this would use the user ID from the auth middleware
        const newComment = {
            user: '60d0fe4f5311236168a109ca', // Mock user ID
            text: req.body.text
        };

        post.comments.unshift(newComment);
        await post.save();

        res.json(post.comments);
    } catch (err) {
        console.error(err.message);

        if (err.kind === 'ObjectId') {
            return res.status(404).json({ msg: 'Post not found' });
        }

        res.status(500).send('Server Error');
    }
});

module.exports = router;