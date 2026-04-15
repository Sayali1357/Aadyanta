const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/auth'); // ensure user is logged in

// POST /api/interview/feedback
router.post('/feedback', authMiddleware, async (req, res) => {
    try {
        const { role, mode, technicalScore, communicationScore, finalAssessment, categoryScores } = req.body;
        
        const interview = new Interview({
            userId: req.userId,
            role,
            mode,
            technicalScore,
            communicationScore,
            finalAssessment,
            categoryScores
        });

        const savedInterview = await interview.save();
        res.status(201).json({ success: true, interview: savedInterview });
    } catch (error) {
        console.error('Save Interview Feedback Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// GET /api/interview/history
router.get('/history', authMiddleware, async (req, res) => {
    try {
        const interviews = await Interview.find({ userId: req.userId }).sort({ completedAt: -1 });
        res.status(200).json({ success: true, interviews });
    } catch (error) {
        console.error('Fetch Interviews Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

module.exports = router;
