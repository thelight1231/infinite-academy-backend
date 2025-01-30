const express = require('express');
const serverless = require('serverless-http');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept']
}));
app.use(express.json());

// Test route
app.get('/', (req, res) => {
    res.json({ message: 'API is working!' });
});

// Auth routes
app.post('/auth/register', async (req, res) => {
    console.log('Register route hit');
    console.log('Request body:', req.body);
    
    try {
        const { name, email, password } = req.body;
        
        if (!name || !email || !password) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { name: !!name, email: !!email, password: !!password }
            });
        }

        // TODO: Add your database logic here
        // For now, we'll just mock a successful response
        const user = { id: 1, name, email };
        const token = 'mock-jwt-token';

        console.log('Sending successful response:', { user, token });
        
        return res.status(201).json({
            message: 'Registration successful',
            user,
            token
        });
    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ 
            message: 'Registration failed', 
            error: error.message 
        });
    }
});

app.post('/auth/login', async (req, res) => {
    console.log('Login route hit');
    console.log('Request body:', req.body);
    
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Missing required fields',
                received: { email: !!email, password: !!password }
            });
        }

        // TODO: Add your database logic here
        // For now, we'll just mock a successful response
        const user = { id: 1, name: 'Test User', email };
        const token = 'mock-jwt-token';

        console.log('Sending successful response:', { user, token });
        
        return res.json({
            message: 'Login successful',
            user,
            token
        });
    } catch (error) {
        console.error('Login error:', error);
        return res.status(401).json({ 
            message: 'Login failed', 
            error: error.message 
        });
    }
});

// Handle OPTIONS requests
app.options('*', cors());

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({ 
        message: 'Internal server error', 
        error: err.message 
    });
});

// Handle 404s
app.use((req, res) => {
    console.log('404 Not Found:', req.method, req.url);
    res.status(404).json({ message: 'Route not found' });
});

module.exports.handler = serverless(app);
