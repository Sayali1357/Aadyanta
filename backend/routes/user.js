const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Roadmap = require('../models/Roadmap');

// GET Real User Dashboard
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        let currentRoadmap = null;
        if (user.selectedCareer?.careerId) {
            currentRoadmap = await Roadmap.findOne({
                careerId: user.selectedCareer.careerId,
            }).lean();
        }

        const completedCount = user.progress?.completedTopics?.length || 0;
        const totalHours = user.progress?.totalHours || 0;
        const currentStreak = user.progress?.currentStreak || 0;
        const longestStreak = user.progress?.longestStreak || 0;

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

        const recentActivity = user.progress?.completedTopics
            ?.sort((a, b) => new Date(b.completedAt) - new Date(a.completedAt))
            .slice(0, 5)
            .map(topic => ({
                type: 'topic_completed',
                topicName: topic.topicName || topic.topicId,
                completedAt: topic.completedAt,
                timeSpent: topic.timeSpent,
            })) || [];

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

// POST Save Career Assessment
router.post('/assessment', authMiddleware, async (req, res) => {
    try {
        const { selectedCareer, assessmentData } = req.body;

        if (!selectedCareer || !selectedCareer.careerId) {
            return res.status(400).json({ message: 'Invalid career selection' });
        }

        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    selectedCareer: {
                        ...selectedCareer,
                        selectedAt: new Date(),
                    },
                    learningProfile: {
                        ...assessmentData?.learningProfile,
                    },
                },
            },
            { new: true }
        ).select('-password');

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.json({
            message: 'Assessment saved successfully',
            user,
        });
    } catch (error) {
        console.error('Save assessment error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// POST Update Topic Progress
router.post('/progress', authMiddleware, async (req, res) => {
    try {
        const { topicId, topicName, completed, timeSpent } = req.body;

        const user = await User.findById(req.userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        if (completed) {
            if (!user.progress) {
                user.progress = {
                    completedTopics: [],
                    totalHours: 0,
                    currentStreak: 0,
                    longestStreak: 0,
                };
            }

            const alreadyCompleted = user.progress.completedTopics.find(
                (t) => t.topicId === topicId
            );

            if (!alreadyCompleted) {
                user.progress.completedTopics.push({
                    topicId,
                    topicName: topicName || topicId,
                    completedAt: new Date(),
                    timeSpent: timeSpent || 0,
                    resourcesUsed: [],
                });

                if (timeSpent) {
                    user.progress.totalHours += Math.round(timeSpent / 60);
                }

                user.updateStreak();
            }

            await user.save();

            res.json({
                message: 'Progress updated successfully',
                progress: user.progress,
            });
        } else {
            res.json({ message: 'No changes made' });
        }
    } catch (error) {
        console.error('Update progress error:', error)
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
