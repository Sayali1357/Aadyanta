const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

dotenv.config();

const app = express();

// Security Middleware
app.use(helmet({
    crossOriginResourcePolicy: false,
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
}));

// CORS Configuration
app.use(cors({
    origin: true,
    credentials: true,
    optionsSuccessStatus: 200,
}));

// Body Parser
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Rate Limiting
const apiLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
});

const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 5,
    message: 'Too many login attempts, please try again after 15 minutes.',
    skipSuccessfulRequests: true,
});

app.use('/api/', apiLimiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/user', require('./routes/user'));
app.use('/api/roadmap', require('./routes/roadmap'));
app.use('/api/interview', require('./routes/interviewRoutes'));
app.use('/api/quiz', require('./routes/quiz'));

// MongoDB Connection
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
            console.log(`📊 Database: ${mongoose.connection.db.databaseName}`);
            return;
        } catch (error) {
            retries++;
            console.error(`❌ MongoDB connection attempt ${retries}/${maxRetries} failed:`, error.message);
            if (retries === maxRetries) {
                console.error('❌ Failed to connect to MongoDB after maximum retries. Exiting...');
                process.exit(1);
            }
            const waitTime = Math.min(1000 * Math.pow(2, retries), 10000);
            console.log(`⏳ Retrying in ${waitTime / 1000} seconds...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
        }
    }
};

// Health check
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        message: 'Career Launch AI Backend is running',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV || 'development',
        database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    });
});

// Root
app.get('/', (req, res) => {
    res.json({
        name: 'Career Launch AI API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth',
            user: '/api/user',
            roadmap: '/api/roadmap',
            quiz: '/api/quiz',
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
    if (err.name === 'ValidationError') {
        return res.status(400).json({
            message: 'Validation error',
            errors: Object.values(err.errors).map(e => e.message),
        });
    }
    if (err.code === 11000) {
        return res.status(400).json({
            message: 'Duplicate entry',
            field: Object.keys(err.keyPattern)[0],
        });
    }
    if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({ message: 'Invalid token' });
    }
    if (err.name === 'TokenExpiredError') {
        return res.status(401).json({ message: 'Token expired' });
    }
    const isDev = process.env.NODE_ENV === 'development';
    res.status(err.status || 500).json({
        message: err.message || 'Internal server error',
        ...(isDev && { stack: err.stack }),
    });
});

const PORT = process.env.PORT || 3001;

const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`🚀 Server running on http://localhost:${PORT}`);
            console.log(`📝 Environment: ${process.env.NODE_ENV || 'development'}`);
            console.log(`🔒 CORS enabled for: ALL ORIGINS`);
            console.log(`⚡ Rate limiting active`);
            console.log(`✅ Quiz route registered at /api/quiz`);
            console.log(`\n✨ Ready to accept connections!`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

process.on('SIGTERM', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

process.on('SIGINT', async () => {
    await mongoose.connection.close();
    process.exit(0);
});

startServer();
