const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
    origin: 'https://infinite112.netlify.app',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Log all requests
app.use((req, res, next) => {
    console.log('Incoming request:', {
        method: req.method,
        url: req.url,
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

// Test route for auth
app.get('/auth', (req, res) => {
    console.log('Auth route hit');
    res.json({ message: 'Auth endpoint is working!' });
});

// Auth routes
app.post('/auth/register', async (req, res) => {
    console.log('Register route hit:', req.path);
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

        // Mock successful registration
        const user = { id: 1, name, email };
        const token = 'mock-jwt-token';

        console.log('Sending successful registration response');
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
    console.log('Login route hit:', req.path);
    try {
        const { email, password } = req.body;
        console.log('Login attempt:', { email });

        if (!email || !password) {
            console.log('Missing required fields');
            return res.status(400).json({
                message: 'Missing required fields',
                received: { email: !!email, password: !!password }
            });
        }

        // Mock successful login
        const user = { id: 1, name: 'Test User', email };
        const token = 'mock-jwt-token';

        console.log('Sending successful login response');
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

// Handle 404s
app.use((req, res) => {
    console.log('404 Not Found:', {
        method: req.method,
        url: req.url,
        path: req.path
    });
    res.status(404).json({ message: 'Route not found' });
});

// Error handling
app.use((err, req, res, next) => {
    console.error('Global error:', err);
    res.status(500).json({ message: 'Internal server error', error: err.message });
});

module.exports.handler = serverless(app);
