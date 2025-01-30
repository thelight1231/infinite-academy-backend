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

// Connect to MongoDB
connectDB().catch(console.error);

// Middleware
app.use(cors({
    origin: 'https://infinite112.netlify.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Logging middleware
app.use((req, res, next) => {
    console.log('Request received:', {
        method: req.method,
        path: req.path,
        body: req.body,
        headers: req.headers
    });
    next();
});

// Test route
app.get('/', (req, res) => {
    console.log('Root route hit');
    res.json({ message: 'API is working!' });
});

// Auth routes
app.post('/.netlify/functions/api/auth/register', async (req, res) => {
    console.log('Register route hit');
    try {
        const { name, email, password } = req.body;
        console.log('Registration data:', { name, email });

        if (!name || !email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields',
                received: { name: !!name, email: !!email, password: !!password }
            });
        }

        // Check if user exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log('User already exists:', email);
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create new user
        const user = new User({ name, email, password });
        await user.save();
        console.log('User created:', user._id);

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
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

app.post('/.netlify/functions/api/auth/login', async (req, res) => {
    console.log('Login route hit');
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', email);

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
        console.error('Login error:', error);
        res.status(401).json({ message: 'Login failed', error: error.message });
    }
});

// Handle 404s
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.path);
    res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

// Export the serverless function
module.exports.handler = serverless(app);
