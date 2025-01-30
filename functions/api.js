const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Import models and database connection
const connectDB = require('../config/database');
const User = require('../models/User');

const app = express();
const router = express.Router();

// Connect to MongoDB
connectDB().catch(console.error);

// Enable CORS for all routes
app.use(cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    preflightContinue: false,
    optionsSuccessStatus: 204
}));

app.use(express.json());

// Debug middleware
app.use((req, res, next) => {
    console.log(`[DEBUG] ${req.method} ${req.url}`);
    console.log('[DEBUG] Headers:', req.headers);
    console.log('[DEBUG] Body:', req.body);
    next();
});

// Logging middleware
app.use((req, res, next) => {
    console.log('Request received:', {
        method: req.method,
        path: req.path,
        originalUrl: req.originalUrl,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Test route
router.get('/', (req, res) => {
    console.log('[DEBUG] Root route hit');
    res.json({ message: 'API is working!' });
});

// Auth routes
router.post('/auth/register', async (req, res) => {
    console.log('[DEBUG] Register route hit');
    try {
        const { name, email, password } = req.body;
        console.log('[DEBUG] Registration data:', { name, email });

        if (!name || !email || !password) {
            console.log('[DEBUG] Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields',
                received: { name: !!name, email: !!email, password: !!password }
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('[DEBUG] User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();
        console.log('[DEBUG] User created:', user._id);

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        // Return success
        res.status(201).json({
            message: 'Registration successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('[DEBUG] Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

router.post('/auth/login', async (req, res) => {
    console.log('[DEBUG] Login route hit');
    try {
        const { email, password } = req.body;
        console.log('[DEBUG] Login attempt:', email);

        // Find user
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Check password
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                name: user.name,
                email: user.email
            },
            token
        });
    } catch (error) {
        console.error('[DEBUG] Login error:', error);
        res.status(401).json({ message: 'Login failed', error: error.message });
    }
});

// Mount router at root
app.use(router);

// Handle 404s
app.use((req, res) => {
    console.log('[DEBUG] 404 Not Found:', {
        method: req.method,
        url: req.url,
        originalUrl: req.originalUrl,
        path: req.path
    });
    res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('[DEBUG] Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Export the serverless function
module.exports.handler = serverless(app);
