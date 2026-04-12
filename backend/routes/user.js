const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');
const mongoose = require('mongoose');

// GET Real User Dashboard - NO MOCK DATA
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // Get user with all data
        const user = await User.findById(req.userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Get roadmap if user has selected career
        let currentRoadmap = null;
        if (user.selectedCareer?.careerId) {
            currentRoadmap = await Roadmap.findOne({
                careerId: user.selectedCareer.careerId,
            }).lean();
        }

        // Calculate real statistics
        const completedCount = user.progress?.completedTopics?.length || 0;
        const totalHours = user.progress?.totalHours || 0;
        const currentStreak = user.progress?.currentStreak || 0;
        const longestStreak = user.progress?.longestStreak || 0;

        // Get upcoming topics (next 3 incomplete topics)
        let upcomingTopics = [];
        if (currentRoadmap) {
            const completedIds = user.progress?.completedTopics?.map(t => t.topicId) || [];
            const allTopics = [];

            currentRoadmap.modules?.forEach(module => {
                module.topics?.forEach(topic => {
                    if (!completedIds.includes(topic.topicId)) {
                        allTopics.push({
                            ...topic,
                            moduleName: module.title,
                        });
                    }
                });
            });

            upcomingTopics = allTopics.slice(0, 3);
        }

        // Calculate completion percentage
        let completionPercentage = 0;
        if (currentRoadmap) {
            const totalTopics = currentRoadmap.modules?.reduce(
                (sum, module) => sum + (module.topics?.length || 0),
                0
            ) || 0;

            if (totalTopics > 0) {
                completionPercentage = Math.round((completedCount / totalTopics) * 100);
            }
        }

        // Recent activity (last 5 completed topics)
        const recentActivity = user.progress?.completedTopics
            ?.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 5)
            .map(topic => ({
                type: 'topic_completed',
                topicName: topic.topicName || topic.topicId,
                completedAt: topic.completedAt,
                timeSpent: topic.timeSpent,
            })) || [];

        // Build dashboard response with REAL data only
        const dashboard = {
            user: {
                name: user.name,
                email: user.email,
                collegeName: user.collegeName,
                graduationYear: user.graduationYear,
                currentSemester: user.currentSemester,
                joinedAt: user.createdAt,
            },

            career: user.selectedCareer ? {
                name: user.selectedCareer.careerName,
                domain: user.selectedCareer.domain,
                fitScore: user.selectedCareer.fitScore,
                selectedAt: user.selectedCareer.selectedAt,
            } : null,

            progress: {
                completedTopics: completedCount,
                totalHours: totalHours,
                currentStreak: currentStreak,
                longestStreak: longestStreak,
                completionPercentage: completionPercentage,
                lastActive: user.progress?.lastActive || null,
            },

            upcomingTopics,
            recentActivity,

            achievements: user.progress?.milestones || [],

            learningProfile: user.learningProfile || {
                learningPace: 'moderate',
                dailyTimeCommitment: 2,
                preferredLanguage: 'hinglish',
            },
        };

        res.json(dashboard);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to load dashboard' });
    }
});

// GET User Profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password').lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// UPDATE User Profile
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow certain fields to be updated
        delete updates.password;
        delete updates.email;
        delete updates._id;
        delete updates.createdAt;
        delete updates.progress;

        const user = await User.findByIdAndUpdate(
            req.userId,
            { $set: updates },
            { new: true, runValidators: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json(user);
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST Save Career Assessment with ACID Transaction
router.post('/assessment', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { selectedCareer, assessmentData } = req.body;

        // Validate
        if (!selectedCareer || !selectedCareer.careerId) {
            await session.abortTransaction();
            return res.status(400).json({ message: 'Invalid career selection' });
        }

        // Update user with assessment results
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    selectedCareer: {
                        ...selectedCareer,
                        selectedAt: new Date(),
                    },
                    learningProfile: {
                        ...assessmentData.learningProfile,
                    },
                },
            },
            { session, new: true }
        ).select('-password');

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'User not found' });
        }

        await session.commitTransaction();

        res.json({
            message: 'Assessment saved successfully',
            user,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Save assessment error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
});

// POST Update Topic Progress with ACID Transaction
router.post('/progress', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { topicId, topicName, completed, timeSpent } = req.body;

        const user = await User.findById(req.userId).session(session);

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'User not found' });
        }

        if (completed) {
            // Initialize progress if not exists
            if (!user.progress) {
                user.progress = {
                    completedTopics: [],
                    totalHours: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                };
            }

            // Check if already completed
            const alreadyCompleted = user.progress.completedTopics.find(
                (t) => t.topicId === topicId
            );

            if (!alreadyCompleted) {
                // Add to completed topics
                user.progress.completedTopics.push({
                    topicId,
                    topicName: topicName || topicId,
                    completedAt: new Date(),
                    timeSpent: timeSpent || 0,
                    resourcesUsed: [],
                });

                // Update total hours
                if (timeSpent) {
                    user.progress.totalHours += Math.round(timeSpent / 60); // Convert minutes to hours
                }

                // Update streak using model method
                user.updateStreak();
            }

            await user.save({ session });
            await session.commitTransaction();

            res.json({
                message: 'Progress updated successfully',
                progress: user.progress,
            });
        } else {
            await session.abortTransaction();
            res.json({ message: 'No changes made' });
        }
    } catch (error) {
        await session.abortTransaction();
        console.error('Update progress error:', error);
        res.status(500).json({ message: 'Server error' });
    } finally {
        session.endSession();
    }
});

module.exports = router;
