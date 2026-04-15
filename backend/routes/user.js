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
                    attentionScore: req.body.attentionData?.score || null,
                    distractionCount: req.body.attentionData?.distractions || 0,
                    emotions: req.body.attentionData?.emotions || null,
                    quizResult: req.body.quizResult || null,
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

// GET Gap Analysis (Phase 7 & 9)
router.get('/gap-analysis', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('progress selectedCareer.careerName');
        const defaultResponse = {
            skillGaps: [], missingCertifications: [], requiredProjects: [], weakAcademicConcepts: [],
            recommendations: { courses: [], practiceTests: [], projectSuggestions: [], certifications: [] },
            overallAttention: 0, averageQuizScore: 0, analysis: 'Insufficient data for complete analysis.'
        };

        if (!user || !user.progress || !user.progress.completedTopics || user.progress.completedTopics.length === 0) {
            return res.json(defaultResponse);
        }

        const recentTopics = user.progress.completedTopics.slice(-10);
        let weakAreas = new Set();
        let attentionSum = 0;
        let quizScoreSum = 0;
        let validQuizCount = 0;

        recentTopics.forEach(topic => {
            if (topic.quizResult && topic.quizResult.weakAreas) {
                topic.quizResult.weakAreas.forEach(area => weakAreas.add(area));
                quizScoreSum += topic.quizResult.score || 0;
                validQuizCount++;
            }
            if (topic.attentionScore) {
                 attentionSum += topic.attentionScore;
            }
        });

        const avgAttention = recentTopics.length ? Math.round(attentionSum / recentTopics.length) : 0;
        const avgQuiz = validQuizCount ? Math.round(quizScoreSum / validQuizCount) : 0;

        const gapsArray = Array.from(weakAreas);
        
        // Simulating AI generating detailed gap outputs
        res.json({
            skillGaps: gapsArray.length > 0 ? gapsArray : ['Advanced Problem Solving'],
            missingCertifications: ['Industry Standard Cloud Certification (e.g., AWS/GCP)', 'Domain Specific Foundational Cert'],
            requiredProjects: gapsArray.map(gap => `Build a project heavily utilizing ${gap}`),
            weakAcademicConcepts: gapsArray.length > 0 ? gapsArray.slice(0,2) : ['Core Fundamentals'],
            recommendations: {
                courses: gapsArray.map(gap => `Remedial Course: ${gap} Foundations`),
                practiceTests: ['Weekly comprehensive aptitude test', 'Topic-specific quick quizzes'],
                projectSuggestions: ['Create a full-stack portfolio piece addressing your weakest skill'],
                certifications: ['Complete a free online verified certificate for ' + (gapsArray[0] || 'your core domain')]
            },
            overallAttention: avgAttention || 85,
            averageQuizScore: avgQuiz || 70,
            analysis: `We detected ${gapsArray.length} specific skill gaps based on your recent quiz scores.`
        });
    } catch (error) {
        console.error('Gap analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
