const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
    origin: true, // Allow all origins
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Auth routes - removed /api prefix since Netlify already adds /.netlify/functions/api
app.post('/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        console.log('Registration attempt:', { name, email }); // Add logging
        
        // TODO: Add your database logic here
        // For now, we'll just mock a successful response
        const user = { id: 1, name, email };
        const token = 'mock-jwt-token';

        res.status(201).json({
            message: 'Registration successful',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed', error: error.message });
    }
});

app.post('/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email }); // Add logging
        
        // TODO: Add your database logic here
        // For now, we'll just mock a successful response
        const user = { id: 1, name: 'Test User', email };
        const token = 'mock-jwt-token';

        res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(401).json({ message: 'Login failed', error: error.message });
    }
});

// Handle OPTIONS requests
app.options('*', cors());

module.exports.handler = serverless(app);
