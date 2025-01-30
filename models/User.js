const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Name is required'],
        trim: true,
        minlength: [2, 'Name must be at least 2 characters long'],
        maxlength: [50, 'Name cannot exceed 50 characters']
    },
    email: {
        type: String,
        required: [true, 'Email is required'],
        unique: true,
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address']
    },
    password: {
        type: String,
        required: [true, 'Password is required'],
        minlength: [6, 'Password must be at least 6 characters long']
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    try {
        if (!this.isModified('password')) {
            return next();
        }

        console.log('[DEBUG] Hashing password for user:', this.email);
        
        // Generate salt
        const salt = await bcrypt.genSalt(10);
        if (!salt) {
            throw new Error('Failed to generate salt');
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(this.password, salt);
        if (!hashedPassword) {
            throw new Error('Failed to hash password');
        }

        this.password = hashedPassword;
        console.log('[DEBUG] Password hashed successfully');
        
        next();
    } catch (error) {
        console.error('[DEBUG] Error in password hashing:', error);
        next(error);
    }
});

// Method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        console.log('[DEBUG] Comparing passwords for user:', this.email);
        
        if (!candidatePassword) {
            throw new Error('No password provided for comparison');
        }

        const isMatch = await bcrypt.compare(candidatePassword, this.password);
        console.log('[DEBUG] Password comparison result:', isMatch);
        
        return isMatch;
    } catch (error) {
        console.error('[DEBUG] Error comparing passwords:', error);
        throw error;
    }
};

// Add indexes
userSchema.index({ email: 1 }, { unique: true });

const User = mongoose.model('User', userSchema);

module.exports = User;
