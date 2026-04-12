const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const mongoose = require('mongoose');

// Enhanced Registration with College Info and ACID Transaction
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
        body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
        body('collegeName').optional().trim(),
        body('graduationYear')
            .optional()
            .isInt({ min: 2024, max: 2030 })
            .withMessage('Graduation year must be between 2024 and 2030'),
        body('currentSemester')
            .optional()
            .isInt({ min: 1, max: 8 })
            .withMessage('Semester must be between 1 and 8'),
        body('learningPace')
            .optional()
            .isIn(['slow', 'moderate', 'fast'])
            .withMessage('Invalid learning pace'),
        body('dailyTimeCommitment')
            .optional()
            .isInt({ min: 1, max: 12 })
            .withMessage('Daily time must be between 1 and 12 hours'),
        body('preferredLanguage')
            .optional()
            .isIn(['english', 'hindi', 'hinglish'])
            .withMessage('Invalid language preference'),
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
            const {
                name,
                email,
                password,
                collegeName,
                graduationYear,
                currentSemester,
                learningPace,
                dailyTimeCommitment,
                preferredLanguage,
            } = req.body;

            // Check if user exists (within transaction)
            const existingUser = await User.findOne({ email }).session(session);
            if (existingUser) {
                await session.abortTransaction();
                return res.status(400).json({ message: 'Email already registered' });
            }

            // Hash password
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            // Create user with all info
            const user = new User({
                name,
                email,
                password: hashedPassword,
                collegeName,
                graduationYear,
                currentSemester: currentSemester || 1,
                learningProfile: {
                    learningPace: learningPace || 'moderate',
                    dailyTimeCommitment: dailyTimeCommitment || 2,
                    preferredLanguage: preferredLanguage || 'hinglish',
                    preferredContentTypes: ['video', 'article', 'practice'],
                },
                emailVerified: false,
                isActive: true,
                createdAt: new Date(),
            });

            await user.save({ session });

            // Commit transaction
            await session.commitTransaction();

            // Generate JWT token
            const token = jwt.sign(
                {
                    userId: user._id,
                    email: user.email,
                    collegeName: user.collegeName,
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.status(201).json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    collegeName: user.collegeName,
                    graduationYear: user.graduationYear,
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

// Login (unchanged but with better error messages)
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
                    collegeName: user.collegeName,
                },
                process.env.JWT_SECRET,
                { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
            );

            res.json({
                token,
                user: {
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    collegeName: user.collegeName,
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
