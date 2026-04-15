const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const geminiCache = require('../services/geminiCache');
const QuizResult = require('../models/QuizResult');
const Metadata = require('../models/Metadata');

// POST /api/quiz/generate
// Generate a quiz dynamically via Gemini API
router.post('/generate', authMiddleware, async (req, res) => {
    try {
        const { moduleName, topics } = req.body;

        if (!moduleName || !topics || !Array.isArray(topics) || topics.length === 0) {
            return res.status(400).json({ message: 'moduleName and a valid topics array are required' });
        }

        const questions = await geminiCache.generateQuiz(moduleName, topics);

        if (!questions || questions.length === 0) {
            return res.status(500).json({ message: 'Failed to generate quiz questions' });
        }

        res.json({ questions });
    } catch (error) {
        console.error('Quiz generation error:', error);
        res.status(500).json({
            message: 'Failed to generate quiz',
            error: error.message,
        });
    }
});

// POST /api/quiz/submit
// Evaluate quiz answers → save result → update Metadata gap_topics with "topics to revise"
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { roadmapId, moduleId, moduleName, answers } = req.body;

        if (!roadmapId || !moduleId || !moduleName || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid payload for quiz submission. Required: roadmapId, moduleId, moduleName, answers (array)' });
        }

        let score = 0;
        const total = answers.length;
        const weakTopicsSet = new Set();
        const strongTopicsSet = new Set();

        const questionsToSave = answers.map(ans => {
            const isCorrect = ans.userAnswer === ans.correctAnswer;
            const topicName = ans.topicName || 'General';

            if (isCorrect) {
                score += 1;
                strongTopicsSet.add(topicName);
            } else {
                weakTopicsSet.add(topicName);
            }

            return {
                question: ans.question,
                options: ans.options,
                correctAnswer: ans.correctAnswer,
                userAnswer: ans.userAnswer,
                topicName,
            };
        });

        // Remove topics from weak if also answered correctly elsewhere
        strongTopicsSet.forEach(t => weakTopicsSet.delete(t));

        const weakTopics = Array.from(weakTopicsSet);
        const strongTopics = Array.from(strongTopicsSet);
        const percentage = total > 0 ? Math.round((score / total) * 100) : 0;

        // Save quiz result
        const quizResult = new QuizResult({
            userId: req.userId,
            roadmapId,
            moduleId,
            moduleName,
            questions: questionsToSave,
            score,
            total,
            weakTopics,
        });

        await quizResult.save();

        // ─── Update Metadata gap_topics with "topics to revise" ────
        const metadata = await Metadata.findOne({ user_id: req.userId });
        if (metadata) {
            // 1. ADD / UPDATE weak topics → gap_topics[]
            weakTopics.forEach(weakTopic => {
                const existingGap = metadata.gap_topics.find(
                    g => g.title === weakTopic && g.module_id === moduleId
                );

                if (existingGap) {
                    // Topic already in gap_topics — escalate severity + increment fail count
                    existingGap.fail_count = (existingGap.fail_count || 1) + 1;
                    existingGap.last_failed_at = new Date();
                    existingGap.quiz_score = score;
                    existingGap.quiz_total = total;

                    // Escalate severity based on repeat failures
                    if (existingGap.fail_count >= 3) {
                        existingGap.severity = 'high';
                    } else if (existingGap.fail_count >= 2) {
                        existingGap.severity = 'medium';
                    }
                } else {
                    // New gap topic — add with quiz context
                    metadata.gap_topics.push({
                        topic_id: moduleId,
                        title: weakTopic,
                        module_id: moduleId,
                        module_name: moduleName,
                        reason: 'low_quiz_score',
                        severity: percentage < 40 ? 'high' : percentage < 60 ? 'medium' : 'low',
                        quiz_score: score,
                        quiz_total: total,
                        fail_count: 1,
                        added_at: new Date(),
                        last_failed_at: new Date(),
                    });
                }
            });

            // 2. REMOVE strong topics from gap_topics if user now answers correctly
            //    (user revised and passed — no longer a gap)
            strongTopics.forEach(strongTopic => {
                const gapIdx = metadata.gap_topics.findIndex(
                    g => g.title === strongTopic && g.module_id === moduleId
                );
                if (gapIdx !== -1) {
                    metadata.gap_topics.splice(gapIdx, 1);
                    console.log(`✅ Removed "${strongTopic}" from gap_topics (user revised successfully)`);
                }
            });

            // 3. Award points based on score
            if (percentage >= 60) {
                metadata.awardPoints('quiz_passed');

                // Milestone: first quiz pass
                const hasQuizMilestone = metadata.milestones.find(m => m.name === 'First Quiz Passed');
                if (!hasQuizMilestone) {
                    metadata.milestones.push({
                        name: 'First Quiz Passed',
                        description: `Passed ${moduleName} quiz with ${percentage}%`,
                        achieved_at: new Date(),
                        badge_icon: '🧠',
                    });
                }
            }

            // 4. Log quiz activity
            metadata.pushRecentActivity(
                `Quiz: ${moduleName} (${score}/${total})`,
                percentage >= 60 ? 'quiz_passed' : 'quiz_failed'
            );

            // 5. Update streak
            metadata.updateStreak();

            await metadata.save();
        }

        res.status(201).json({
            message: 'Quiz submitted successfully',
            resultId: quizResult._id,
            score,
            total,
            percentage,
            weakTopics,
            strongTopics,
            gapTopicsUpdated: weakTopics.length,
            gapTopicsResolved: strongTopics.filter(t =>
                metadata?.gap_topics?.some(g => g.title === t && g.module_id === moduleId) === false
            ).length,
        });
    } catch (error) {
        console.error('Quiz submission error:', error);
        res.status(500).json({
            message: 'Failed to submit quiz',
            error: error.message,
        });
    }
});

