const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');
const geminiCache = require('../services/geminiCache');
const QuizResult = require('../models/QuizResult');

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
           require('fs').appendFileSync('debug.log', 'Quiz questions array is empty or null\n');
           return res.status(500).json({ message: 'Failed to generate quiz questions' });
        }

        res.json({ questions });
    } catch (error) {
        require('fs').appendFileSync('debug.log', 'Quiz generation error: ' + error.message + '\n' + error.stack + '\n');
        console.error('Quiz generation error:', error);
        res.status(500).json({
            message: 'Failed to generate quiz',
            error: error.message,
        });
    }
});

// POST /api/quiz/submit
// Evaluate quiz answers and save result
router.post('/submit', authMiddleware, async (req, res) => {
    try {
        const { roadmapId, moduleId, moduleName, answers } = req.body;

        if (!roadmapId || !moduleId || !moduleName || !answers || !Array.isArray(answers)) {
            return res.status(400).json({ message: 'Invalid payload for quiz submission. Required: roadmapId, moduleId, moduleName, answers (array)' });
        }

        let score = 0;
        const total = answers.length;
        const weakTopicsSet = new Set();

        const questionsToSave = answers.map(ans => {
            const isCorrect = ans.userAnswer === ans.correctAnswer;
            if (isCorrect) {
                score += 1;
            } else {
                weakTopicsSet.add(ans.topicName || 'General'); // Fallback if topicName is missing
            }

            return {
                question: ans.question,
                options: ans.options,
                correctAnswer: ans.correctAnswer,
                userAnswer: ans.userAnswer,
                topicName: ans.topicName || 'General'
            };
        });

        const weakTopics = Array.from(weakTopicsSet);

        // Save result
        const quizResult = new QuizResult({
            userId: req.userId,
            roadmapId,
            moduleId,
            moduleName,
            questions: questionsToSave,
            score,
            total,
            weakTopics
        });

        await quizResult.save();

        res.status(201).json({
            message: 'Quiz submitted successfully',
            resultId: quizResult._id,
            score,
            total,
            weakTopics
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

module.exports = router;
