const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const User = require('../models/User');
const Metadata = require('../models/Metadata');
const Roadmap = require('../models/Roadmap');
const mongoose = require('mongoose');
const keyManager = require('../services/geminiKeyManager');
const geminiCache = require('../services/geminiCache');

// ────────────────────────────────────────────────────────────
// GET /api/user/dashboard — Real User Dashboard from 3 collections
// ────────────────────────────────────────────────────────────
router.get('/dashboard', authMiddleware, async (req, res) => {
    try {
        // 1. Get user (lean auth info)
        const user = await User.findById(req.userId)
            .select('-password')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Get metadata (all learning stats)
        let metadata = await Metadata.findOne({ user_id: req.userId }).lean();

        // Auto-create metadata if it doesn't exist (backward compat)
        if (!metadata) {
            const newMeta = new Metadata({ user_id: req.userId });
            await newMeta.save();
            metadata = newMeta.toObject();

            // Link to user if not linked
            if (!user.metadata_id) {
                await User.findByIdAndUpdate(req.userId, { metadata_id: newMeta._id });
            }
        }

        // 3. Get active roadmap
        let currentRoadmap = null;
        if (user.selectedCareer?.careerId) {
            currentRoadmap = await Roadmap.findOne({
                career_id: user.selectedCareer.careerId,
            }).lean();
        }

        // 4. Build dashboard response
        const completedCount = metadata.topics_completed || 0;
        const totalHours = metadata.hours_invested || 0;
        const currentStreak = metadata.current_streak || 0;
        const longestStreak = metadata.longest_streak || 0;

        // Calculate completion percentage from roadmap
        let completionPercentage = metadata.progress || 0;
        if (currentRoadmap && completionPercentage === 0) {
            const totalTopics = currentRoadmap.modules?.reduce(
                (sum, module) => sum + (module.topics?.length || 0),
                0
            ) || 0;

            if (totalTopics > 0) {
                completionPercentage = Math.round((completedCount / totalTopics) * 100);
            }
        }

        // Recent activity from metadata queue
        const recentActivity = (metadata.recent_activity || []).map(activity => ({
            type: 'topic_completed',
            topicName: activity.topic_name,
            completedAt: activity.completed_at,
            action: activity.action,
        }));

        // Coming next from metadata
        const upcomingTopics = metadata.coming_next || [];

        // Build response
        const dashboard = {
            user: {
                name: user.username,
                email: user.email,
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
                lastActive: metadata.last_active || null,
                totalLearningPoints: metadata.total_learning_points || 0,
            },

            upcomingTopics,
            recentActivity,
            gapTopics: metadata.gap_topics || [],
            achievements: metadata.milestones || [],
        };

        res.json(dashboard);
    } catch (error) {
        console.error('Dashboard error:', error);
        res.status(500).json({ message: 'Failed to load dashboard' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/user/profile — User Profile
// ────────────────────────────────────────────────────────────
router.get('/profile', authMiddleware, async (req, res) => {
    try {
        const user = await User.findById(req.userId).select('-password').lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Include metadata stats in profile
        const metadata = await Metadata.findOne({ user_id: req.userId }).lean();

        res.json({
            ...user,
            // Map username to name for backward compatibility
            name: user.username,
            metadata: metadata || {},
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// PUT /api/user/profile — Update User Profile
// ────────────────────────────────────────────────────────────
router.put('/profile', authMiddleware, async (req, res) => {
    try {
        const updates = req.body;

        // Don't allow certain fields to be updated
        delete updates.password;
        delete updates.email;
        delete updates._id;
        delete updates.createdAt;
        delete updates.metadata_id;

        // Map 'name' to 'username' for backward compat
        if (updates.name) {
            updates.username = updates.name;
            delete updates.name;
        }

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

// ────────────────────────────────────────────────────────────
// POST /api/user/assessment — Save Career Assessment + Initialize Metadata
// ────────────────────────────────────────────────────────────
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

        // Update user with career selection
        const user = await User.findByIdAndUpdate(
            req.userId,
            {
                $set: {
                    selectedCareer: {
                        ...selectedCareer,
                        selectedAt: new Date(),
                    },
                },
            },
            { session, new: true }
        ).select('-password');

        if (!user) {
            await session.abortTransaction();
            return res.status(404).json({ message: 'User not found' });
        }

        // Initialize/update metadata for the user
        let metadata = await Metadata.findOne({ user_id: req.userId }).session(session);
        if (!metadata) {
            metadata = new Metadata({ user_id: req.userId });
        }

        // Add career selection milestone
        const alreadyHasMilestone = metadata.milestones.find(
            m => m.name === 'Career Path Selected'
        );
        if (!alreadyHasMilestone) {
            metadata.milestones.push({
                name: 'Career Path Selected',
                description: `Selected ${selectedCareer.careerName} as career path`,
                achieved_at: new Date(),
                badge_icon: '🎯',
            });
            // Award points for completing assessment
            metadata.awardPoints('topic_completed'); // 100 pts for starting
        }

        // Update streak
        metadata.updateStreak();

        // Push assessment activity
        metadata.pushRecentActivity(
            `Career Assessment: ${selectedCareer.careerName}`,
            'assessment_completed'
        );

        await metadata.save({ session });

        // Link metadata to user if not linked
        if (!user.metadata_id) {
            await User.findByIdAndUpdate(req.userId, { metadata_id: metadata._id }, { session });
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

// ────────────────────────────────────────────────────────────
// POST /api/user/career-recommend — AI Career Recommendations
// Uses backend KEY 1 (roadmap) for token optimization
// ────────────────────────────────────────────────────────────
router.post('/career-recommend', authMiddleware, async (req, res) => {
    try {
        const { skills, goals } = req.body;

        if (!skills || !Array.isArray(skills) || skills.length === 0) {
            return res.status(400).json({ message: 'Skills array is required' });
        }

        const careers = await geminiCache.recommendCareers({
            interests: skills.slice(0, 5),
            skills,
            education: 'undergraduate',
            careerGoals: goals || 'Find the best career match',
        });

        res.json({ careers });
    } catch (error) {
        console.error('Career recommendation error:', error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
    }
});

// ────────────────────────────────────────────────────────────
// POST /api/user/progress — Update Topic Progress
// Writes to Metadata collection instead of User
// ────────────────────────────────────────────────────────────
router.post('/progress', authMiddleware, async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { topicId, topicName, completed, timeSpent } = req.body;

        // Get or create metadata
        let metadata = await Metadata.findOne({ user_id: req.userId }).session(session);

        if (!metadata) {
            metadata = new Metadata({ user_id: req.userId });
        }

        if (completed) {
            // Check if already completed
            const alreadyCompleted = metadata.completed_topics.find(
                (t) => t.topic_id === topicId
            );

            if (!alreadyCompleted) {
                // Add to completed topics
                metadata.completed_topics.push({
                    topic_id: topicId,
                    topic_name: topicName || topicId,
                    completed_at: new Date(),
                    time_spent: timeSpent || 0,
                    attention_score: req.body.attentionData?.score || null,
                    distraction_count: req.body.attentionData?.distractions || 0,
                    quiz_result: req.body.quizResult || null,
                });

                // Increment topics_completed count
                metadata.topics_completed += 1;

                // Update hours invested
                if (timeSpent) {
                    metadata.hours_invested += Math.round(timeSpent / 60); // minutes → hours
                }

                // Update streak
                metadata.updateStreak();

                // Push to recent activity queue
                metadata.pushRecentActivity(topicName || topicId, 'completed');

                // Award points
                metadata.awardPoints('topic_completed');

                // Update coming_next — remove completed topic and recalculate
                metadata.coming_next = metadata.coming_next.filter(
                    t => t.topic_id !== topicId
                );

                // Update overall progress (if roadmap available)
                const user = await User.findById(req.userId).session(session);
                if (user?.selectedCareer?.careerId) {
                    const roadmap = await Roadmap.findOne({
                        career_id: user.selectedCareer.careerId,
                    }).session(session);

                    if (roadmap) {
                        const totalTopics = roadmap.modules?.reduce(
                            (sum, mod) => sum + (mod.topics?.length || 0),
                            0
                        ) || 0;

                        if (totalTopics > 0) {
                            metadata.progress = Math.round(
                                (metadata.topics_completed / totalTopics) * 100
                            );
                        }

                        // Recalculate coming_next (next 3 incomplete topics)
                        const completedIds = metadata.completed_topics.map(t => t.topic_id);
                        const nextTopics = [];

                        for (const mod of (roadmap.modules || [])) {
                            for (const topic of (mod.topics || [])) {
                                if (!completedIds.includes(topic.topic_id)) {
                                    nextTopics.push({
                                        topic_id: topic.topic_id,
                                        title: topic.title,
                                        module_name: mod.title,
                                        estimated_hours: topic.estimated_hours,
                                    });
                                    if (nextTopics.length >= 3) break;
                                }
                            }
                            if (nextTopics.length >= 3) break;
                        }

                        metadata.coming_next = nextTopics;
                    }
                }

                // Check if quiz identified gap topics
                if (req.body.quizResult?.weak_areas?.length > 0) {
                    req.body.quizResult.weak_areas.forEach(weakArea => {
                        const alreadyGap = metadata.gap_topics.find(
                            g => g.title === weakArea
                        );
                        if (!alreadyGap) {
                            metadata.gap_topics.push({
                                topic_id: topicId,
                                title: weakArea,
                                reason: 'low_quiz_score',
                                severity: 'medium',
                            });
                        }
                    });
                }
            }

            await metadata.save({ session });
            await session.commitTransaction();

            res.json({
                message: 'Progress updated successfully',
                progress: {
                    topics_completed: metadata.topics_completed,
                    hours_invested: metadata.hours_invested,
                    current_streak: metadata.current_streak,
                    progress: metadata.progress,
                    total_learning_points: metadata.total_learning_points,
                    coming_next: metadata.coming_next,
                },
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

// ────────────────────────────────────────────────────────────
// GET /api/user/gap-analysis — Gap Analysis from Metadata
// ────────────────────────────────────────────────────────────
router.get('/gap-analysis', authMiddleware, async (req, res) => {
    try {
        const metadata = await Metadata.findOne({ user_id: req.userId }).lean();

        const defaultResponse = {
            skillGaps: [],
            missingCertifications: [],
            requiredProjects: [],
            weakAcademicConcepts: [],
            recommendations: {
                courses: [],
                practiceTests: [],
                projectSuggestions: [],
                certifications: [],
            },
            overallAttention: 0,
            averageQuizScore: 0,
            analysis: 'Insufficient data for complete analysis.',
        };

        if (!metadata || !metadata.completed_topics || metadata.completed_topics.length === 0) {
            return res.json(defaultResponse);
        }

        // Pull gap topics directly from metadata
        const gapTopics = metadata.gap_topics || [];
        const gapsArray = gapTopics.map(g => g.title);

        // Calculate attention and quiz averages from completed topics
        const recentTopics = metadata.completed_topics.slice(-10);
        let attentionSum = 0;
        let quizScoreSum = 0;
        let validQuizCount = 0;

        recentTopics.forEach(topic => {
            if (topic.quiz_result && topic.quiz_result.weak_areas) {
                quizScoreSum += topic.quiz_result.score || 0;
                validQuizCount++;
            }
            if (topic.attention_score) {
                attentionSum += topic.attention_score;
            }
        });

        const avgAttention = recentTopics.length ? Math.round(attentionSum / recentTopics.length) : 0;
        const avgQuiz = validQuizCount ? Math.round(quizScoreSum / validQuizCount) : 0;

        res.json({
            skillGaps: gapsArray.length > 0 ? gapsArray : ['Advanced Problem Solving'],
            missingCertifications: ['Industry Standard Cloud Certification (e.g., AWS/GCP)', 'Domain Specific Foundational Cert'],
            requiredProjects: gapsArray.map(gap => `Build a project heavily utilizing ${gap}`),
            weakAcademicConcepts: gapsArray.length > 0 ? gapsArray.slice(0, 2) : ['Core Fundamentals'],
            recommendations: {
                courses: gapsArray.map(gap => `Remedial Course: ${gap} Foundations`),
                practiceTests: ['Weekly comprehensive aptitude test', 'Topic-specific quick quizzes'],
                projectSuggestions: ['Create a full-stack portfolio piece addressing your weakest skill'],
                certifications: ['Complete a free online verified certificate for ' + (gapsArray[0] || 'your core domain')],
            },
            overallAttention: avgAttention || 85,
            averageQuizScore: avgQuiz || 70,
            analysis: `We detected ${gapsArray.length} specific skill gaps based on your recent quiz scores.`,
        });
    } catch (error) {
        console.error('Gap analysis error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/user/metadata — Direct access to user metadata
// ────────────────────────────────────────────────────────────
router.get('/metadata', authMiddleware, async (req, res) => {
    try {
        let metadata = await Metadata.findOne({ user_id: req.userId }).lean();

        if (!metadata) {
            // Auto-create if missing
            const newMeta = new Metadata({ user_id: req.userId });
            await newMeta.save();
            metadata = newMeta.toObject();
        }

        res.json(metadata);
    } catch (error) {
        console.error('Get metadata error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/user/metadata-dashboard — Full Metadata Collection Dashboard
// Returns all metadata fields with analytics for the current account
// ────────────────────────────────────────────────────────────
router.get('/metadata-dashboard', authMiddleware, async (req, res) => {
    try {
        // 1. Get user info
        const user = await User.findById(req.userId).select('-password').lean();
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // 2. Get metadata (auto-create if missing)
        let metadata = await Metadata.findOne({ user_id: req.userId }).lean();
        if (!metadata) {
            const newMeta = new Metadata({ user_id: req.userId });
            await newMeta.save();
            metadata = newMeta.toObject();
        }

        // 3. Get roadmap info
        let roadmap = null;
        let totalRoadmapTopics = 0;
        if (user.selectedCareer?.careerId) {
            roadmap = await Roadmap.findOne({
                career_id: user.selectedCareer.careerId,
            }).lean();

            if (roadmap) {
                totalRoadmapTopics = roadmap.modules?.reduce(
                    (sum, mod) => sum + (mod.topics?.length || 0), 0
                ) || 0;
            }
        }

        // 4. Compute analytics from completed_topics
        const completedTopics = metadata.completed_topics || [];
        const totalTimeSpent = completedTopics.reduce((s, t) => s + (t.time_spent || 0), 0);
        const avgTimePerTopic = completedTopics.length > 0
            ? Math.round(totalTimeSpent / completedTopics.length)
            : 0;

        // Quiz performance analytics
        const quizScores = completedTopics
            .filter(t => t.quiz_result && t.quiz_result.score != null)
            .map(t => ({
                topicName: t.topic_name,
                score: t.quiz_result.score,
                total: t.quiz_result.total_questions,
                accuracy: t.quiz_result.accuracy,
                weakAreas: t.quiz_result.weak_areas || [],
                strongAreas: t.quiz_result.strong_areas || [],
            }));

        const avgQuizScore = quizScores.length > 0
            ? Math.round(quizScores.reduce((s, q) => s + q.score, 0) / quizScores.length)
            : 0;

        // Attention analytics
        const attentionScores = completedTopics
            .filter(t => t.attention_score != null)
            .map(t => ({
                topicName: t.topic_name,
                score: t.attention_score,
                distractions: t.distraction_count || 0,
            }));

        const avgAttention = attentionScores.length > 0
            ? Math.round(attentionScores.reduce((s, a) => s + a.score, 0) / attentionScores.length)
            : 0;

        // Completion timeline (topics completed per day)
        const completionTimeline = {};
        completedTopics.forEach(t => {
            if (t.completed_at) {
                const day = new Date(t.completed_at).toISOString().split('T')[0];
                completionTimeline[day] = (completionTimeline[day] || 0) + 1;
            }
        });

        // 5. Build comprehensive response
        res.json({
            account: {
                userId: user._id,
                username: user.username,
                email: user.email,
                joinedAt: user.createdAt,
                career: user.selectedCareer || null,
            },

            // Core stats
            stats: {
                currentStreak: metadata.current_streak || 0,
                longestStreak: metadata.longest_streak || 0,
                totalLearningPoints: metadata.total_learning_points || 0,
                progress: metadata.progress || 0,
                hoursInvested: metadata.hours_invested || 0,
                topicsCompleted: metadata.topics_completed || 0,
                totalRoadmapTopics,
                lastActive: metadata.last_active || null,
            },

            // Completed topic details
            completedTopics: completedTopics.map(t => ({
                topicId: t.topic_id,
                topicName: t.topic_name,
                completedAt: t.completed_at,
                timeSpent: t.time_spent,
                attentionScore: t.attention_score,
                distractionCount: t.distraction_count,
                quizResult: t.quiz_result || null,
            })),

            // Recent activity queue
            recentActivity: metadata.recent_activity || [],

            // Coming next topics
            comingNext: metadata.coming_next || [],

            // Gap topics
            gapTopics: metadata.gap_topics || [],

            // Milestones / Achievements
            milestones: metadata.milestones || [],

            // Computed analytics
            analytics: {
                avgTimePerTopic,
                totalTimeSpentMinutes: totalTimeSpent,
                avgQuizScore,
                avgAttentionScore: avgAttention,
                quizPerformance: quizScores,
                attentionHistory: attentionScores,
                completionTimeline: Object.entries(completionTimeline).map(([date, count]) => ({ date, count })),
                topicsWithQuiz: quizScores.length,
                topicsWithAttention: attentionScores.length,
            },
        });
    } catch (error) {
        console.error('Metadata dashboard error:', error);
        res.status(500).json({ message: 'Failed to load metadata dashboard' });
    }
});

// ────────────────────────────────────────────────────────────
// GET /api/user/api-stats — API Key Usage + Token Analytics
// Returns per-key token usage, cache efficiency, estimated costs
// ────────────────────────────────────────────────────────────
router.get('/api-stats', authMiddleware, async (req, res) => {
    try {
        const cacheStats = await geminiCache.getCacheStats();
        res.json({
            status: 'ok',
            timestamp: new Date().toISOString(),
            ...cacheStats,
        });
    } catch (error) {
        console.error('API stats error:', error);
        res.status(500).json({ message: 'Failed to get API stats' });
    }
});

module.exports = router;
