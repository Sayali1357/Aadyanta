const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/auth'); // ensure user is logged in
const keyManager = require('../services/geminiKeyManager');

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

// POST /api/interview/chat — Uses KEY 3 (interview)
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, dialogueHistory, role } = req.body;

        // TOKEN OPTIMIZATION: Use key manager with 'interview' feature key
        const model = keyManager.getModel('interview');
        
        // TOKEN OPTIMIZATION: Compact system instruction + terse history format
        const prompt = `Role: ${role} interviewer. Context:\n${dialogueHistory}\n\nCandidate: ${message}\n\nRespond as interviewer (2-3 sentences max). Ask next question or give brief feedback.`;
        
        const startTime = Date.now();
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const responseTimeMs = Date.now() - startTime;

        // Track tokens for dashboard analytics
        keyManager.trackTokens('interview', prompt, text, responseTimeMs);
        
        res.status(200).json({ success: true, reply: text });
    } catch (error) {
        keyManager.trackError('interview');
        console.error('Interview Chat Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// POST /api/interview/generate-feedback — Uses KEY 3 (interview)
router.post('/generate-feedback', authMiddleware, async (req, res) => {
    try {
        const { role, mode, dialogueHistory } = req.body;
        
        let evalData = null;
        
        if (!dialogueHistory || dialogueHistory.trim() === '') {
            evalData = {
                technicalScore: 0,
                communicationScore: 0,
                finalAssessment: "No dialogue history was recorded for this interview session. The interview ended prematurely.",
                categoryScores: []
            };
        } else {
            // TOKEN OPTIMIZATION: Compact evaluation prompt (~35% fewer tokens)
            const model = keyManager.getModel('interview');
            
            const prompt = `Evaluate this ${role} mock interview. Dialogue:\n${dialogueHistory}\n\nReturn ONLY JSON (no markdown): {"technicalScore":<0-100>,"communicationScore":<0-100>,"finalAssessment":"<1 paragraph>","categoryScores":[{"name":"<skill>","score":<0-100>,"comment":"<1 sentence>"}]}`;
            
            try {
                const startTime = Date.now();
                const result = await model.generateContent(prompt);
                let text = result.response.text();
                const responseTimeMs = Date.now() - startTime;

                // Track tokens for dashboard analytics
                keyManager.trackTokens('interview', prompt, text, responseTimeMs);

                text = text.replace(/```json/i, '').replace(/```/g, '').trim();
                if (text.startsWith('json')) text = text.substring(4).trim();
                
                evalData = JSON.parse(text);
            } catch (err) {
                keyManager.trackError('interview');
                console.error("Gemini Parsing Error:", err);
                evalData = {
                    technicalScore: 30,
                    communicationScore: 30,
                    finalAssessment: "AI generation failed. A default placeholder feedback of 30% was assigned.",
                    categoryScores: [
                        { name: "System Override", score: 30, comment: "Placeholder due to API error" }
                    ]
                };
            }
        }

        if (!evalData || typeof evalData !== 'object' || Array.isArray(evalData)) {
            evalData = {
                technicalScore: 30,
                communicationScore: 30,
                finalAssessment: "AI evaluation malformed. Generated baseline 30% placeholder.",
                categoryScores: []
            };
        }

        // Validate structure
        const safeTechScore = parseInt(evalData?.technicalScore) || 30;
        const safeCommScore = parseInt(evalData?.communicationScore) || 30;
        let safeCategoryScores = Array.isArray(evalData?.categoryScores) ? evalData.categoryScores : [];
        
        safeCategoryScores = safeCategoryScores.map(c => ({
            name: c?.name || 'General',
            score: parseInt(c?.score) || 30,
            comment: c?.comment || 'General comment'
        }));

        // Save to DB
        const interview = new Interview({
            userId: req.userId,
            role,
            mode,
            technicalScore: safeTechScore,
            communicationScore: safeCommScore,
            finalAssessment: evalData?.finalAssessment || 'Interview completed.',
            categoryScores: safeCategoryScores
        });

        const savedInterview = await interview.save();
        res.status(201).json({ success: true, interview: savedInterview });
    } catch (error) {
        console.error('Generate Feedback Error:', error);
        res.status(500).json({ success: false, message: error.message || 'Server Error' });
    }
});

module.exports = router;
