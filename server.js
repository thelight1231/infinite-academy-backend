const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(express.json());
app.use(cors({
    origin: ['https://thelight1231.github.io', 'http://localhost:5000'],
    credentials: true
}));

// Routes
app.post('/api/auth/login', (req, res) => {
    const { email, password } = req.body;
    // Demo authentication
    if (email === 'demo@example.com' && password === 'demo123') {
        res.json({
            user: {
                name: 'Demo User',
                email: email
            },
            token: 'demo-token-123'
        });
    } else {
        res.status(401).json({ message: 'Invalid credentials' });
    }
});

app.post('/api/auth/register', (req, res) => {
    const { name, email, password } = req.body;
    // Demo registration
    res.json({
        user: {
            name: name,
            email: email
        },
        token: 'demo-token-123'
    });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
