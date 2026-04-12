const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security Middleware - with relaxed cross-origin policies
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));

// CORS Configuration - Allow all origins
app.use(cors({
    origin: true, // Allow all origins and reflect the request origin
    credentials: true,
    optionsSuccessStatus: 200,
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting - General API
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

// Rate Limiting - Auth Routes (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true, // Don't count successful requests
});

// Apply rate limiters
app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/roadmap', require('./routes/roadmap'));

// MongoDB Connection with retry logic
const connectDB = async () => {
    const maxRetries = 5;
    let retries = 0;

    while (retries < maxRetries) {
        try {
            await mongoose.connect(process.env.MONGODB_URI, {
                serverSelectionTimeoutMS: 5000,
                socketTimeoutMS: 45000,
            });

            console.log('✅ MongoDB connected successfully');

            // Log database name
            console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);

            return;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`, error.message);

            if (retries === maxRetries) {
                console.error('❌ Failed to connect to MongoDB after maximum retries. Exiting...');
                process.exit(1);
            }

            // Wait before retry (exponential backoff)
            const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
            console.log(`⏳ Retrying in ${waitTime / 1000}seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Career Launch AI Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// Root endpoint
app.get('/', (req, res) => {
    res.json({
        name: 'Career Launch AI API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            roadmap: '/api/roadmap',
            health: '/api/health',
        },
    });
});

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        message: 'Route not found',
        path: req.path,
        method: req.method,
    });
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Error:', err);

    // Mongoose validation error
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message),
        });
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate entry',
            field: Object.keys(err.keyPattern)[0],
        });
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }

    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }

    // Default error
    const isDev = process.env.NODE_ENV === 'development';
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(isDev && { stack: err.stack }),
    });
});

// Start server
const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        // Connect to database first
        await connectDB();

        // Then start server
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 CORS enabled for: ALL ORIGINS (credentials supported)`);
            console.log(`⚡ Rate limiting active`);
            console.log(`\n✨ Ready to accept connections!`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

// Graceful shutdown
process.on('SIGTERM', async () => {
    console.log('\n⚠️ SIGTERM received. Closing server gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    console.log('\n⚠️ SIGINT received. Closing server gracefully...');
    await mongoose.connection.close();
    process.exit(0);
});

startServer();