// GET /api/quiz/result/:id
// Retrieve quiz evaluation result
router.get('/result/:id', authMiddleware, async (req, res) => {
    try {
        const { id } = req.params;

        const quizResult = await QuizResult.findOne({ _id: id, userId: req.userId });

        if (!quizResult) {
            return res.status(404).json({ message: 'Quiz result not found' });
        }

        res.json(quizResult);
    } catch (error) {
        console.error('Quiz fetch error:', error);
        res.status(500).json({
            message: 'Failed to fetch quiz result',
            error: error.message,
        });
    }
});

// GET /api/quiz/gap-topics
// Retrieve user's gap topics from Metadata for revision
router.get('/gap-topics', authMiddleware, async (req, res) => {
    try {
        const metadata = await Metadata.findOne({ user_id: req.userId }).lean();
        if (!metadata) {
            return res.json({ gapTopics: [] });
        }

        // Sort by severity (high → medium → low) then by last_failed_at (newest first)
        const sorted = (metadata.gap_topics || []).sort((a, b) => {
            const severityOrder = { high: 0, medium: 1, low: 2 };
            const aSev = severityOrder[a.severity] ?? 1;
            const bSev = severityOrder[b.severity] ?? 1;
            if (aSev !== bSev) return aSev - bSev;
            return new Date(b.last_failed_at || 0) - new Date(a.last_failed_at || 0);
        });

        res.json({
            gapTopics: sorted,
            totalGaps: sorted.length,
            highSeverity: sorted.filter(t => t.severity === 'high').length,
            mediumSeverity: sorted.filter(t => t.severity === 'medium').length,
            lowSeverity: sorted.filter(t => t.severity === 'low').length,
        });
    } catch (error) {
        console.error('Gap topics fetch error:', error);
        res.status(500).json({ message: 'Failed to fetch gap topics' });
    }
});

// DELETE /api/quiz/gap-topics/:topicTitle
// Manually resolve a gap topic (mark as revised)
router.delete('/gap-topics/:topicTitle', authMiddleware, async (req, res) => {
    try {
        const { topicTitle } = req.params;
        const { moduleId } = req.query; // optional: scope to specific module

        const metadata = await Metadata.findOne({ user_id: req.userId });
        if (!metadata) {
            return res.status(404).json({ message: 'Metadata not found' });
        }

        const gapIdx = metadata.gap_topics.findIndex(g => {
            const titleMatch = g.title === topicTitle;
            if (moduleId) return titleMatch && g.module_id === moduleId;
            return titleMatch;
        });

        if (gapIdx === -1) {
            return res.status(404).json({ message: 'Gap topic not found' });
        }

        const removed = metadata.gap_topics.splice(gapIdx, 1)[0];

        // Log revision activity
        metadata.pushRecentActivity(
            `Revised: ${removed.title}`,
            'topic_revised'
        );

        await metadata.save();

        res.json({
            message: `"${removed.title}" marked as revised and removed from gap topics`,
            remainingGaps: metadata.gap_topics.length,
        });
    } catch (error) {
        console.error('Gap topic resolve error:', error);
        res.status(500).json({ message: 'Failed to resolve gap topic' });
    }
});

module.exports = router;
