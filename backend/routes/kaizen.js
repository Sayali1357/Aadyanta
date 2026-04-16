const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const KaizenProgress = require('../models/KaizenProgress');
const Metadata = require('../models/Metadata');
const Roadmap = require('../models/Roadmap');
const QuizResult = require('../models/QuizResult');

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  GET /api/kaizen/status
//  Returns the Kaizen status: locked, waiting, ready, or complete
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/status', authMiddleware, async (req, res) => {
    try {
        const metadata = await Metadata.findOne({ user_id: req.userId }).lean();
        if (!metadata) {
            return res.json({ status: 'locked', message: 'Complete your roadmap to unlock Kaizen revision.' });
        }

        // Check if progress is 100% (all topics completed)
        if (metadata.progress < 100) {
            return res.json({
                status: 'locked',
                progress: metadata.progress,
                message: 'Complete your roadmap to unlock Kaizen revision.',
            });
        }

        // Roadmap is complete — check for existing Kaizen record
        // Find the user's active roadmap
        const User = require('../models/User');
        const user = await User.findById(req.userId).lean();
        const roadmapId = user?.selectedCareer?.careerId;

        if (!roadmapId) {
            return res.json({ status: 'locked', message: 'No career selected.' });
        }

        let kaizen = await KaizenProgress.findOne({ userId: req.userId, roadmapId }).lean();

        if (!kaizen) {
            // First time — auto-initialize
            const roadmap = await Roadmap.findOne({ roadmapId }).lean();
            const totalModules = roadmap?.modules?.length || 4;

            kaizen = await KaizenProgress.create({
                userId: req.userId,
                roadmapId,
                currentDay: 1,
                totalModules,
                modulesRemaining: totalModules,
                nextReviewDate: new Date(),
            });
            kaizen = kaizen.toObject();
        }

        if (kaizen.isComplete) {
            return res.json({
                status: 'complete',
                totalSessions: kaizen.history.length,
                message: 'You have completed all Kaizen revision stages! 🎉',
            });
        }

        const now = new Date();
        const nextReview = new Date(kaizen.nextReviewDate);

        if (now < nextReview) {
            const diffMs = nextReview - now;
            const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
            const diffHours = Math.ceil(diffMs / (1000 * 60 * 60));
            return res.json({
                status: 'waiting',
                nextReviewDate: kaizen.nextReviewDate,
                daysRemaining: diffDays,
                hoursRemaining: diffHours,
                currentDay: kaizen.currentDay,
                modulesRemaining: kaizen.modulesRemaining,
                totalModules: kaizen.totalModules,
                sessionsCompleted: kaizen.history.length,
                message: `Next revision available in ${diffDays} day${diffDays !== 1 ? 's' : ''}.`,
            });
        }

        // Session is ready
        return res.json({
            status: 'ready',
            currentDay: kaizen.currentDay,
            modulesRemaining: kaizen.modulesRemaining,
            totalModules: kaizen.totalModules,
            sessionsCompleted: kaizen.history.length,
        });
    } catch (error) {
        console.error('Kaizen status error:', error);
        res.status(500).json({ message: 'Failed to get Kaizen status', error: error.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  GET /api/kaizen/flashcards
//  Returns flashcards ONLY if roadmap complete AND date >= nextReviewDate
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.get('/flashcards', authMiddleware, async (req, res) => {
    try {
        // 1. Check roadmap completion
        const metadata = await Metadata.findOne({ user_id: req.userId }).lean();
        if (!metadata || metadata.progress < 100) {
            return res.status(403).json({ message: 'Roadmap not yet completed.' });
        }

        // 2. Get user's roadmap
        const User = require('../models/User');
        const user = await User.findById(req.userId).lean();
        const roadmapId = user?.selectedCareer?.careerId;
        if (!roadmapId) {
            return res.status(400).json({ message: 'No career selected.' });
        }

        // 3. Get or create Kaizen progress
        let kaizen = await KaizenProgress.findOne({ userId: req.userId, roadmapId });
        if (!kaizen) {
            const roadmap = await Roadmap.findOne({ roadmapId }).lean();
            const totalModules = roadmap?.modules?.length || 4;
            kaizen = await KaizenProgress.create({
                userId: req.userId,
                roadmapId,
                currentDay: 1,
                totalModules,
                modulesRemaining: totalModules,
                nextReviewDate: new Date(),
            });
        }

        if (kaizen.isComplete) {
            return res.status(400).json({ message: 'Kaizen revision is already complete.' });
        }

        // 4. Check timing
        const now = new Date();
        if (now < new Date(kaizen.nextReviewDate)) {
            return res.status(403).json({ message: 'Next session is not yet available.' });
        }

        // 5. Load roadmap modules
        const roadmap = await Roadmap.findOne({ roadmapId }).lean();
        if (!roadmap || !roadmap.modules || roadmap.modules.length === 0) {
            return res.status(404).json({ message: 'Roadmap modules not found.' });
        }

        // 6. Select modules for this session (take first N where N = modulesRemaining)
        const modulesToReview = roadmap.modules.slice(0, kaizen.modulesRemaining);

        // 7. Get 1 quiz question per module — try from QuizResult first, then fallback
        const quizResults = await QuizResult.find({
            userId: req.userId,
            roadmapId,
        }).lean();

        const flashcards = modulesToReview.map((mod, idx) => {
            // Find a quiz result for this module
            const moduleQuiz = quizResults.find(qr => qr.moduleId === mod.module_id);
            let question = null;

            if (moduleQuiz && moduleQuiz.questions && moduleQuiz.questions.length > 0) {
                // Pick a random question from the quiz results
                const randomIdx = Math.floor(Math.random() * moduleQuiz.questions.length);
                const q = moduleQuiz.questions[randomIdx];
                question = {
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.correctAnswer,
                };
            } else {
                // Fallback: generate a conceptual question from the module
                const topicNames = (mod.topics || []).map(t => t.title).join(', ');
                question = {
                    question: `Which concept is a core part of the "${mod.title}" module?`,
                    options: [
                        mod.topics?.[0]?.title || 'Fundamentals',
                        'Unrelated Topic A',
                        'Unrelated Topic B',
                        'None of the above',
                    ],
                    correctAnswer: mod.topics?.[0]?.title || 'Fundamentals',
                };
            }

            return {
                index: idx + 1,
                moduleId: mod.module_id,
                moduleName: mod.title,
                question,
            };
        });

        res.json({
            currentDay: kaizen.currentDay,
            totalModules: kaizen.totalModules,
            modulesInSession: flashcards.length,
            flashcards,
        });
    } catch (error) {
        console.error('Kaizen flashcards error:', error);
        res.status(500).json({ message: 'Failed to load flashcards', error: error.message });
    }
});

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//  POST /api/kaizen/submit
//  Save answers, update progression (currentDay++, modulesRemaining--, nextReviewDate)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { answers } = req.body;
        // answers: [{ moduleId, moduleName, question, options, correctAnswer, userAnswer }]

        if (!answers || !Array.isArray(answers) || answers.length === 0) {
            return res.status(400).json({ message: 'Answers array is required.' });
        }

        const User = require('../models/User');
        const user = await User.findById(req.userId).lean();
        const roadmapId = user?.selectedCareer?.careerId;
        if (!roadmapId) {
            return res.status(400).json({ message: 'No career selected.' });
        }

        const kaizen = await KaizenProgress.findOne({ userId: req.userId, roadmapId });
        if (!kaizen) {
            return res.status(404).json({ message: 'Kaizen progress not found.' });
        }

        if (kaizen.isComplete) {
            return res.status(400).json({ message: 'Kaizen is already complete.' });
        }

        // Score the answers
        let score = 0;
        const sessionAnswers = answers.map(a => {
            const isCorrect = a.userAnswer === a.correctAnswer;
            if (isCorrect) score++;
            return {
                moduleId: a.moduleId,
                moduleName: a.moduleName,
                question: a.question,
                options: a.options || [],
                correctAnswer: a.correctAnswer,
                userAnswer: a.userAnswer,
                isCorrect,
            };
        });

        // Record history
        kaizen.history.push({
            day: kaizen.currentDay,
            modulesReviewed: answers.length,
            answers: sessionAnswers,
            score,
            total: answers.length,
            completedAt: new Date(),
        });

        // ── Spaced Repetition Progression ────────────────────
        // nextReviewDate = today + currentDay (in days)
        const nextReview = new Date();
        nextReview.setDate(nextReview.getDate() + kaizen.currentDay);

        kaizen.currentDay += 1;
        kaizen.modulesRemaining -= 1;
        kaizen.nextReviewDate = nextReview;

        // Check if Kaizen is finished (no more modules to review)
        if (kaizen.modulesRemaining <= 0) {
            kaizen.isComplete = true;
        }

        await kaizen.save();

        // Update metadata — award points for Kaizen
        const metadata = await Metadata.findOne({ user_id: req.userId });
        if (metadata) {
            metadata.total_learning_points += 25; // Kaizen bonus
            metadata.pushRecentActivity(
                `Kaizen Day ${kaizen.currentDay - 1}: ${score}/${answers.length}`,
                'kaizen_session'
            );
            metadata.updateStreak();

            // Milestone: first Kaizen session
            const hasKaizenMilestone = metadata.milestones.find(m => m.name === 'Kaizen Initiated');
            if (!hasKaizenMilestone) {
                metadata.milestones.push({
                    name: 'Kaizen Initiated',
                    description: 'Completed first spaced repetition session',
                    achieved_at: new Date(),
                    badge_icon: '🧘',
                });
            }

            // Milestone: Kaizen complete
            if (kaizen.isComplete) {
                metadata.milestones.push({
                    name: 'Kaizen Master',
                    description: 'Completed all spaced repetition stages',
                    achieved_at: new Date(),
                    badge_icon: '🏆',
                });
                metadata.total_learning_points += 200;
            }

            await metadata.save();
        }

        res.json({
            message: 'Session submitted successfully.',
            score,
            total: answers.length,
            accuracy: Math.round((score / answers.length) * 100),
            isComplete: kaizen.isComplete,
            nextDay: kaizen.isComplete ? null : kaizen.currentDay,
            nextReviewDate: kaizen.isComplete ? null : kaizen.nextReviewDate,
            modulesRemaining: kaizen.modulesRemaining,
        });
    } catch (error) {
        console.error('Kaizen submit error:', error);
        res.status(500).json({ message: 'Failed to submit Kaizen session', error: error.message });
    }
});

module.exports = router;
