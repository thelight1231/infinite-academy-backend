const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
    origin: '*',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS']
}));
app.use(express.json());

// Test route
app.get('/api', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Auth routes
app.post('/api/auth/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;
        
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

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
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

module.exports.handler = serverless(app);
