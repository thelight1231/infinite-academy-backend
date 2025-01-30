const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        if (!process.env.MONGODB_URI) {
            throw new Error('MONGODB_URI is not defined in environment variables');
        }

        console.log('[DEBUG] Attempting to connect to MongoDB...');
        
        const conn = await mongoose.connect(process.env.MONGODB_URI, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
            serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
            socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
        });

        console.log('[DEBUG] MongoDB Connected Successfully');
        console.log(`[DEBUG] Connected to database: ${conn.connection.name}`);
        console.log(`[DEBUG] Host: ${conn.connection.host}`);
        console.log(`[DEBUG] Port: ${conn.connection.port}`);

        // Handle connection events
        mongoose.connection.on('error', err => {
            console.error('[DEBUG] MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('[DEBUG] MongoDB disconnected');
        });

        mongoose.connection.on('reconnected', () => {
            console.log('[DEBUG] MongoDB reconnected');
        });

        return conn;
    } catch (error) {
        console.error('[DEBUG] MongoDB connection error:', error);
        console.error('[DEBUG] Error details:', {
            name: error.name,
            message: error.message,
            stack: error.stack
        });
        throw error;
    }
};

module.exports = connectDB;
