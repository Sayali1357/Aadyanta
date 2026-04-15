const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Metadata = require('../models/Metadata');
const mongoose = require('mongoose');

// Enhanced Registration — Creates User + Metadata in a Transaction
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    ],
    async (req, res) => {
        // Validate input
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: errors.array()[0].msg,
                errors: errors.array()
            });
        }

        const session = await mongoose.startSession();
        session.startTransaction();

        try {
            const { name, email, password } = req.body;

            // Check if user exists (within transaction)
            const existingUser = await User.findOne({ email }).session(session);
            if (existingUser) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Email already registered' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // 1. Create the User document
            const user = new User({
                username: name,
                email,
                password: hashedPassword,
                isActive: true,
                createdAt: new Date(),
            });

            await user.save({ session });

            // 2. Create the Metadata document (linked to user)
            const metadata = new Metadata({
                user_id: user._id,
                current_streak: 0,
                longest_streak: 0,
                total_learning_points: 0,
                progress: 0,
                hours_invested: 0,
                topics_completed: 0,
                completed_topics: [],
                recent_activity: [],
                coming_next: [],
                gap_topics: [],
                milestones: [],
            });

            await metadata.save({ session });

            // 3. Link metadata back to user
            user.metadata_id = metadata._id;
            await user.save({ session });

            // Commit transaction
            await session.commitTransaction();

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                },
            });
        } catch (error) {
            await session.abortTransaction();
            console.error('Register error:', error);
            res.status(500).json({ message: 'Server error during registration' });
        } finally {
            session.endSession();
        }
    }
);

// Login
router.post(
    '/login',
    [
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').notEmpty().withMessage('Password is required'),
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ message: errors.array()[0].msg });
        }

        try {
            const { email, password } = req.body;

            // Find user
            const user = await User.findOne({ email });
            if (!user) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Check if account is active
            if (!user.isActive) {
                return res.status(403).json({ message: 'Account has been deactivated. Contact support.' });
            }

            // Check password
            const isMatch = await bcrypt.compare(password, user.password);
            if (!isMatch) {
                return res.status(401).json({ message: 'Invalid email or password' });
            }

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.username,
                    email: user.email,
                    hasSelectedCareer: !!user.selectedCareer?.careerId,
                },
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({ message: 'Server error during login' });
        }
    }
);

module.exports = router;
