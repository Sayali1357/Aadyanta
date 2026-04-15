const express = require('express');
const router = express.Router();
const Interview = require('../models/Interview');
const authMiddleware = require('../middleware/auth'); // ensure user is logged in
const { GoogleGenerativeAI } = require('@google/generative-ai');

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

// POST /api/interview/chat
router.post('/chat', authMiddleware, async (req, res) => {
    try {
        const { message, dialogueHistory, role } = req.body;
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
        // Using a standard flash model name for Gemini
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        
        let prompt = `You are an expert technical interviewer for the role: ${role}. You are conducting a mock interview via text chat.\n`;
        prompt += `Here is the dialogue history:\n${dialogueHistory}\n\n`;
        prompt += `Candidate says: ${message}\n`;
        prompt += `Reply as the interviewer. Keep it realistic, professional, and succinct (max 2-3 sentences). Ask the next question or give brief feedback and move on.`;
        
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        
        res.status(200).json({ success: true, reply: text });
    } catch (error) {
        console.error('Interview Chat Error:', error);
        res.status(500).json({ success: false, message: 'Server Error' });
    }
});

// POST /api/interview/generate-feedback
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
            const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY);
            const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
            
            let prompt = `You are an expert technical interviewer evaluating a mock interview for the role: ${role}.\n`;
            prompt += `Analyze the following dialogue history and provide a detailed evaluation.\n`;
            prompt += `Dialogue History:\n${dialogueHistory}\n\n`;
            prompt += `You must format your response strictly as a JSON block with the following keys:\n`;
            prompt += `- "technicalScore": a number out of 100\n`;
            prompt += `- "communicationScore": a number out of 100\n`;
            prompt += `- "finalAssessment": a short summary paragraph of their overall performance\n`;
            prompt += `- "categoryScores": an array of 2-4 objects, each with "name" (string, e.g., "Problem Solving"), "score" (number out of 100), and "comment" (string constraint to 1 sentence)\n`;
            prompt += `Return NOTHING but the JSON object. Do not include markdown code blocks.`;
            
            try {
                const result = await model.generateContent(prompt);
                let text = result.response.text();
                // Clean up markdown syntax if Gemini includes it
                text = text.replace(/```json/i, '').replace(/```/g, '').trim();
                
                // Sometimes Gemini adds "json" prefix
                if (text.startsWith('json')) text = text.substring(4).trim();
                
                evalData = JSON.parse(text);
            } catch (err) {
                console.error("Gemini Parsing Error:", err);
                evalData = {
                    technicalScore: 30,
                    communicationScore: 30,
                    finalAssessment: "AI generation failed due to an access exception. A default placeholder feedback mask of 30% was assigned to prevent system failure.",
                    categoryScores: [
                        { name: "System Override", score: 30, comment: "Placeholder generated due to network block" }
                    ]
                };
            }
        }

        if (!evalData || typeof evalData !== 'object' || Array.isArray(evalData)) {
            // Fallback if AI returned something valid in JSON but not an object (like a string or array)
            evalData = {
                technicalScore: 30,
                communicationScore: 30,
                finalAssessment: "AI evaluation malformed. Generated baseline 30% safe placeholder.",
                categoryScores: []
            };
        }

        // Validate structure to prevent Mongoose schema errors
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
